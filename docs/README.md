> **Runtime extension (2026-11-10):** the user's later explicit request adds FastAPI, PostgreSQL, WebSocket rooms, solo/same-device parties, road dangers and ten mini-games. See [current runtime](runtime/README.md) [road adventure specification](specifications/ROAD_ADVENTURES.md), and [start menu](specifications/START_MENU.md). The original blueprint below remains preserved; its local-only recommendation is superseded by that request.

# Wilder — Big Fantasy Map Expansion / Implementation Blueprint v2
**2026-11-10** | Design + reference ZIP, not executable game | Inspected public GitHub repository, no changes pushed

## What is here
A repository-grounded expansion package for https://github.com/bogdancstrike/threejs-board-game. Prioritize a **significantly larger** handcrafted fantasy diorama with 93 preserved tiles per world, increased landmark spacing, richer geography, four visual elevation levels, rivers/waterfalls, anime-inspired character art, and cinematic lighting.

## Important correction
Your current game is **Wilder**, not the earlier Drink Up. screenshot. It already has 10 distinct worlds, 12 adult hero entries, 93 tiles, local 1–4 player turns, GLB assets, WebGL rendering effects, and screenshot tests. We should **incrementally enhance it**, not rebuild or add an unnecessary backend. See `specifications/REPO_AUDIT.md`.

## Start here
1. `references/concepts/00_visual_reference_moodboard.jpg`: supplied images and prior fantasy concepts.
2. `references/concepts/01_large_93_tile_world_plan.png`: full conceptual 93 tile layout.
3. `references/concepts/02_elevation_profile.png`: four terrains.
4. `references/concepts/03_ten_worlds_styleboard.png`: world family planning.
5. `references/repository/EXISTING_RENDER_LINKS.md`: actual screenshot URLs from current project (not embedded).
6. `specifications/LARGE_MAP_MASTER_SPEC.md`: big-world architectural/visual design.
7. `specifications/REPO_AUDIT.md`: current code inventory.
8. `implementation/REPO_SPECIFIC_BACKLOG.md`: incremental prioritized tasks.
9. `product/PRD_WILDER_V2.md`: product requirements and metrics.
10. `architecture/ADR_WILDER_INCREMENTAL.md`, `specifications/CHARACTER_EXPANSION.md`, `specifications/LIGHTING_AND_ENVIRONMENT.md`, `qa/LARGE_MAP_TEST_MATRIX.md`.

## Previous blueprint
The original Ticu-inspired package remains under `research/`, `game-design/`, `product/`, `art/`, `architecture/`, etc. It is conceptually useful, **but older sections proposing a FastAPI server and Drink Up UI are superseded** by this README and `*_WILDER*`, `REPO_*`, and `LARGE_MAP_*` files. Treat historic Țapul Țicu research as provisional; specific historic dice map mechanics were not verified.

## Scope/limitations
- All images are user references, earlier generated chat concepts, or new schematic diagrams, **not actual screenshot captures of the latest GitHub game**, except via external links.
- Existing 10 runtime WebP previews are linked from the repo, not included as binary due to connector limitations.
- No GLB binaries are redistributed. No code is modified or deployed.
- Map sizes, density and performance numbers are initial targets to validate against runtime and GPU measurements.

## Code-agent launch prompt
Read `specifications/REPO_AUDIT.md`, `specifications/LARGE_MAP_MASTER_SPEC.md`, `implementation/REPO_SPECIFIC_BACKLOG.md`, and reference images. Inspect latest repository state and source tests. Implement only WIL-001..WIL-014 first behind `ENABLE_LARGE_WORLD`, without modifying UI/turn logic/serialized saves. Preserve 10 map IDs, 12 character IDs and tile 0..92. Use existing scene/terrain systems. Verify npm build, Vitest, Playwright and screenshot baselines. Provide before/after screenshots and benchmark data; never assert visual fidelity/performance without testing.
