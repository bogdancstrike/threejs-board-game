import asyncio
from uuid import UUID, uuid4

import httpx
import pytest

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
