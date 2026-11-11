import asyncio
from uuid import UUID, uuid4

import httpx
import pytest

from app import domain
from app.main import create_app


@pytest.fixture
async def api():
    app = create_app()
    room_ids = []
    async with app.router.lifespan_context(app):
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app), base_url="http://testserver"
        ) as client:
            yield client, app, room_ids
        if room_ids:
            await app.state.repo.pool.execute(
                "DELETE FROM rooms WHERE id=ANY($1::uuid[])", [UUID(i) for i in room_ids]
            )


async def create(api, name="Ada"):
    client, _app, ids = api
    result = (await client.post("/api/v1/rooms", json={"name": name})).json()
    ids.append(result["room"]["id"])
    return result


def headers(session):
    return {"Authorization": "Bearer " + session["token"]}


async def command(api, session, kind, payload=None, key=None, version=None):
    client, _, _ = api
    room_id = session["room"]["id"]
    if version is None:
        version = (await client.get("/api/v1/rooms/" + room_id, headers=headers(session))).json()[
            "room"
        ]["revision"]
    return await client.post(
        f"/api/v1/rooms/{room_id}/commands",
        headers=headers(session),
        json={
            "type": kind,
            "payload": payload or {},
            "expected_version": version,
            "idempotency_key": key or str(uuid4()),
        },
    )


async def test_postgres_persistence_room_scoping_and_expired_identity(api):
    host = await create(api)
    client, app, _ = api
    room = await app.state.repo.snapshot(host["room"]["id"], host["playerId"])
    assert room["code"] == host["room"]["code"]
    other = await create(api, "Other Host")
    assert (
        await client.get("/api/v1/rooms/" + host["room"]["id"], headers=headers(other))
    ).status_code == 403
    assert (await client.get("/api/v1/rooms/" + host["room"]["id"])).status_code == 401
    await app.state.repo.pool.execute(
        "UPDATE room_members SET expires_at=now()-interval '1 second' WHERE id=$1",
        UUID(host["playerId"]),
    )
    assert (
        await client.get("/api/v1/rooms/" + host["room"]["id"], headers=headers(host))
    ).status_code == 401


async def test_concurrent_character_claims_have_one_winner_and_database_unique_guard(api):
    host = await create(api)
    client, app, _ = api
    guest = (
        await client.post("/api/v1/rooms/" + host["room"]["code"] + "/join", json={"name": "Grace"})
    ).json()
    revision = guest["room"]["revision"]
    responses = await asyncio.gather(
        command(api, host, "SELECT_CHARACTER", {"character": "rhea"}, version=revision),
        command(api, guest, "SELECT_CHARACTER", {"character": "rhea"}, version=revision),
    )
    assert sorted(r.status_code for r in responses) == [200, 409]
    room = await app.state.repo.snapshot(host["room"]["id"], host["playerId"])
    assert len({p["character"] for p in room["game"]["players"]}) == 2
    assert sum(p["character"] == "rhea" for p in room["game"]["players"]) == 1


async def test_duplicate_roll_is_idempotent_and_cannot_supply_die_or_score(api):
    host = await create(api)
    assert (await command(api, host, "SET_READY", {"ready": True})).status_code == 200
    assert (await command(api, host, "START_GAME")).status_code == 200
    assert (await command(api, host, "ROLL_DIE", {"dice": 6})).status_code == 422
    assert (await command(api, host, "ROLL_DIE", {"points": 1000})).status_code == 422
    key = str(uuid4())
    first = await command(api, host, "ROLL_DIE", key=key)
    duplicate = await command(api, host, "ROLL_DIE", key=key, version=1)
    assert first.status_code == duplicate.status_code == 200
    assert first.json()["event"] == duplicate.json()["event"]
    client, app, _ = api
    count = await app.state.repo.pool.fetchval(
        "SELECT count(*) FROM room_commands WHERE command_id=$1", UUID(key)
    )
    assert count == 1
    replay = (
        await client.get(
            f"/api/v1/rooms/{host['room']['id']}/events?after_seq=0", headers=headers(host)
        )
    ).json()["events"]
    assert [e["seq"] for e in replay] == list(range(1, len(replay) + 1))
    assert sum(e["type"] == "DIE_ROLLED" for e in replay) == 1


async def test_room_and_names_are_bounded_and_commands_require_host(api):
    host = await create(api)
    client, _, _ = api
    assert (await client.post("/api/v1/rooms", json={"name": "x" * 25})).status_code == 422
    assert (await client.post("/api/v1/rooms", json={"name": "   "})).status_code == 422
    guest = (
        await client.post("/api/v1/rooms/" + host["room"]["code"] + "/join", json={"name": "Grace"})
    ).json()
    assert (await command(api, guest, "START_GAME")).status_code == 403
    assert (await command(api, host, "START_GAME")).status_code == 409
    assert (await command(api, guest, "SET_READY", {"ready": True})).status_code == 200


