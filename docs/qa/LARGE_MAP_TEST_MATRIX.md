# Large world test matrix

| ID | Check | Expected |
|---|---|---|
| MAP-001 | Every theme `getTiles(id).length` | 93 |
| MAP-002 | All tile positions finite x/y/z | Pass |
| MAP-003 | Neighbor segment continuity incl y | No invalid teleport/cliff traversal |
| MAP-004 | Sampling under each tile | Flat enough for pawns, no terrain clipping |
| MAP-005 | Terrain SDF within camera bounds | No visible holes/cracks |
| MAP-006 | Bridges over rivers | Correct support + no movement through water |
| MAP-007 | Landmark safe geometry | No intersection with tile/pawn collision cylinder |
| MAP-008 | 10 maps all have start and finish visible | Pass in default camera |
| MAP-009 | Existing game save restores | Exact map/player/tile preserved |
| MAP-010 | Same seed generates same layout | Reproducible |
| MAP-011 | Gallery preview is actually same scene builder | Screenshot golden images approved |
| MAP-012 | 1–4 players in overlapping tile | Pawn identities remain readable |
| MAP-013 | Low/Medium/Ultra all render | No runtime errors, defined FPS target |
| MAP-014 | Animations run 5 min | No growing memory/objects |
| MAP-015 | License manifest | Credits for all third-party GLBs |
| MAP-016 | No HUD changes | Existing UI visual regression within tolerance |

### Suggested automated checks
Unit: terrain function deterministic, route length, height/clearance, world bounds and theme config. Integration: tile->world transform and pawn tween, bridge crossing, asset paths. Playwright: visit 10 worlds and save screenshots from fixed camera and DPR; compare against approved baselines. Perf: GPU and viewport documented; p95 frame duration; draw calls; JS heap. The blueprint itself does **not** report tests as executed.
