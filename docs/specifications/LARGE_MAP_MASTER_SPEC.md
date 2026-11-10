# Large fantasy map master specification — Wilder

## Objective
Expand the *perceived* world footprint ~2–3× compared with the current compact diorama while preserving exactly 93 gameplay tiles, 10 distinct world identities, and unchanged UI. Illustrative target footprint: `X in [-35,35], Z in [-40,40]`, but adopt measured values after inspecting current tile and landmark bounds. **Do not stretch old geometry naively.** Preserve stone tile world-space width as a readability anchor and increase empty scenic space around the route.

## Default flagship world: Verdant Crown
Four readable terraces: 0–22 village, 23–47 woodland, 48–71 highlands, 72–92 castle. These ranges are illustrative and must not change tile identifiers or current theme-specific path definitions.

- Village: warm timber and stone houses, tavern, forge, cobbled areas, gardens, fields, market, tree clusters, gentle brook; no clutter within playable corridors.
- Woodland: tall stylized pines, cherry blossoms, mossy rocks, mushrooms, stream overpasses, windmill on hill, 2–4 little cabins, animated wildlife.
- Arcane: tall cliffs, layered terracing, glowing crystals, ruins, hovering stones, ravine and large waterfall, short arch bridge, purple trees.
- Castle: prominent multi-tower castle, courtyard, battlements, banners, portal, gardens, distant cloud archipelago.

## Geometric system
- Use consistent world units. Define `WorldLayout` with `bounds`, `islandMask`, `terraces`, `safeCorridors`, `landmarks`, `rivers`, `bridges`, `decorativeZones`, `cameraMarkers`.
- Protected corridors around 93 tiles: reserve tile footprint + 0.5–1.2 tile-width clearance for pawns, camera and move effects. Landmarks must not intersect corridors.
- Derive terrain blend heights at route-adjacent vertices from the original route `groundHeight` and tile center positions. Use smooth transitions into highland slopes outside protected path.
- Generate a top surface from shared heightfield/SDF with contiguous normals, and cliff skirt geometry with 5–8 layered bands and coherent slope; separate lower-chunk LOD from tile path.
- Rivers are authored Bezier/spline routes with path collision/bridge annotations. Couple waterfall positions to terrace breaks; forbid streams crossing board tiles without a designated bridge.
- Design at least four discrete elevation silhouettes but avoid cliffs blocking foreground characters from isometric camera.
- Use multi-scale noise (low-frequency macro rolling hills, mid-frequency ridges, subtle high-frequency erosion), with deterministic seed and authored masks. Never perturb protected tile surfaces.
- Maintain soft regions across biome edges with biome weights and material blending; avoid a 4-band straight-line color segmentation.
- The floating underside follows a tapering cliff mass and has rock wedges and 1–3 suspended satellite rocks.

## Gameplay route
The original route is authoritative: `getTiles(mapId)` in `src/game/data.ts`; tile IDs are not spatially inferred. Create `getWorldTileTransform(mapId,index)` and maintain backwards compatibility or migrate only rendering positions; behavior and saves remain stable. `worldPosition` includes Y (elevation), tangent, surface normal, and optional cinematic camera waypoint. Route connection lengths and ascent gradients must be validated. For steps/bridges, animate pawns on piecewise spline interpolation with y-correction; NEVER lerp through a cliff.

## Composition/layout budget (starting targets, not measured present state)
- 1 large mainland + 2–5 satellite islets per world.
- 15–25 major landmarks/buildings (including repeated cottages, small shrines), **not all unique models**.
- 100–220 trees placed in clusters; ~200–700 smaller foliage instances at chosen quality, less for low preset.
- 3–6 water features, 2–4 designed crossings, 2–5 waterfalls, 6–14 crystal groups.
- World landmark silhouettes should be distinct across the 10 worlds, avoiding identical castles everywhere.
- Visible area should have >=30% scenic negative space around pathways and buildings.

## Camera and UX
Default camera shows route start/finish plus height differences without hidden active pawn. Auto-fit based on world bounding box and actual aspect ratio. Retain `F` follow pawn and `R` reset camera. Support full-island view and region closeups. Avoid excessive dwarfing of pawns after world expansion; dynamic camera adaptively follows player, optionally zooms into encounters, and smoothly returns.

## World definitions
- Verdant: village-forest-highland-castle flagship.
- Dragonkind: wing-like cliffs, academy and parapets.
- Frost: hexagonal ice floe, frozen terraces and palace.
- Desert: diamond dunes, oases and stepped temple.
- Sakura: five-petal island, pink grove, red torii and pagoda.
- Ember: volcano ring, obsidian and fortress.
- Tide: multi-isle archipelago and lighthouse, bridges emphasized.
- Mycelium: lobed hollow, giant glowing mushroom forest.
- Astral: crescent with floating stepping stones and observatory.
- Clockwork: geared edges, copper gardens and giant clock tower.

## Nonfunctional quality gates
60 FPS Medium target on a documented GPU/viewport after 5 minutes camera movement, graceful Low preset, route snapshot test tile positions, zero map cracks/holes, zero landmark overlap with tile-clearance mesh, pawns never clip heightfield, transitions never cross obstacle volumes, asset loading lazy, no unbounded instantiation or event listener leaks.

See `references/concepts/01_large_93_tile_world_plan.png`, `02_elevation_profile.png`, `03_ten_worlds_styleboard.png`. They are conceptual diagrams, not extracted app geometry.
