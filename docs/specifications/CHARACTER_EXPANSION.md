# Anime fantasy character overhaul — align with existing Wilder

Current: 12 adult heroes; eight adapted model assets, four prototype figures per `docs/ASSETS.md`. The current UI has rotating preview with outfit/equipment view and actions (Idle, Walk, Run, Relax, Magic). Preserve selection and player ID links; upgrade the underlying art rather than recreating the roster.

## Target
9 female / 3 male attractive adult heroes in a consistent glamorous, tasteful anime-fantasy style; stylish clothing, high quality rigged faces/eyes, expressive idle loops and heroic poses. Distinct facial shapes, skin tones, silhouettes and outfits; no character under 21. Avoid making designs indistinguishable or using one crude procedural rig for hero close-up shots.

## Camera and UI
Keep existing selector and add preview background/3-point lighting only inside the 3D canvas. Camera positions must anchor to bone head/chest/full-body bounding box. Enforce near-plane and orbit safety. Give preview profiles per character instead of uniform assumed scale. Character portraits: high quality 512px thumbnail (not a realtime renderer for 12 thumbnails).

## Asset pipeline
Stable character IDs from `src/game/data.ts`. For each character deliver preview GLB, optimized board GLB or level-of-detail, metadata (license/artist/source), 2K max hero textures / 512–1K board, rig bone standard, authored clips idle/walk/run/select/magic/react/victory, FBX->GLB preprocess if necessary. Support Skinning/AnimationMixer, shared preview/movement motions with per-hero overrides; imported model original orientation normalization, materials audit, bone retargeting.

## Specific initial art targets
Lyra purple sorceress; Seraphine silver moon knight; Rhea red rogue; Elowen elf priestess; Akari kitsune; Nyx shadow assassin; Aurelia valkyrie; Selene frost witch; Vesper demoness; Alaric paladin; Kael swordsman; Orion scholar. Existing characters must not be renamed or removed in saves.

## QA
Portrait vs preview consistency; every hero distinct at 120px pawn height, idle animate without skin tears, mesh tangent/transparent hair sorted, no clipping into tiles, 4 players can share tile without collision, cosmetics deterministic and cosmetic-only, asset credit always visible. Example manual tests: full rotation; closeup face; zoom extremes; walk across 4 elevations; transition out of combat/emote; 10 minutes idle memory leak monitor.
