# Implementation sequence — code-agent-ready

## Sprint 0: Baselines and metrics (P0)
- WIL-001 Run `npm ci`, `npm run build`, `npm test`, `npm run test:e2e`, `npm run screenshots`; commit before/after screenshot gallery.
- WIL-002 Capture `getTiles(map)` path bounds, y profile and landmarks for all ten maps; export `reports/baseline_map_metrics.json` without mutating gameplay.
- WIL-003 Add developer-only overlay: tile centers/clearance, landmark bounding boxes, biome boundaries, height sample labels, draw calls/frame times.

## Sprint 1: Large world layout (P0)
- WIL-010 Define `WorldLayout` interface and per-map authored bounds and terrace seed, while maintaining original game IDs.
- WIL-011 Refactor `src/world/shapes.ts` to handle expanded irregular terrain while enforcing route footprints in shapeField; keep world IDs and palette.
- WIL-012 Refactor `src/world/terrain.ts` height blend: path safe gradient + macro hills + cliff bands; avoid O(vertices × 93) naive distance if grid grows; use spatial indexing of nearby tiles.
- WIL-013 Generate 93 accessible world tile transforms and movement snapshots, no transport through cliff, start/end visible.
- WIL-014 Update auto-fit and camera limits in `src/world/scene.ts` using actual expanded bounds.

## Sprint 2: Composed biome environment (P0)
- WIL-020 Design flagship Verdant 4 regions with landmark pads for forge, village, windmill, ruins, castle.
- WIL-021 Add hydrology graph/rivers with 2–4 safe bridges and 3–5 falls on terrace/edge intersections.
- WIL-022 Seed clustered vegetation with safe-distance/steep-slope filters, instancing and reused materials.
- WIL-023 Add 1–3 floating satellite rocks and layered cliff underside; check no silhouette intrusion into game UI.
- WIL-024 Reuse existing environment GLBs; normalize scale/material style and read credits; do not duplicate >13MB tower in scene needlessly.

## Sprint 3: Ten themed worlds (P1)
- WIL-030 Parameterize one biome logic per existing `maps.ts` theme, use custom silhouette field/camera/framing.
- WIL-031 Review island edge stitching and water crossings for tide/astral/ember (island holes and disjoint shapes).
- WIL-032 Generate preview gallery snapshots via existing scripts; visual compare and screenshot PR approvals.

## Sprint 4: Character polish + lighting (P1)
- WIL-040 Document adapted/prototype status for all 12 roster entries; maintain existing game registry IDs.
- WIL-041 Add higher quality character GLB preview variants and animation clips via same asset loader; keep current preview flow.
- WIL-042 Tune lighting, AO, bloom and shadow camera across enlarged terrain, preserve 3 quality presets.
- WIL-043 Optimize water/fog/particles to avoid occlusion and overdraw.

## Sprint 5: Release validation (P0)
- WIL-050 Tests for path length 93, contiguous transitions, height never clips, clearance zones, landmarks and rivers no invalid overlaps.
- WIL-051 E2E world switching, save restored with identical tile ID, run all ten worlds, free-orbit/zoom, pawn focus and event overlay.
- WIL-052 Benchmark 5-min scenes with Medium/Ultra/Low presets and document GPU/viewport/browser/FPS p95.
- WIL-053 Review asset attribution + copyright/CC BY credits, bundle-size budgets, memory and unload lifecycle.

## Rollout
Behind `ENABLE_LARGE_WORLD` developer flag: baseline vs large-world deterministic side-by-side, 1 world -> 3 worlds -> all 10. Map upgrade MUST NOT alter saved game state.
