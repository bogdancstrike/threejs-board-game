# Three.js fantasy lighting & performance spec
## Compatibility-first setup
Determine Three.js and rendering stack from repo. On WebGLRenderer, select compatible composer/render passes; on WebGPURenderer use matching node/TSL pipeline. Do not combine APIs blindly. Set correct renderer output color space (sRGB), linear lighting calculations, tone mapper (evaluate AgX/ACES), tune exposure. Avoid double tone mapping.

## Main rig
1 shadow-casting cool lavender directional key (moonlight), non-shadow hemisphere sky/ground fill, optional accent/rim from rear. Use tight shadow-camera frustum, PCF soft shadows where supported, bias tuning, drop shadows from tiny props. Bake static AO/light into textures for many buildings.

## Local lights / material strategy
- Fire: warm emissive fire + few localized point lights with subtle flicker (prefer no shadows).
- Windows/lanterns: emissive glass and sprite halos, selected pooled local lights only.
- Crystals/portal: strong emissive materials, controlled bloom, one light per important cluster at most.
- Tiles: emissive border per slab, active-ring pulse; avoid 93 point lights.
- Pawns: readable faces under fill, rim accent, contact shadows and glowing colored bases.

## Post-processing tiers
Medium: ambient occlusion via supported GTAO/SSAO, selective or high-threshold bloom, gradient fog; optional FXAA/SMAA depending renderer and antialias setup. Ultra: stronger AO, shadow quality, soft particles, optional localized ray shafts, improved water highlights. Low: minimal shadows and bloom, reduced particles, no costly AO.

## Water / fog
Flow/normal-map water material, foam meshes near falls, mist sprites. Use depth-based fog to soften distant cliffs but NOT obscure gameplay path. Light shafts can be textured alpha cones or cheap screen-space effect rather than full volumetric simulation.

## Initial knobs (tune visually)
- Moonlight color #A7B9FF, ambient sky #879AD9, fire #FFAD55.
- Bloom threshold ~0.9–1.2, strength ~0.25–0.55, radius ~0.2–0.5 on the specific compatible implementation.
- Render scale low 0.75; medium 1.0; ultra 1.0–1.5 only where GPU allows.
- Profile GPU frame timing, shader compilation spikes, transparent overdraw and draw calls before widening effects.

## Validation
Screenshot golden views: default orbit, zoom village, elevated castle, selected pawn, 4-player scene. Test color blindness (symbols not colors alone), reduced motion, no flicker-induced discomfort, text legibility, FPS/1% low and GPU memory across presets.
