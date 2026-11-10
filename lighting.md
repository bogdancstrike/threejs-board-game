# Three.js Fantasy Lighting & Cinematic Rendering Overhaul

## Mission

Transform the existing 3D fantasy board-game environment into a visually stunning, cinematic, anime-inspired fantasy world using modern Three.js lighting, shadows, shaders, atmospheric effects, and post-processing.

The visual target is a premium PC fantasy board game with a magical twilight atmosphere, richly illuminated miniature environments, glowing fantasy structures, soft realistic shadows, and vibrant but controlled colors.

**Do not change the application UI, board layout, game rules, player state, tile positions, or camera controls.**

All improvements must apply exclusively to the 3D scene.

The lighting should look excellent from both the default isometric perspective and closer free-orbit camera views.

## 1. Rendering Foundation

Inspect the existing rendering stack before making modifications.

Determine:

- Installed Three.js version.
- Whether the project uses WebGLRenderer, WebGPURenderer, or React Three Fiber.
- Existing tone mapping and color-space configuration.
- Current lights and shadow settings.
- Materials used by the terrain, buildings, tiles, vegetation, and pawns.
- Whether GLB assets include baked lighting or emissive textures.
- Current performance and rendering resolution.

Use the rendering pipeline already compatible with the application.

For WebGLRenderer, use EffectComposer with compatible post-processing passes.

For WebGPURenderer, use the supported RenderPipeline and TSL/node-based effects.

Do not mix incompatible post-processing APIs.

Use physically based materials, linear lighting calculations, correct sRGB texture handling, and a single coherent tone-mapping/output-color pipeline.

### Tone Mapping

Evaluate ACESFilmicToneMapping and AgXToneMapping, where supported by the installed Three.js version.

Choose the one that best preserves:

- Saturated violet magical effects.
- Golden-orange firelight.
- Subtle cyan illumination.
- Anime-style character skin tones.
- Readable tile icons.
- Details in bright emissive surfaces.

Configure exposure through a centralized lighting configuration.

Avoid crushed blacks, overexposed whites, and excessively desaturated highlights.

## 2. Cinematic Three-Point Lighting

Create a cohesive lighting rig based on a magical twilight environment.

### Key Light — Moonlight

Use a DirectionalLight as the primary scene light.

Visual characteristics:

- Cool lavender-blue hue.
- Soft directional shadows.
- Illumination from above and behind the castle.
- Clearly visible silhouettes around trees and buildings.
- Subtle silver highlights on rooftops and character armor.

Suggested starting color: `#A7B9FF`.

### Fill Light — Ambient Sky

Use HemisphereLight or an appropriate environment-lighting solution.

- Cool blue-violet illumination from above.
- Subtle warm reflected coloration from below.
- Enough ambient fill to retain detail in shadowed areas.
- Avoid flattening contrast.

Suggested sky color: `#879AD9`.

### Rim Light — Fantasy Accent

Introduce a subtle supplementary directional or localized light to separate important structures from the background.

Focus on:

- Castle towers.
- Major trees.
- Portal structures.
- Character silhouettes.
- Cliff edges.

Suggested hue: soft pink or lavender.

Do not apply strong rim lighting indiscriminately to every object.

Use material emissive accents where they provide a cheaper and more controlled alternative.

## 3. Advanced Shadow Rendering

Shadows are critical for making the board look like a physical miniature world.

### Primary Shadows

Enable shadow mapping for the primary DirectionalLight.

Evaluate PCFSoftShadowMap or another appropriate shadow strategy supported by the active renderer.

Configure:

- Shadow map resolution.
- Shadow camera bounds.
- Shadow bias.
- Normal bias.
- Shadow near/far planes.
- Shadow-casting objects.

Prioritize shadows from:

- Buildings.
- Trees.
- Player pawns.
- Bridges.
- Large rocks.
- Elevated platforms.

Use one primary shadow-casting directional light by default.

### Contact Shadows

Provide convincing contact between objects and their supporting surfaces.

Prioritize:

- Pawns standing on board tiles.
- Buildings touching the terrain.
- Tree trunks and roots.
- Bridges and supporting foundations.
- Decorative objects near the camera.

Evaluate screen-space contact shadows if the rendering backend supports them.

Use small transparent shadow decals or baked contact shadows when they are more efficient.

Avoid dark halos around objects and double-shadow artifacts.

### Ambient Occlusion

Investigate appropriate AO techniques for the current renderer, including GTAO, SSAO, or baked AO maps.

AO should enhance crevices, not make the entire environment darker.

Target:

- Stone wall joints.
- Roof intersections.
- Stairs and doorways.
- Rock formations.
- Terrain under vegetation.
- Tile borders and raised foundations.

Keep AO restrained and provide a configurable quality level.

## 4. Magical Emissive Lighting

Create localized fantasy lighting that feels alive.

### Board Tiles

Existing tiles must remain readable and preserve their original colors and meanings.

Add:

