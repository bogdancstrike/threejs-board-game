# Anime fantasy characters & selection
## Style
Adult (21+) anime fantasy collectible figurines with attractive, glamorous aesthetics, expressive faces, varied body proportions and tasteful fantasy outfits. Female-led roster, with some male heroes. Avoid sexualized childlike designs. Distinct readable silhouettes at pawn scale.

## Initial roster (proposal)
|ID|Character|Archetype|Appearance cue|Primary aura|
|---|---|---|---|---|
|lyra|Lyra|Violet enchantress|Purple hair, elegant witch dress, hat and staff|violet|
|seraphine|Seraphine|Moonlight knight|Silver hair, pale blue/gold armor|blue|
|rhea|Rhea|Scarlet rogue|Red hair, leather armor, daggers|red|
|elowen|Elowen|Elven priestess|Pale blonde hair, green/white dress|green|
|akari|Akari|Kitsune sorceress|Black hair, fox ears, red kimono|amber|
|nyx|Nyx|Shadow assassin|Dark hair, fitted purple-black armor|indigo|
|aurelia|Aurelia|Golden valkyrie|Blonde hair, gilded armor and spear|gold|
|selene|Selene|Frost witch|Blue-silver hair, icy gown|cyan|
|vesper|Vesper|Crimson demoness|Adult horned woman, red-black clothes|crimson|
|alaric|Alaric|Royal paladin|Blonde man, blue/gold armor|gold|
|kael|Kael|Shadow swordsman|Black-haired man, long dark coat|indigo|
|orion|Orion|Arcane scholar|Silver-haired man, tome and robes|blue|

## UI integration
Keep main game shell. Character selection is a modal: portrait grid (2D thumbnails), chosen character 3D turntable with full/body/face/equipment cameras, idle and signature animation, details, outfit palette selector, confirm. Allow gallery to render immediately using thumbnails and lazy-load only selected high-detail GLB.

## Three-level asset presentation
Gallery uses 2D pre-render portraits; preview uses full-quality rigged GLB + controlled 3-point cinematic lights; game pawn uses optimized GLB/LOD and simple animation. Avoid 12 full preview rigs mounted simultaneously.

## Movement and overlap
Authoritative tile ID independent of rendered position; path tween between consecutive waypoints incl. elevation. Multiple players on same tile use deterministic local offsets in circular footprint; avoid clipping. Idle/move/land/celebrate animation state machine with graceful fallback to idle if clip absent.

## Cosmetics
Outfit, aura, hair/eye variants only if assets genuinely support it. No stats tied to appearance. Persist cosmetics for session and, later, account. Keep asset ownership/licensing registry.

## Acceptance
Four production models for MVP; 12 fully defined roster entries can have clearly marked placeholders. Character selection updates player state once; no duplicate claims; preview model unloads cleanly; players stay visible at map fit camera.
