# Asset sourcing, licensing and conversion
## Search patterns (Sketchfab etc.)
`stylized floating island`, `fantasy diorama`, `medieval village pack`, `stylized blacksmith`, `hand painted low poly castle`, `low poly pine tree pack`, `stylized waterfall`, `fantasy stone bridge`, `magic crystal`, `fantasy portal`, `anime fantasy character rigged`, `stylized fantasy prop pack`.

## Requirements before adding any asset
Record source URL, creator, original license, commercial rights, attribution, file hash, model triangles, textures and animation names. Review license individually: public display/download does NOT imply redistribution or modification rights. CC BY needs attribution. Avoid CC BY-NC for commercial plans. Do not assume the Archive.org collection's CC0 metadata grants rights to the original game's content.

## Conversion pipeline
Blender import -> normalize metric scale/pivots -> decimate only if required -> apply transforms -> consolidate PBR materials -> bake maps where helpful -> remove unused nodes -> export GLB -> optimize using glTF Transform or gltfpack -> compress texture KTX2 where supported -> preview in Three.js -> screenshot QA -> register manifest.

## Runtime budgets (initial targets; measure on real assets)
- Hero 3D pawn: target 15k–35k triangles / optimized textures; preview model may be higher quality.
- Main terrain and landmarks: optimize draw calls; do not set a magic global triangle ceiling without profiling.
- Repeated grass/rocks: instance and pack materials; avoid 1 material/mesh per tuft.
- Audio: licensed original loops/SFX; no original CD audio reuse.

## Missing-asset handling
Use labeled placeholders in dev, no claims of production visual completion. Do not generate 3D GLBs by pretending a rendered image is an editable character model.
