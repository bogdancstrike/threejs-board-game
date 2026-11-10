from uuid import UUID, uuid4

import pytest
from fastapi.testclient import TestClient
from starlette.websockets import WebSocketDisconnect

from app.main import create_app


def test_websocket_ticket_origin_ack_and_idempotent_retry():
    app = create_app()
    with TestClient(app) as client:
        session = client.post("/api/v1/rooms", json={"name": "Socket Tester"}).json()
        room_id = session["room"]["id"]
        headers = {"Authorization": "Bearer " + session["token"]}
        ticket = client.post(f"/api/v1/rooms/{room_id}/ticket", headers=headers).json()["ticket"]
        url = f"/api/v1/rooms/{room_id}/ws?ticket={ticket}"
        with client.websocket_connect(url, headers={"Origin": "http://localhost:7777"}) as ws:
            assert ws.receive_json()["type"] == "SNAPSHOT"
            assert ws.receive_json()["event"]["type"] == "PRESENCE"
            command = {
                "type": "SET_READY",
                "expected_version": 1,
                "idempotency_key": str(uuid4()),
                "payload": {"ready": True},
            }
            ws.send_json(command)
            update, ack = ws.receive_json(), ws.receive_json()
            assert update["type"] == "UPDATE" and ack["type"] == "ACK"
            assert update["room"]["game"]["players"][0]["ready"] is True
            assert ack["commandId"] == command["idempotency_key"]
            ws.send_json(command)
            duplicate = ws.receive_json()
            assert duplicate["type"] == "ACK"
            assert duplicate["room"]["revision"] == 2
            ws.send_json({"type": "PING"})
            assert ws.receive_json()["type"] == "PONG"
            ws.send_json(
                {
                    "type": "ROLL_DIE",
                    "expected_version": 2,
                    "idempotency_key": str(uuid4()),
                    "payload": {},
                }
            )
            rejected = ws.receive_json()
            assert rejected["type"] == "REJECTED"
            assert rejected["error"]["code"] == "not_playing"
        with (
            pytest.raises(WebSocketDisconnect),
            client.websocket_connect(url, headers={"Origin": "http://localhost:7777"}),
        ):
            pass
        other_ticket = client.post(f"/api/v1/rooms/{room_id}/ticket", headers=headers).json()[
            "ticket"
        ]
        with (
            pytest.raises(WebSocketDisconnect),
            client.websocket_connect(
                f"/api/v1/rooms/{room_id}/ws?ticket={other_ticket}",
                headers={"Origin": "https://untrusted.example"},
            ),
        ):
            pass

        async def cleanup():
            await app.state.repo.pool.execute("DELETE FROM rooms WHERE id=$1", UUID(room_id))

        client.portal.call(cleanup)
