from __future__ import annotations

import asyncio
import json
import logging
import secrets
import time
from collections import defaultdict, deque
from contextlib import asynccontextmanager
from typing import Literal
from uuid import UUID

import asyncpg
from fastapi import (
    Depends,
    FastAPI,
    Header,
    Query,
    Request,
    WebSocket,
    WebSocketDisconnect,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict, Field, ValidationError

from .cards import LEVELS
from .catalogue import CATALOGUE
from .config import Settings
from .domain import GameError, now_ms, public_room
from .repository import PostgresRooms, initialize_connection

log = logging.getLogger("wilder")


class CreateRoom(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: str = Field(min_length=1, max_length=24)
    map: str = Field(default="verdant", max_length=32)
    mode: Literal["classic", "score"] = "classic"
    difficulty: Literal["soft", "drinking", "teasing", "spicy", "hot"] = "soft"
    challenges: bool = True
    hotseat: bool = False
    players: list[str] = Field(default_factory=list, max_length=7)


class JoinRoom(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: str = Field(min_length=1, max_length=24)


class Command(BaseModel):
    model_config = ConfigDict(extra="forbid")
    type: Literal[
        "SELECT_CHARACTER",
        "SET_NAME",
        "SET_READY",
        "START_GAME",
        "ROLL_DIE",
        "CHOOSE",
        "RESOLVE_ROAD",
        "SUBMIT_CHALLENGE",
        "CHALLENGE_TAP",
        "SKIP_CHALLENGE",
        "REQUEST_REMATCH",
        "SET_WORLD",
        "SET_DIFFICULTY",
        "SKIP_TURN",
    ]
    expected_version: int = Field(ge=1)
    idempotency_key: UUID
    payload: dict = Field(default_factory=dict)


class Hub:
    def __init__(self):
        self.sockets: dict[str, dict[WebSocket, str]] = defaultdict(dict)
        self.locks: dict[str, asyncio.Lock] = defaultdict(asyncio.Lock)
        self.tickets: dict[str, tuple[str, str, float]] = {}
        self.requests: dict[str, deque] = defaultdict(deque)

    def connected(self, room):
        return set(self.sockets[room].values())

    def throttle(self, key, limit=90):
        now = time.monotonic()
        queue = self.requests[key]
        while queue and queue[0] < now - 60:
            queue.popleft()
        if len(queue) >= limit:
            raise GameError("rate_limited", "Please slow down for a moment.", 429)
        queue.append(now)
        if len(self.requests) > 5000:
            self.requests = defaultdict(
                deque, {k: q for k, q in self.requests.items() if q and q[-1] > now - 60}
            )

    def ticket(self, room, actor):
        now = time.monotonic()
        self.tickets = {k: v for k, v in self.tickets.items() if v[2] > now}
        ticket = secrets.token_urlsafe(24)
        self.tickets[ticket] = (room, actor, now + 30)
        return ticket

    def envelope(self, result):
        return {**result, "room": public_room(result["room"], self.connected(result["room"]["id"]))}

    async def publish(self, result):
        room_id = result["room"]["id"]
        message = {"type": "UPDATE", **self.envelope(result)}
        dead = []
        for socket in list(self.sockets[room_id]):
            try:
                await asyncio.wait_for(socket.send_json(message), timeout=3)
            except (RuntimeError, WebSocketDisconnect, TimeoutError):
                dead.append(socket)
        for socket in dead:
            self.sockets[room_id].pop(socket, None)


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or Settings()
    hub = Hub()

    @asynccontextmanager
    async def lifespan(app):
        pool = await asyncpg.create_pool(
            settings.database_url, min_size=1, max_size=10, init=initialize_connection
        )
        repo = PostgresRooms(pool)
        await repo.migrate()
        app.state.repo, app.state.hub = repo, hub

        async def deadlines():
            while True:
                await asyncio.sleep(1)
                try:
                    for room in await repo.expired():
                        async with hub.locks[room["id"]]:
                            result = await repo.timeout(room["id"])
                            if result:
                                await hub.publish(result)
                except Exception:
                    log.exception("Deadline worker failed; retrying on next tick")

        worker = asyncio.create_task(deadlines())
        yield
        worker.cancel()
        try:
            await worker
        except asyncio.CancelledError:
            pass
        for sockets in list(hub.sockets.values()):
            for socket in list(sockets):
                await socket.close(code=1012)
        await pool.close()

    app = FastAPI(title="Wilder realtime game API", version="0.2.0", lifespan=lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_methods=["GET", "POST"],
        allow_headers=["Authorization", "Content-Type"],
    )

    @app.exception_handler(GameError)
    async def game_error(request, error):
        return JSONResponse(
            status_code=error.status,
            content={"error": {"code": error.code, "message": error.message}},
        )

    @app.middleware("http")
    async def limits(request: Request, call_next):
        try:
            content_length = int(request.headers.get("content-length", "0"))
        except ValueError:
            return JSONResponse(
                status_code=400,
                content={"error": {"code": "invalid_length", "message": "Invalid content length."}},
            )
        if content_length > 16384:
            return JSONResponse(
                status_code=413,
                content={"error": {"code": "too_large", "message": "Request too large."}},
            )
        if request.url.path.startswith("/api/"):
            try:
                hub.throttle("ip:" + (request.client.host if request.client else "unknown"), 240)
            except GameError as error:
                return JSONResponse(
                    status_code=error.status,
                    content={"error": {"code": error.code, "message": error.message}},
                )
        return await call_next(request)

    async def session(authorization: str = Header(default="")):
        if not authorization.startswith("Bearer "):
            raise GameError("unauthorized", "Join a room to continue.", 401)
        return await app.state.repo.authenticate(authorization[7:])

    def authorize(room_id: str, actor: dict):
        if actor["roomId"] != room_id:
            raise GameError("wrong_room", "This session cannot access another room.", 403)

    async def execute(room_id: str, actor: dict, command: Command):
        authorize(room_id, actor)
        hub.throttle("actor:" + actor["playerId"], 100)
        data = command.model_dump(mode="json")
        if len(json.dumps(data)) > 8192:
            raise GameError("too_large", "Command too large.", 413)
        async with hub.locks[room_id]:
            if command.type == "SKIP_TURN":
                snapshot = await app.state.repo.snapshot(room_id, actor["playerId"])
                current = snapshot["game"]["players"][snapshot["game"]["active"]]["id"]
                if current in hub.connected(room_id):
                    raise GameError(
                        "player_connected", "A connected player must finish their own turn."
                    )
            result, changed = await app.state.repo.command(room_id, actor["playerId"], data)
            if changed:
                await hub.publish(result)
            return hub.envelope(result)

    session_dependency = Depends(session)

    @app.get("/api/health")
    async def health():
        await app.state.repo.pool.fetchval("SELECT 1")
        return {"status": "ok", "database": "postgresql", "realtime": "websocket"}

    @app.get("/api/v1/catalogue")
    async def catalogue():
        return {**CATALOGUE, "difficulties": list(LEVELS.values())}

    @app.post("/api/v1/rooms")
    async def create(body: CreateRoom, request: Request):
        hub.throttle("create:" + (request.client.host if request.client else "?"), 12)
        room, actor, token = await app.state.repo.create(
            body.name,
            body.map,
            body.mode,
            body.challenges,
            body.hotseat,
            body.players,
            body.difficulty,
        )
        return {
            "room": public_room(room),
            "playerId": actor,
            "token": token,
            "serverTime": now_ms(),
        }

    @app.post("/api/v1/rooms/{code}/join")
    async def join(code: str, body: JoinRoom):
        if len(code) != 6 or not code.isalnum():
            raise GameError("invalid_code", "Room codes contain six letters or digits.", 422)
        # The database row lock serializes joins with character selections and start.
        room, actor, token = await app.state.repo.join(code.upper(), body.name)
        async with hub.locks[room["id"]]:
            await hub.publish(
                {
                    "room": room,
                    "event": {
                        "type": "PLAYER_JOINED",
                        "payload": {"actorId": actor},
                        "seq": room["eventSeq"],
                    },
                    "serverTime": now_ms(),
                }
            )
        return {
            "room": public_room(room, hub.connected(room["id"])),
            "playerId": actor,
            "token": token,
            "serverTime": now_ms(),
        }

    @app.get("/api/v1/rooms/{room_id}")
    async def snapshot(room_id: UUID, actor=session_dependency):
        authorize(str(room_id), actor)
        return {
            "room": public_room(
                await app.state.repo.snapshot(str(room_id), actor["playerId"]),
                hub.connected(str(room_id)),
            ),
            "serverTime": now_ms(),
        }

    @app.get("/api/v1/rooms/{room_id}/events")
    async def events(
        room_id: UUID, after_seq: int = Query(default=0, ge=0), actor=session_dependency
    ):
        authorize(str(room_id), actor)
        return {"events": await app.state.repo.events(str(room_id), actor["playerId"], after_seq)}

    @app.post("/api/v1/rooms/{room_id}/commands")
    async def command(room_id: UUID, body: Command, actor=session_dependency):
        return await execute(str(room_id), actor, body)

    @app.post("/api/v1/rooms/{room_id}/ticket")
    async def ticket(room_id: UUID, actor=session_dependency):
        authorize(str(room_id), actor)
        return {"ticket": hub.ticket(str(room_id), actor["playerId"]), "expiresIn": 30}

    @app.websocket("/api/v1/rooms/{room_id}/ws")
    async def websocket(socket: WebSocket, room_id: UUID, ticket: str = ""):
        if socket.headers.get("origin") not in settings.allowed_origins:
            await socket.close(code=1008)
            return
        credential = hub.tickets.pop(ticket, None)
        if not credential or credential[0] != str(room_id) or credential[2] < time.monotonic():
            await socket.close(code=1008)
            return
        actor = {"roomId": str(room_id), "playerId": credential[1]}
        await socket.accept()
        hub.sockets[str(room_id)][socket] = actor["playerId"]
        snapshot = await app.state.repo.snapshot(str(room_id), actor["playerId"])
        await socket.send_json(
            {
                "type": "SNAPSHOT",
                "room": public_room(snapshot, hub.connected(str(room_id))),
                "serverTime": now_ms(),
            }
        )
        await hub.publish(
            {
                "room": snapshot,
                "event": {"type": "PRESENCE", "payload": {}, "seq": snapshot["eventSeq"]},
                "serverTime": now_ms(),
            }
        )
        try:
            while True:
                raw = await asyncio.wait_for(socket.receive_text(), timeout=65)
                if len(raw) > 8192:
                    await socket.close(code=1009)
                    break
                data = {}
                try:
                    hub.throttle("socket:" + actor["playerId"], 180)
                    data = json.loads(raw)
                    if not isinstance(data, dict):
                        raise TypeError("Command must be an object")
                    if data.get("type") == "PING":
                        await socket.send_json({"type": "PONG", "serverTime": now_ms()})
                        continue
                    command = Command.model_validate(data)
                    result = await execute(str(room_id), actor, command)
                    await socket.send_json({"type": "ACK", **result})
                except (ValidationError, ValueError, TypeError):
                    await socket.send_json(
                        {
                            "type": "REJECTED",
                            "commandId": data.get("idempotency_key")
                            if isinstance(data, dict)
                            else None,
                            "error": {"code": "invalid_command", "message": "Invalid command."},
                        }
                    )
                except GameError as error:
                    command_id = data.get("idempotency_key") if isinstance(data, dict) else None
                    await socket.send_json(
                        {
                            "type": "REJECTED",
                            "commandId": command_id,
                            "error": {"code": error.code, "message": error.message},
                        }
                    )
        except (WebSocketDisconnect, TimeoutError):
            pass
        finally:
            hub.sockets[str(room_id)].pop(socket, None)
            snapshot = await app.state.repo.snapshot(str(room_id), actor["playerId"])
            await hub.publish(
                {
                    "room": snapshot,
                    "event": {"type": "PRESENCE", "payload": {}, "seq": snapshot["eventSeq"]},
                    "serverTime": now_ms(),
                }
            )

    return app


app = create_app()