- Soft emissive borders.
- Subtle light gradients.
- Gentle pulsating glow on special tiles.
- More pronounced illumination for active or selectable tiles.
- A restrained highlight for the current player position.

Use emissive materials and bloom for most tile effects rather than one PointLight per tile.

Only important gameplay events should trigger temporary localized lighting.

### Crystals

Crystal clusters should have:

- Bright emissive inner regions.
- Subtle translucent or faceted appearance.
- Cyan, violet, or pink accents.
- Soft glow around the geometry.
- Optional slow light-intensity animation.

Use shared light sources for crystal clusters where needed.

### Magical Portal

Create a magical purple portal with:

- Animated emissive shader.
- Rotating energy patterns.
- Glowing runes.
- Small floating particles.
- Soft purple spill lighting on nearby stone.
- Subtle distortion within the portal surface.

Do not use a full-screen distortion effect.

### Glowing Mushrooms

Create bioluminescent mushroom clusters.

- Cyan and purple caps.
- Soft emissive materials.
- Subtle pulsation.
- Small glowing spores.

Use actual dynamic lights sparingly.

## 5. Warm Lighting for Buildings

Every major building should contribute to the atmosphere.

### Blacksmith

Create a strong warm glow originating from the furnace.

- Orange-yellow emissive fire.
- Subtle light flickering.
- Warm illumination on nearby tools and walls.
- Glowing molten-metal materials.
- Optional rising ember particles.

### Medieval Houses

Use warm window illumination.

- Amber emissive window textures.
- Soft lighting near entrances.
- Lanterns beside doors.
- Subtle variation between buildings.

### Castle

Illuminate the castle with warm windows and cool exterior moonlight.

- Golden light from windows.
- Cool highlights on towers.
- Illuminated entrance.
- Subtle glowing banners or magical ornaments.

### Lanterns

Create lanterns with:

- Warm emissive cores.
- Gentle flickering.
- Small decorative glow sprites.
- Local light only for visually important lanterns.

Do not create a shadow-casting PointLight for every window, torch, or lantern.

For static structures, prefer emissive materials and baked lighting.

## 6. Cinematic Bloom

Implement bloom as a controlled magical glow effect.

Bloom should emphasize:

- Purple crystals.
- Magical portals.
- Glowing board tiles.
- Fire.
- Lanterns.
- Magical particles.
- Water highlights.

Use a bloom threshold to prevent ordinary surfaces from glowing.

Evaluate selective bloom if the renderer and architecture support it cleanly.

Avoid excessive blur around the board path.

Character faces, UI text, terrain, and ordinary building materials should remain sharp.

Suggested initial WebGL bloom values, to be tuned against actual scene luminance:

- Strength: 0.25–0.55.
- Radius: 0.2–0.5.
- Threshold: 0.85–1.2.

These are tuning references, not universal physically correct values.

Use an appropriate HDR rendering pipeline where required.

## 7. Atmospheric Fog and Depth

The fantasy island should have a convincing sense of depth.

### Background Atmosphere

Create a dark navy-purple environment behind the floating island.

Use subtle atmospheric gradients rather than a flat black background.

The UI itself must remain untouched.

### World Fog

Use FogExp2 or a compatible depth-based atmospheric technique where appropriate.

- Cool bluish-purple distant fog.
- Softening of faraway objects.
- Atmospheric separation between terrain elevations.
- Clear visibility of nearby tiles and pawns.

Avoid obscuring the playable path.

### Floating Island Clouds

Add lightweight clouds beneath the island.

Options include:

- Animated transparent planes.
- Soft particle sprites.
- Layered cloud textures.
- Custom lightweight shaders.

Avoid expensive volumetric ray marching unless demonstrated to be practical.

### Magical Mist

Introduce sparse low-lying mist around:

- Waterfalls.
- Forest areas.
- Magical ruins.
- Portal foundations.

Animate mist slowly and naturally.

## 8. God Rays and Light Shafts

Implement selective cinematic light shafts in places where they add significant visual value.

Possible locations:

- Behind the castle towers.
- Through the enchanted forest.
- Near the magical portal.
- Above a crystal shrine.

Favor lightweight approximations such as transparent tapered meshes or shader-driven beams.

A screen-space volumetric-light implementation may be used if performance permits.

Do not enable expensive full-scene volumetric lighting by default.

Light shafts should be subtle and should not obstruct the board.

## 9. Water and Waterfall Lighting

Water must appear magical and visually rich.

### Rivers

Use:

- Blue/cyan reflective coloration.
- Animated normal or flow textures.
- Soft specular highlights.
- Slight transparency where appropriate.
- Animated foam near edges.

### Waterfalls

Use:

- Animated waterfall materials.
- Bright cyan highlights.
- White foam and mist at impact points.
- Subtle emissive accents for magical waterfalls.
- Soft surrounding illumination where appropriate.

Avoid complex real-time reflections unless a cheaper technique cannot achieve the desired result.

