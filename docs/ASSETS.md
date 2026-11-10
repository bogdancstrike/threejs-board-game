# Character and environment assets

The game keeps character identity, appearance, game state, model loading and animated transforms separate. All twelve fictional roster characters are adult (24–30). Models supplied by the user are identified as adapted art in the character selector. Missing final art is explicitly marked **Prototype**.

## Included assets

| Game entry | Source file from the supplied collection | Animation implementation |
|---|---|---|
| Lyra | `sorceress.glb` | Static source, procedural deformation rig |
| Seraphine | `hilda.glb` | Original skeleton, procedural joint posing |
| Rhea | `yanne_cos17halloween_kings_raid.glb` | Static source, procedural deformation rig |
| Nyx | `pc___computer_-_action_taimanin_-_playable_chara.glb` | Original skeleton, procedural joint posing |
| Selene | `lyfe_bestla_snowbreak.glb` | Static source, procedural deformation rig |
| Elowen | `goblin_slayer_high_elf_archer.glb` | Optimized static source, procedural deformation rig |
| Vesper | `dark_fantasy_demon_queen.glb` | Optimized static source, procedural deformation rig |
| Alaric | `3drt_-_fantasy_warrior.glb` | Original skeleton, procedural posing |
| Village bridge | `stylized_bridge_low_poly.glb` | Static environment model |

Original author, source URL, embedded license metadata, and modifications are retained in `public/ASSET-CREDITS.md`, copied into production output and linked from game help. The four other characters have individually colored and equipped articulated prototype figurines. No production anime-art quality is claimed for those prototypes.

## Replacing a character

1. Put an optimized GLB in `public/models/`.
2. Add or change the corresponding `MODEL_PATHS` entry in `src/world/assets.ts`.
3. Keep its stable character ID in `src/game/data.ts`; this preserves saved games.
4. Record original creator, license, source and changes in `public/ASSET-CREDITS.md`.
5. Inspect all preview actions and the pawn at board distance. Runtime loading clones skeletons and normalizes bounds to approximately 1.5 world units above the base. Skinned bounds must be recalculated before scale normalization.
6. Run `npm run build`, `npm test`, and `npm run test:e2e`. The animation browser check verifies that imported models stay in a sensible bounding volume while posing.

Models and textures are loaded locally. Models do not depend on the original Downloads directory after copying. GLTFLoader caches successful loads; repeated players and previews share source asset data. Additional optimized models use the bundled Meshopt decoder and WebP textures; no Draco/KTX2 decoder is currently required. Add compatible decoders if introducing compressed assets.

## Production character-art requirements

For each final hero, supply a model matching the written identity, a consistent fantasy/anime style, production skin weights, face and eye materials, attachment points, and authored idle, walk, run, relaxed, signature, reaction and victory clips. Use AnimationMixer for authored clips. The existing system can start an explicitly named `idle` clip; a production clip registry should map the full set of named clips to action states and crossfade between them.

The static-model rig is an intentionally approximate runtime solution: it assigns region-based vertex weights to a small skeleton. It produces visible limb and body motion but does not replace hand-authored weights, cloth animation, finger animation, or polished motion capture. Imported skeletons currently use bone-name-based procedural motion. Some costumes may bend imperfectly. Prototype figures have articulated limbs, characteristic equipment, hats/horns/capes, colored bases, and breathing/walking/resting/gesture poses.

The roster selection, orbit/zoom preview, action buttons, cosmetic aura selection, pawn updates, intermediate-tile movement, elevation changes, and multiplayer placement are implemented independently of final art.
