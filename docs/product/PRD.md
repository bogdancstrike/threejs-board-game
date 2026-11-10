# Product requirements document — Drink Up: Fantasy Board
## Product thesis
Turn the existing browser-based social board game into a polished **fantasy tabletop adventure**: dice-driven progress across a 93-tile 3D diorama, amusing decision prompts, short party challenges, character selection, and shared-room multiplayer. The theme is inspired by nostalgic whimsical PC games; all fantasy gameplay is an original product specification.

## Target users
- **Host:** starts 2–8-player room, sets theme and content intensity, initiates turns.
- **Player:** selects character, rolls, completes event, sees clear effects and results.
- **Spectator:** sees match state read-only, if enabled.
- **Creator (later):** authors balanced event packs with validation and moderation.

## Jobs to be done
- Start game in under 90 seconds.
- Understand current player, position, roll and next action without tutorial.
- Enjoy interesting turns (typical target 20–45 seconds, tune in playtesting).
- Recover from disconnect without invalidating game outcome.
- Keep visual quality and performance acceptable on laptop GPUs.

## Existing shell invariants
Keep exact branding, left map viewport, right sidebar, player score rows, top-right heat indicator, active-tile field and camera/zoom controls. No global UI redesign. Character picker can be modal. Existing rules data remains authoritative until migrations explicitly approved.

## MVP features (P0)
- Lobby and host-controlled room; join code; reconnect; authoritative turn order.
- Up to 8 players, with 2–6 as initial tested baseline.
- 93-tile logical board imported from existing gameplay config; no rule loss.
- Server-generated seeded die roll; append-only event log; idempotent actions.
- 3D four-biome map, 3D pawns on circular bases, character picker (4 production-ready characters in MVP; 12 roster stretch).
- Tile effect resolution with normal/reward/penalty/challenge/choice/teleport categories.
- Accessible modal challenges, answer/result validation, configurable timers.
- Player stats, winner/end conditions, match restart, rematch.
- Audio mute and reduced-motion setting; optional non-alcoholic wording.
- One default lighting preset + low/medium/high scene quality.

## P1 features
- 12-character collection, cosmetics, collectible titles, multiple map themes, replay timeline, replay sharing, event packs, host-configurable rules, more varied minigames, localized RO/EN UI.

## Explicit non-goals (MVP)
- Persistent open world, combat system, real-money wagering, character gacha, text chat requiring moderation, user-generated 3D maps, dedicated matchmaking at scale, monetization, fully simulated fluid dynamics.

## Success metrics / instrumentation
- Time from landing to first roll: p50 <90s on tested target network.
- Gameplay action acknowledgements: p95 <250ms on reference region (server-side measurement).
- Reconnection state restoration p95 <3s on normal reconnect (depends on network).
- Median frame rate >= 60 FPS at 1080p Medium on documented desktop baseline; report 1% low.
- Zero duplicate die rolls per idempotency key; zero out-of-order accepted turns.
- Playtest perceived tile readability >= 4/5, 80% of testers correctly recognize active pawn/tile.
- Event cancellation/timeout covered by defined, deterministic behavior.

## UX flows
Host create -> lobby -> choose options -> players join -> select characters -> ready -> start -> current turn roll -> move animation -> tile resolver -> challenge/choice -> score / effects -> next player -> win/finish -> recap -> rematch.

## Scope/risks
- Real game mechanics from existing repository must be inspected before implementation.
- Historical inspiration not license to reuse Țapul Țicu characters/art.
- Content controls, age restrictions if drinking challenges, and host consent are product requirements.
- Asset procurement/consistent art style is schedule-critical.

## Acceptance gate
All P0 flows work in local browser and deployed room, game events replay to same result, all 93 tile world positions valid, and existing shell screenshot-diff is unchanged outside game viewport.