## 10. Character Pawn Lighting

The anime-style character pawns are essential visual focal points.

They should remain attractive, readable, and well-lit from the standard board camera angle.

Use:

- Soft primary lighting.
- Gentle fill to avoid dark faces.
- Subtle rim highlights.
- Correct skin-tone color reproduction.
- Contact shadows beneath the feet.
- Soft highlights on hair, armor, and accessories.

Each pawn should retain its distinctive identity.

Optional hero-lighting techniques can be used for selected pawns, but avoid creating multiple shadow-casting lights per character.

### Selected Pawn

When a pawn is selected:

- Increase the emissive glow of its circular base.
- Add a subtle animated ring.
- Strengthen its colored accent lighting.
- Optionally display a small particle aura.

Never allow pawn glow to hide neighboring tile symbols.

## 11. Color Grading and Artistic Direction

Develop a consistent fantasy color palette.

Suggested colors:

| Element | Color |
|---|---|
| Moonlight | `#A7B9FF` |
| Ambient shadows | `#242B4D` |
| Magical purple | `#A855F7` |
| Magical pink | `#F472B6` |
| Crystal cyan | `#38D9FF` |
| Firelight | `#FFAD55` |
| Warm windows | `#FFD18B` |
| Mystical forest | `#3E806F` |
| Background atmosphere | `#101322` |

Use complementary warm/cool lighting to create cinematic contrast.

Keep vegetation colorful, but avoid overly saturated green terrain.

Preserve the original color semantics of board tiles.

Optional effects:

- Very subtle vignette within the 3D viewport only.
- Gentle contrast adjustment.
- Minimal film grain.
- Optional color-grading LUT.
- Soft atmospheric highlights.

Do not apply heavy chromatic aberration, motion blur, or depth-of-field to normal gameplay.

## 12. Animation and Dynamic Atmosphere

Introduce lightweight environmental animation.

### Effects

- Fire flickering.
- Lantern light variations.
- Crystal pulsation.
- Magical particles drifting.
- Portal energy movement.
- Slowly moving fog.
- Waterfall flow.
- Occasional fireflies.

Avoid synchronized animation across all objects.

Use seeded variations so different lights and environmental effects feel natural.

### Performance

Prefer GPU-side animations and shader uniforms when possible.

Avoid React state updates on every animation frame.

Reuse buffers, materials, and particle geometry.

Pause or reduce animations when the viewport is not visible.

## 13. Performance Optimization

The scene should look impressive without requiring an excessively powerful GPU.

### Lighting Budget

Aim for:

- One primary shadow-casting directional light.
- One global ambient or hemisphere contribution.
- One or two low-cost supplementary lights where justified.
- A limited number of localized non-shadow-casting lights.
- Emissive materials for the majority of decorative glowing objects.
- Baked lighting for static buildings where practical.

Do not introduce dozens of simultaneously active shadow-casting lights.

### Shadow Optimization

- Use tight shadow camera bounds.
- Reduce shadow map resolution for lower graphics presets.
- Avoid casting shadows from unnecessary small decorations.
- Reuse static or baked shadow information where possible.
- Update shadow maps only when necessary and compatible with scene animation.

### Post-Processing Optimization

- Use half-resolution effects when appropriate.
- Avoid redundant full-screen passes.
- Minimize render-target allocations.
- Tune device pixel ratio.
- Avoid excessive transparent particle overdraw.
- Profile GPU time, not only CPU frame time.

### Graphics Presets

Implement three configurable quality presets.

**Low**

- Basic lighting.
- Reduced shadows.
- Limited particles.
- No expensive AO.
- Minimal bloom.

**Medium**

- Soft directional shadows.
- Moderate AO.
- Bloom.
- Animated emissive effects.
- Lightweight atmospheric fog.

**Ultra**

- Higher-quality shadows.
- Enhanced AO/contact shadows.
- Cinematic bloom.
- More atmospheric particles.
- Optional light shafts.
- Enhanced reflections where supported.

All presets must retain correct gameplay readability and visual identity.

### Performance Targets

Measure at the application's actual viewport size and a documented reference GPU.

- Desktop target: 60 FPS in Medium mode.
- Higher-end desktop target: 60 FPS in Ultra mode.
- Avoid persistent frame-time spikes during normal camera movement.
- Maintain acceptable performance with all player pawns visible.
- Profile worst-case scenes containing waterfalls, buildings, particles, and magical effects.

Treat these targets as goals requiring measurement, not guaranteed performance.

## Final Visual Goal

The map should look like a magical handcrafted miniature world illuminated by moonlight, enchanted crystals, warm medieval lanterns, glowing portals, and cascading waterfalls.

The atmosphere should be cinematic, colorful, mysterious, slightly romantic, and visually rich.

It should combine the readability of a tabletop board game with the visual polish of a modern stylized fantasy RPG.

**Prioritize artistic cohesion, excellent lighting, and gameplay readability over adding as many effects as possible.**