async def test_same_device_party_can_name_pick_and_play_each_seat(api):
    client, app, ids = api
    host = (
        await client.post(
            "/api/v1/rooms",
            json={
                "name": "Ada",
                "hotseat": True,
                "players": ["Grace", "Linus"],
                "challenges": False,
            },
        )
    ).json()
    ids.append(host["room"]["id"])
    assert host["room"]["hotseat"] is True
    assert len(host["room"]["game"]["players"]) == 3
    assert (
        await client.post(
            "/api/v1/rooms/" + host["room"]["code"] + "/join", json={"name": "Remote"}
        )
    ).status_code == 409
    for p in host["room"]["game"]["players"]:
        assert (
            await command(api, host, "SET_READY", {"ready": True, "playerId": p["id"]})
        ).status_code == 200
    second = host["room"]["game"]["players"][1]["id"]
    assert (
        await command(api, host, "SELECT_CHARACTER", {"character": "wren", "playerId": second})
    ).status_code == 200
    assert (
        await command(api, host, "SET_READY", {"ready": True, "playerId": second})
    ).status_code == 200
    assert (
        await app.state.repo.pool.fetchval(
            "SELECT character_id FROM room_members WHERE id=$1", UUID(second)
        )
        == "wren"
    )
    assert (await command(api, host, "START_GAME")).status_code == 200
    for _ in range(2):
        result = await command(api, host, "ROLL_DIE")
        assert result.status_code == 200
        if result.json()["room"]["game"]["phase"] == "event":
            assert (await command(api, host, "CHOOSE", {"index": 1})).status_code == 200
    snapshot = await app.state.repo.snapshot(host["room"]["id"], host["playerId"])
    assert snapshot["game"]["players"][1]["position"] > 0


async def test_expired_accepted_danger_applies_once_and_persists_route(api):
    host = await create(api)
    _, app, _ = api
    room = await app.state.repo.snapshot(host["room"]["id"], host["playerId"])
    room["phase"] = "playing"
    room["game"]["players"][0].update(position=29, furthest=29, gold=1)
    room["game"].update(
        phase="challenge", challenge={**domain.challenge(0, 0), "context": "dragon"}
    )
    room["turnDeadline"] = 1
    await app.state.repo.pool.execute(
        "UPDATE rooms SET snapshot=$1 WHERE id=$2", room, UUID(room["id"])
    )
    result = await app.state.repo.timeout(room["id"])
    assert result["room"]["game"]["players"][0]["position"] == 26
    assert result["room"]["game"]["players"][0]["gold"] == 0
    assert result["event"]["payload"]["route"] == [28, 27, 26]
    assert await app.state.repo.timeout(room["id"]) is None


async def test_health_catalogue_invalid_join_and_request_limits(api):
    client, _, _ = api
    assert (await client.get("/api/health")).json()["database"] == "postgresql"
    assert len((await client.get("/api/v1/catalogue")).json()["maps"]) == 36
    assert (
        await client.post("/api/v1/rooms/invalid/join", json={"name": "Test"})
    ).status_code == 422
    assert (
        await client.post("/api/v1/rooms/ZZZZZZ/join", json={"name": "Test"})
    ).status_code == 404
    assert (await client.post("/api/v1/rooms", content="x" * 17000)).status_code == 413
    assert (
        await client.post("/api/v1/rooms", headers={"Content-Length": "bad"}, content="")
    ).status_code == 400
    assert (
        await client.post("/api/v1/rooms", json={"name": "Host", "players": ["Unowned seat"]})
    ).status_code == 422


async def test_command_key_cannot_be_reused_with_different_intent_and_tokens_are_bounded(api):
    host = await create(api)
    client, app, _ = api
    key = str(uuid4())
    assert (await command(api, host, "SET_READY", {"ready": True}, key=key)).status_code == 200
    assert (await command(api, host, "SET_READY", {"ready": False}, key=key)).status_code == 422
    assert (
        await client.get(
            "/api/v1/rooms/" + host["room"]["id"], headers={"Authorization": "Bearer short"}
        )
    ).status_code == 401
    with pytest.raises(domain.GameError):
        await app.state.repo.snapshot(str(uuid4()), host["playerId"])
    with pytest.raises(domain.GameError):
        await app.state.repo.command(
            str(uuid4()),
            host["playerId"],
            {
                "type": "SET_READY",
                "payload": {"ready": True},
                "expected_version": 1,
                "idempotency_key": str(uuid4()),
            },
        )
    assert (await command(api, host, "SET_NAME", {"name": "x" * 9000})).status_code == 413
    assert (await command(api, host, "START_GAME")).status_code == 200
    assert (await command(api, host, "SKIP_TURN")).status_code == 200


async def test_snapshot_survives_a_new_api_instance(api):
    host = await create(api)
    app = create_app()
    async with (
        app.router.lifespan_context(app),
        httpx.AsyncClient(transport=httpx.ASGITransport(app), base_url="http://restart") as client,
    ):
        snapshot = (
            await client.get("/api/v1/rooms/" + host["room"]["id"], headers=headers(host))
        ).json()["room"]
        assert snapshot["id"] == host["room"]["id"]
        assert snapshot["game"]["players"][0]["name"] == "Ada"


async def test_http_rate_limit_returns_structured_retry_error(api):
    client, _, _ = api
    responses = [await client.get("/api/v1/catalogue") for _ in range(241)]
    assert responses[-1].status_code == 429
    assert responses[-1].json()["error"]["code"] == "rate_limited"


async def test_background_worker_advances_expired_turn_and_publishes(api):
    host = await create(api)
    _, app, _ = api
    await command(api, host, "SET_READY", {"ready": True})
    await command(api, host, "START_GAME")
    room = await app.state.repo.snapshot(host["room"]["id"], host["playerId"])
    original_turn = room["game"]["turn"]
    room["turnDeadline"] = 1
    await app.state.repo.pool.execute(
        "UPDATE rooms SET snapshot=$1 WHERE id=$2", room, UUID(room["id"])
    )
    # Observe the actual lifespan worker, rather than directly calling timeout().
    for _ in range(30):
        await asyncio.sleep(0.1)
        current = await app.state.repo.snapshot(room["id"], host["playerId"])
        if current["game"]["turn"] > original_turn:
            break
    assert current["game"]["turn"] == original_turn + 1
    assert current["game"]["phase"] == "ready"
    events = await app.state.repo.events(room["id"], host["playerId"], room["eventSeq"])
    assert len(events) == 1
    assert current["turnDeadline"] > domain.now_ms()
