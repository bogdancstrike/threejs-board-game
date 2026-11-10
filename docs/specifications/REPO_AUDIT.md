# Existing repository audit — Wilder (2026-11-10)

Repository: https://github.com/bogdancstrike/threejs-board-game (main branch; two commits visible at inspection). Findings were read from the README, package.json, and source files via GitHub.

## Already implemented — DO NOT rebuild
- `three@^0.180.0`, TypeScript, Vite, vanilla browser frontend; no React or backend currently. Local web game runs on port 7777.
- `src/game/maps.ts`: 10 themes (`verdant`, `dragonkind`, `frost`, `desert`, `sakura`, `ember`, `tide`, `mycelium`, `astral`, `clockwork`), color palettes, biomes and theme encounters.
- `src/world/shapes.ts`: 10 signed-distance-like island silhouette fields, `MAP_SHAPES` extents (19–27), `shapeField()` protecting tiles and landmark pads, `islandCenter()`.
- `src/world/terrain.ts`: `sculptTerrain()`, 0.65-unit meshing step, themed vertex colors, terrain height using `groundHeight(z)`, layered cliff underside y values [0,-0.65,-1.6,-3.2,-5.8].
- `src/game/engine.ts`: 1–4 local players, roll 1–6, move across intermediate tiles, 0..92 tile indices, mystery choices, treasure, fortune, portal, victory on tile 92, localStorage `wilder-expedition-v1`.
- `src/world/assets.ts` and `public/models/environment/manifest.json`: cached imported GLBs, environment models, attribution and asset transforms. `public/models/environment/wizard-tower.glb` is ~13.4MB; optimization is important.
- `src/world/{scene,world,lighting,ao,atmosphere,water,vfx,animation,rig,environment,landmarks}.ts` already implement scene assembly, effects, animations, landmarks.
- `public/previews/*.webp` include ten actual runtime world previews; source links in references.
- `src/audio/audio.ts` provides procedural audio; existing tests include Vitest + Playwright.

## Source-consistent corrections to earlier package
- **Do not replace Wilder's name with Drink Up.** The old chat screenshot was from an earlier design iteration; `README.md` now identifies the app as Wilder.
- **Do not prescribe React/FastAPI/PostgreSQL as current dependencies.** They are future options only if requirements justify a migration or networked multiplayer.
- **Do not claim all 12 characters have production-quality rigging.** README and docs/ASSETS.md state adapted GLB art for eight, four prototypes, plus approximate procedural rigs.
- **Do not claim multiplayer is networked.** The current game supports 1–4 local players on one browser/device.
- **Do not introduce 93 new tiles.** The game has 93 per world and must retain index 0..92.
- **Do not replace renderer and risk regressions.** Introduce new terrain behind feature flag and compare world previews.

## Gaps most relevant to request
1. World size: current extent 19–27 world units, user wants notably larger *perceived* area and landmarks with more breathing room.
2. Path protection: shapeField modifies footprint; simply scaling the terrain makes path and landmark alignment fail.
3. Terrain sculpting: current terrain interpolation and noise are modest; expand cliffs, ridges, terraces and vertical storytelling rather than just extending a grid.
4. Asset art coherence: mixed third-party environment and character models; standardize materials, scale, license manifest and previews.
5. World preview fidelity: current previews exist; use automated before/after camera screenshots to validate layout and obstruction.

## Target files, ordered by recommended change
1. `src/world/shapes.ts` (map bounds, shape masks and protected patches).
2. `src/world/terrain.ts` (sculpting and mesh tessellation / LOD).
3. `src/world/world.ts` (landmarks, path and terrain integration).
4. `src/world/landmarks.ts`, `src/world/environment.ts` (regional asset distribution).
5. `src/world/scene.ts` (auto-fit camera, orbit bounds, quality and lifecycle).
6. `src/world/lighting.ts`, `src/world/ao.ts`, `src/world/atmosphere.ts`, `src/world/water.ts` (lighting/environment polish).
7. `src/world/assets.ts`, `docs/ASSETS.md`, `public/ASSET-CREDITS.md` (asset pipeline).
8. `src/game/data.ts` / `src/game/maps.ts` (data contract only where necessary; avoid rules changes).

## Verification commands
`npm ci && npm run build && npm test && npm run test:e2e && npm run screenshots` (browser dependency installation may be needed).

This audit is documentation, **not a build or runtime verification**. The source was inspected remotely, not cloned into this artifact.
