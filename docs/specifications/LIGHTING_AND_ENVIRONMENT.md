# Three.js r180 — lighting, water, fog and performance

Maintain the existing `src/world/lighting.ts`, `ao.ts`, `atmosphere.ts`, `water.ts`, `vfx.ts` and scene quality presets. No wholesale renderer rewrite.

- Cool lavender directional moonlight + HemisphereLight sky/ground + baked warm window emissive, one main shadow caster, optional localized nonshadow lights for furnace/portal near camera.
- Frame-dependent GTAO/contact shadow effects compatible with existing WebGL composer; preserve original translucent sprites without halos. Profile AO radius as island expands.
- Avoid adding one PointLight per glowing tile/window; emissive texture/bloom is primary. Three.js emissive materials do not dynamically bounce light into other meshes.
- Soft ambient fog and cloud layers below the island; keep tile labels readable. Avoid full-scene thick fog when camera backs out to show expanded island.
- Waterways use UV flow animation and normals, waterfalls use mesh strips and mist sprite clusters, not physically simulated fluid.
- Bloom selectively accentuates crystals/portals with HDR luminance thresholds. No washed-out pawns or unclear tile symbols.
- Color management: renderer output sRGB; correct texture encoding; one consistent tone mapping, calibrate exposure against current world previews rather than picking arbitrary fixed post-processing values.
- Graphics presets: Low no AO/bloom or heavy particles; Medium reduced AO/bloom and shadow map; Ultra higher resolution/particles. Explicit no expensive unnecessary point shadows.
- Instrument renderer.info, frame-time percentiles p50/p95/p99, mesh count, draw calls, texture and geometry counts, asset load waterfall, GPU timings where supported.
- Day/night styles are optional future feature: avoid changing twilight art direction in current scope.
