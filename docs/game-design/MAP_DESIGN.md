# 93-tile fantasy map: detailed environment design
## Goal
Replace only the flat board inside existing map viewport with a rich, readable 3D floating island. **Four distinct raised zones** represent a progression through a whimsical medieval world. Do not make 93 separate tiny floating islands: continuous terrain with stepped terraces is more readable.

## Map topology / original proposal
| Tile range | Zone | Elevation baseline (world units) | Landmark story |
|---|---|---:|---|
| 00–22 | Hearthport Village | 0.0 | Starting market, cozy forge, docks and 1st waterfall |
| 23–47 | Whisperwood | 1.6 | Windmill, cherry blossom forest, glowing mushrooms |
| 48–71 | Arcane Steps | 3.3 | Runes, crystals, ruined arches, cascades and stone bridges |
| 72–92 | Crownspire Heights | 5.1 | Castle, observatory, purple portal, finish plaza |
This totals 93 tiles exactly (23+25+24+21).

## Geometry / terrain
- Broad irregular floating island with sculpted grassy upper layers, rocky cliff band, tapered underside and clouds at edges.
- Width target ~65 scene units; depth ~42; terrain heights ~0..6 (tune after character assets).
- Path serpentines through broad horizontal traversals using U-turns; no branch unless rule pack supports branch choice.
- Connected ramp or stair landing for every elevation transition. Height discontinuities cannot be crossed without an authored pawn path.
- Ground: grass + moss + dirt + cobblestone via vertex colors / splatmaps, triplanar cliffs as needed.
- Terrain structure should have logical collision zones; decoration must not intersect tile clearance envelopes.

## Tile geometry
Square beveled fantasy stone slabs, ~1.25–1.65 units wide, <=0.2 gaps, thin translucent glow outline. Special tiles carry symbols, not color alone. Build path transforms from deterministic waypoints and sample arc-length positions; freeze tile transforms as versioned asset data once approved. Board ID, rules, tile effect and position are independent.

## Environmental compositions
- Village: blacksmith teal shingle roof, large ember forge, stone steps, crates, barrow, lanterns; market stalls, fences, footbridge.
- Forest: pine clusters, pink trees, windmill, wooden cabin, glowing mushrooms, soft fireflies and fallen logs; trees never block active tiles.
- Arcane: cyan crystals, purple portal, broken pillars, shrine, cliffside stairs, waterfall under stone bridge.
- Castle: red roof turrets, clock/observatory, flags, gate, elevated finish tile; keep castle behind path rather than in its sightline.
- Water: single believable upper-to-lower system across terraces; several short cascades and one dramatic outer-edge waterfall. No full fluid simulation.

## Camera/occlusion
Fit entire board with existing orbit controls; height angle ~35–55° as prototype; verify tile order from screenshot. Tall objects mostly at edges/rear. Optional temporary transparent occluders when focused pawn behind geometry. Allow zoom for world detail.

## Procedural vs authored
Author core terrain silhouette, terraces, bridges and tile route manually/deterministically. Procedurally scatter grass/rocks/shrubs with seeded placement masks and collision constraints. This maximizes visual coherence and ensures tests are reproducible.

## Validation invariants
Every tile has exactly one tile ID 0..92, valid position/rotation, clearance area, ground/support, unique path order; transition paths cannot intersect occluders; all spawned pawns sit on surfaces; tile symbols remain visible from default camera; landmarks have LOD or culling settings.

## World generation data
See `contracts/map-layout.example.json`, where transforms are **illustrative** and NOT a finished production 3D map. A proper production map is authored in 3D editor / reviewed in browser and exported as tile mapping.
