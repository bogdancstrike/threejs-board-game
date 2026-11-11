# Functional release validation · 2026-11-11

The release gate is `npm run test:release`. It runs a strict TypeScript/production build, 18 Vitest tests, 14 Chromium browser tests, and 63 Python tests with a real disposable PostgreSQL database. The browser suite includes both UI E2E flows and focused browser integration tests; it is not a claim that every possible interaction was exhaustively enumerated.

| Behavior | Automated evidence |
|---|---|
| Desktop/phone title menu, New game, Continue, settings and featured-world preview | `tests/e2e/menu.spec.ts` |
| Every world renders; 93 connected tiles, terrain support, unique shapes and real sky ascent/descent | `tests/e2e/game.spec.ts`, `tests/engine.test.ts` |
| Character selection, movement, imported-model animation bounds and saved appearance | `tests/e2e/game.spec.ts` |
| Real Web Audio output, all soundscape families, effects, volume/mute persistence | `tests/e2e/game.spec.ts`, `tests/audio.test.ts` |
| Same-device names, exclusive heroes and pass-the-device handoff | `tests/e2e/hotseat.spec.ts` |
| Separate browser identities, shared turns/scores, reconnect, full classic race, guest/host rematch | `tests/e2e/online.spec.ts` |
| Full offline rules-engine game, restored encounter/winner, controls, restart; full server score game and rematch | `tests/e2e/release-flows.spec.ts` |
| All ten mini-game widgets submit the expected intentions | `tests/e2e/challenges.spec.ts` |
| ACK/rejection, stale/malformed updates, heartbeat, transport failure, retry, idempotent HTTP fallback, session expiry | `tests/e2e/network-protocol.spec.ts` |
| All challenge rules, road choices, dangers, wards, hexes, score protection and complete eight-player games | `backend/tests/test_domain.py` |
| Concurrent claims, authorization, replay/idempotency, persistence, rate/size limits and the running deadline worker | `backend/tests/test_api.py` |
| Actual WebSocket handshake, Origin, one-use ticket, presence, commands, ACK and duplicate retry | `backend/tests/test_websocket.py` |

Complete online games use the supported authenticated command API for the intervening turns while browser clients remain connected. Initial turns, choices, handoff, finish screens, reloads and rematch controls are exercised through the UI. Focused challenge/transport browser tests use controlled dependencies; Python tests separately validate authoritative game outcomes.

## Coverage and reproduction

The frontend includes every `src/**/*.ts` module and gates instrumented browser line coverage at 90%. No application file is excluded. Backend coverage includes every `backend/app` Python module and also enforces 90%. Branch metrics are recorded separately. Generated per-file summaries are in `reports/frontend-coverage-summary.json` and `reports/backend-coverage-summary.json`; the README table is refreshed by the release command. Full frontend HTML is generated at `coverage/frontend/index.html`.

Start the API/database, install Chromium, then run the gate. Coverage uses its own Vite server on port 7779. Backend tests create a unique temporary database and remove it after the run; the configured PostgreSQL test role needs `CREATEDB`.

After deploying Docker web/API/database on port 7777, `npm run test:production` repeats the title-menu, phone, same-device and full two-browser classic/rematch flows against the minified Nginx-served application.

## Practical limits

The suite runs in headless Chromium using software WebGL. It verifies behavior and rendering validity, not target-device FPS, every mobile browser, long-duration soak performance or exact visual fidelity to concept art. The roster's adapted/prototype art status remains documented in the README. The current WebSocket service uses one API worker; horizontal scaling needs a shared broker.
