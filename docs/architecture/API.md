# Proposed HTTP/WebSocket API contract
All APIs are illustrative and should adapt to existing backend. JSON contracts in `../contracts/`.
## REST
`POST /api/v1/rooms` -> create room and host session.
`POST /api/v1/rooms/{roomId}/join` -> join by validated code.
`GET /api/v1/rooms/{roomId}` -> authorized snapshot.
`GET /api/v1/characters` -> available roster metadata.
`GET /api/v1/rooms/{roomId}/events?after_seq=42` -> replay delta.
`POST /api/v1/rooms/{roomId}/ready` -> ready status.
## WS
`GET /api/v1/rooms/{roomId}/ws?ticket=...` ephemeral ticket (avoid long-lived secret query strings); handshake checks Origin and membership.
Commands: `SELECT_CHARACTER`, `START_GAME`, `ROLL_DIE`, `SUBMIT_CHALLENGE`, `SKIP_CHALLENGE`, `REQUEST_REMATCH`.
Responses/events: `SNAPSHOT`, `PLAYER_JOINED`, `CHARACTER_SELECTED`, `TURN_STARTED`, `DIE_ROLLED`, `PAWN_MOVED`, `TILE_TRIGGERED`, `CHALLENGE_STARTED`, `CHALLENGE_RESOLVED`, `SCORE_CHANGED`, `TURN_COMPLETED`, `GAME_FINISHED`, `COMMAND_REJECTED`.
Envelope: `{event_id, room_id, seq, server_time, ruleset_version, type, payload}`. WS reconnect sends last seen seq; gaps repaired with snapshot/delta.
## Server guarantees
Version-check expected_version on mutating actions, unique command_idempotency record, role/turn authorization and event append in one Postgres transaction. Return canonical response to retry, not reexecute RNG. Keep websocket payloads bounded and parse with Pydantic.
