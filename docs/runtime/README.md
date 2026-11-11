# Current runtime · 2026-11-11

The user's explicit request for Python, FastAPI, PostgreSQL and WebSocket multiplayer extends the incremental v2 blueprint. Existing vanilla TypeScript/Vite/Three.js rendering and local saves remain. The supplied `docs/` design package is preserved as design history; this folder records executable behavior.

## Running

`python3 scripts/init-env.py` generates a private `.env`. `docker compose up -d --build` builds the browser and API, migrates PostgreSQL and exposes http://localhost:7777. Stop another server using that port first. Do not delete the database volume when updating. `docker compose up -d --build api web` redeploys code without resetting games.

Development: start the db with Compose, run `uv sync --directory backend`, then `uv run --directory backend uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload`, and `npm run dev`. The Vite proxy handles both REST and WebSocket requests. Python 3.12+, uv, Node 22.12+/24 LTS and Docker Compose are used. The backend Docker image pins Python 3.13; locks pin dependencies.

## Rooms

Create/join, unique names and heroes, ready checks, host start, 1–8 members, classic or score victory, points, ten skill mini-games and seventeen road stops, host rematch. Solo and same-device parties support 1–8 named seats with unique heroes and a turn handoff. A shared browser also retains the original offline 1–4 player Classic. Online browser credentials are separate from the local save.

Each guest receives a random room-scoped bearer credential; only its SHA-256 hash is persisted. Sessions expire after 12 hours. WebSocket handshakes consume single-use 30-second tickets and validate Origin. No bearer token enters a WebSocket URL. Names are escaped when rendered. The server generates dice, challenge seeds, timing and points; clients submit intentions.

A PostgreSQL room row lock serializes all mutations; a unique `(room_id, character_id)` index enforces claims. Revisions reject stale commands, command UUIDs deduplicate retries, and event sequences support replay. A committed snapshot survives process restart. Disconnected players can reconnect; a server deadline advances stalled turns without a score penalty, except an accepted dangerous trial applies its disclosed setback.

REST paths: `GET /api/health`, `GET /api/v1/catalogue`, `POST /api/v1/rooms`, `POST /api/v1/rooms/{code}/join`, authenticated snapshot/events/commands/ticket under `/api/v1/rooms/{id}`. Socket path `/api/v1/rooms/{id}/ws?ticket=…`. OpenAPI is at API port 8000 `/docs`.

Run a **single API worker**: socket presence, tickets and fan-out currently live in that process. Horizontal scaling requires a shared broker. The PostgreSQL aggregate remains durable. Configure `ALLOWED_ORIGINS` before using another hostname; localhost defaults are intentional.

See [road adventure rules](../specifications/ROAD_ADVENTURES.md) for encounter actions, reward values, punishments, protection and API commands.

## Maps and art

Thirty original IDs, 93 route tiles each, distinct shape fields, 3–9 terrain floors. Eight worlds have raised sky routes; Dream and Lunar each make two excursions. Route tile IDs remain compatible with existing local saves. `npm run screenshots` renders all thirty thumbnails and updates the README gallery. Imported art credits are in `public/ASSET-CREDITS.md`; adapted/prototype roster status is explicit in the selector.

## Validation

`npm run build`, `npm test`, `npm run test:e2e`; `uv run --directory backend pytest` (running PostgreSQL required), `uv run --directory backend ruff check app tests`. Docker builds are reproducible. Headless browser checks use software WebGL; hardware FPS and five-minute soak targets in the blueprint remain to be measured.

## Title screen and release checks

See [start-menu behavior](../specifications/START_MENU.md). New game, Continue, settings, how-to-play and thirty featured world previews are available before entering the board. Live room deadlines continue in the menu. Rematches bring every connected player back to the lobby.

`npm run test:release` builds the production bundle, runs unit and instrumented browser tests, then validates all backend modules with PostgreSQL. Frontend and backend enforce separate 90% line thresholds and report branch coverage. The instrumented browser server uses port 7779. Backend tests create a disposable database using the configured role (CREATEDB required), and delete only that database after the run.
