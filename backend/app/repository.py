from __future__ import annotations

import hashlib
import json
import secrets
from pathlib import Path
from uuid import UUID, uuid4

import asyncpg

from . import domain


def token_hash(token: str) -> bytes:
    return hashlib.sha256(token.encode()).digest()


async def initialize_connection(connection):
    await connection.set_type_codec(
        "jsonb", schema="pg_catalog", encoder=json.dumps, decoder=json.loads
    )


class PostgresRooms:
    """Transactional persistence adapter; a room row is the concurrency boundary."""

    def __init__(self, pool: asyncpg.Pool):
        self.pool = pool

    async def migrate(self):
        async with self.pool.acquire() as connection, connection.transaction():
            await connection.execute("SELECT pg_advisory_xact_lock(77772026)")
            await connection.execute(
                (Path(__file__).parents[1] / "migrations" / "001_initial.sql").read_text()
            )

    async def authenticate(self, token: str) -> dict:
        if not 20 <= len(token) <= 128:
            raise domain.GameError(
                "invalid_session", "Your session is not valid. Join the room again.", 401
            )
        row = await self.pool.fetchrow(
            "SELECT id,room_id FROM room_members WHERE token_hash=$1 AND expires_at>now()",
            token_hash(token),
        )
        if not row:
            raise domain.GameError(
                "invalid_session", "Your session expired. Join the room again.", 401
            )
        return {"playerId": str(row["id"]), "roomId": str(row["room_id"])}

    async def create(
        self, name: str, map_id: str, mode: str, challenges: bool
    ) -> tuple[dict, str, str]:
        room_id, actor, token = str(uuid4()), str(uuid4()), secrets.token_urlsafe(32)
        alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"
        for _ in range(5):
            code = "".join(secrets.choice(alphabet) for _ in range(6))
            room = domain.initial_room(room_id, code, actor, name, map_id, mode, challenges)
            room.update(revision=1, eventSeq=1)
            try:
                async with self.pool.acquire() as connection, connection.transaction():
                    await connection.execute(
                        "INSERT INTO rooms(id,code,snapshot,revision,event_seq) VALUES($1,$2,$3,1,1)",
                        UUID(room_id),
                        code,
                        room,
                    )
                    await connection.execute(
                        "INSERT INTO room_members(id,room_id,name,character_id,token_hash) VALUES($1,$2,$3,$4,$5)",
                        UUID(actor),
                        UUID(room_id),
                        room["game"]["players"][0]["name"],
                        "lyra",
                        token_hash(token),
                    )
                    await connection.execute(
                        "INSERT INTO room_events(room_id,seq,event_type,actor_id,payload,snapshot) VALUES($1,1,$2,$3,$4,$5)",
                        UUID(room_id),
                        "ROOM_CREATED",
                        UUID(actor),
                        {},
                        room,
                    )
                return room, actor, token
            except asyncpg.UniqueViolationError:
                continue
        raise domain.GameError(
            "try_again", "Could not allocate a room code. Please try again.", 503
        )

    async def join(self, code: str, name: str) -> tuple[dict, str, str]:
        actor, token = str(uuid4()), secrets.token_urlsafe(32)
        async with self.pool.acquire() as connection, connection.transaction():
            row = await connection.fetchrow(
                "SELECT * FROM rooms WHERE code=$1 FOR UPDATE", code.upper()
            )
            if not row:
                raise domain.GameError("room_not_found", "No expedition uses that room code.", 404)
            room = row["snapshot"]
            p = domain.join(room, actor, name)
            room.update(revision=row["revision"] + 1, eventSeq=row["event_seq"] + 1)
            await connection.execute(
                "INSERT INTO room_members(id,room_id,name,character_id,token_hash) VALUES($1,$2,$3,$4,$5)",
                UUID(actor),
                row["id"],
                p["name"],
                p["character"],
                token_hash(token),
            )
            await self._write(connection, room, actor, "PLAYER_JOINED", {"actorId": actor})
        return room, actor, token

    async def snapshot(self, room_id: str, actor: str) -> dict:
        row = await self.pool.fetchrow("SELECT snapshot FROM rooms WHERE id=$1", UUID(room_id))
        if not row:
            raise domain.GameError("room_not_found", "This room no longer exists.", 404)
        domain.member(row["snapshot"], actor)
        return row["snapshot"]

    async def command(
        self, room_id: str, actor: str, command: dict, *, randbelow=secrets.randbelow
    ) -> tuple[dict, bool]:
        command_id = UUID(command["idempotency_key"])
        request_hash = hashlib.sha256(
            json.dumps(
                {"type": command["type"], "payload": command["payload"]}, sort_keys=True
            ).encode()
        ).hexdigest()
        async with self.pool.acquire() as connection, connection.transaction():
            row = await connection.fetchrow(
                "SELECT * FROM rooms WHERE id=$1 FOR UPDATE", UUID(room_id)
            )
            if not row:
                raise domain.GameError("room_not_found", "This room no longer exists.", 404)
            domain.member(row["snapshot"], actor)
            previous = await connection.fetchrow(
                "SELECT request_hash,response FROM room_commands WHERE room_id=$1 AND actor_id=$2 AND command_id=$3",
                UUID(room_id),
                UUID(actor),
                command_id,
            )
            if previous:
                if previous["request_hash"] != request_hash:
                    raise domain.GameError(
                        "idempotency_conflict",
                        "A command identifier cannot be reused for a different action.",
                        422,
                    )
                return previous["response"], False
            if row["revision"] != command["expected_version"]:
                raise domain.GameError(
                    "version_mismatch", "The room changed. Your view is being refreshed."
                )
            room, events = domain.apply(
                row["snapshot"], actor, command["type"], command["payload"], randbelow=randbelow
            )
            room.update(revision=row["revision"] + 1, eventSeq=row["event_seq"] + 1)
            event = events[0]
            await self._write(connection, room, actor, event["type"], event["payload"])
            if command["type"] in {"SELECT_CHARACTER", "SET_NAME"}:
                p = domain.member(room, actor)
                await connection.execute(
                    "UPDATE room_members SET name=$1,character_id=$2 WHERE id=$3 AND room_id=$4",
                    p["name"],
                    p["character"],
                    UUID(actor),
                    UUID(room_id),
                )
            response = {
                "room": room,
                "event": {**event, "seq": room["eventSeq"], "actorId": actor},
                "commandId": str(command_id),
                "serverTime": domain.now_ms(),
            }
            await connection.execute(
                "INSERT INTO room_commands(room_id,actor_id,command_id,request_hash,response) VALUES($1,$2,$3,$4,$5)",
                UUID(room_id),
                UUID(actor),
                command_id,
                request_hash,
                response,
            )
            return response, True

    async def _write(self, connection, room: dict, actor: str, kind: str, payload: dict):
        await connection.execute(
            "UPDATE rooms SET snapshot=$1,revision=$2,event_seq=$3,updated_at=now() WHERE id=$4",
            room,
            room["revision"],
            room["eventSeq"],
            UUID(room["id"]),
        )
        await connection.execute(
            "INSERT INTO room_events(room_id,seq,event_type,actor_id,payload,snapshot) VALUES($1,$2,$3,$4,$5,$6)",
            UUID(room["id"]),
            room["eventSeq"],
            kind,
            UUID(actor),
            payload,
            room,
        )

    async def events(self, room_id: str, actor: str, after: int) -> list[dict]:
        await self.snapshot(room_id, actor)
        rows = await self.pool.fetch(
            "SELECT seq,event_type,payload,snapshot FROM room_events WHERE room_id=$1 AND seq>$2 ORDER BY seq LIMIT 200",
            UUID(room_id),
            after,
        )
        return [
            {
                "seq": row["seq"],
                "type": row["event_type"],
                "payload": row["payload"],
                "room": domain.public_room(row["snapshot"]),
            }
            for row in rows
        ]

    async def expired(self) -> list[dict]:
        rows = await self.pool.fetch(
            "SELECT snapshot FROM rooms WHERE snapshot->>'phase'='playing' AND (snapshot->>'turnDeadline')::bigint<$1 LIMIT 100",
            domain.now_ms(),
        )
        return [row["snapshot"] for row in rows]

    async def timeout(self, room_id: str) -> dict | None:
        async with self.pool.acquire() as connection, connection.transaction():
            row = await connection.fetchrow(
                "SELECT * FROM rooms WHERE id=$1 FOR UPDATE", UUID(room_id)
            )
            if not row:
                return None
            room = row["snapshot"]
            if room["phase"] != "playing" or (room.get("turnDeadline") or 10**20) > domain.now_ms():
                return None
            p = room["game"]["players"][room["game"]["active"]]
            domain.journal(room["game"], f"{p['name']}’s turn expired. No points were removed.")
            domain.end_turn(room, domain.now_ms())
            room.update(revision=row["revision"] + 1, eventSeq=row["event_seq"] + 1)
            await self._write(connection, room, p["id"], "TURN_TIMED_OUT", {"actorId": p["id"]})
            return {
                "room": room,
                "event": {"type": "TURN_TIMED_OUT", "seq": room["eventSeq"], "payload": {}},
                "serverTime": domain.now_ms(),
            }
