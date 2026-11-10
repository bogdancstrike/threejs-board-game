# Implementation task backlog with acceptance criteria
## Epic A — preserve existing behavior
- A-01 Create baseline screenshots for desktop screen at 1440x900 and 1920x1080; diff except map canvas region. DoD: no unintended UI changes.
- A-02 Extract current tile config with IDs and effect categories; test exact tile count and ordering. DoD: deterministic fixture matches repository.
- A-03 Document camera controls and events; integration tests preserve orbit, fit, zoom.

## Epic B — world map
- B-01 Implement typed `TileWorldTransform` and schema validation; all existing tiles covered.
- B-02 Build four-elevation island mesh with collision clearance and cliff underside.
- B-03 Place 93 tiles by authored transforms; verify route without gaps / overlaps.
- B-04 Support elevation-aware movement interpolation and y-offset pawns.
- B-05 Integrate waterfalls/bridges ensuring path safe.
- B-06 Scatter biome vegetation via deterministic seed & placement masks.

## Epic C — presentation
- C-01 Correct color spaces and tone map; produce reference screenshots.
- C-02 Soft main directional shadow + fill + optimized light pools.
- C-03 Emissive crystals, forge, lanterns and special tile rings.
- C-04 Fog/clouds/bloom with accessible reduced motion.
- C-05 Implement low/medium/ultra presets with GPU profiling.

## Epic D — characters
- D-01 Create roster registry and model manifest.
- D-02 Character modal + 2D portrait gallery.
- D-03 Preview scene with 3 point lights, orbit, and camera presets.
- D-04 Rigged pawn IDLE/MOVE/SELECT/CELEBRATE and fallback.
- D-05 Multi-pawn tile offsets and selected highlight.

## Epic E — real-time
- E-01 Room/lobby API and WS gateway with authentication.
- E-02 Server authoritative roll and turn engine.
- E-03 Transactional events, idempotent retries, reconnect replay.
- E-04 Tile resolver and content schemas, timeouts/skip.
- E-05 Winner/rematch, score and user feedback.

## Epic F — delivery
- F-01 RO/EN localization and captions.
- F-02 Threat model tests and dependency audit.
- F-03 Playwright gameplay end-to-end with 4 browser contexts.
- F-04 Load tests of realistic rooms, reconnect storm and slow clients.
- F-05 Docker Compose + deployment scripts + tested rollback and backups.

## Suggested coding-agent brief
Inspect first, do not rewrite UI. Build one vertical slice: join -> select 3D pawn -> roll -> authoritative position -> animates up terrain -> resolves challenge -> persists/reconnects. Only then generalize effects and decorate world. Validate with screenshots and tests at every phase.
