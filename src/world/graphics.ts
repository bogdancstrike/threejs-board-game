export const LIGHTING_STYLES = [
  ["cinematic", "Cinematic twilight"],
  ["daylight", "Clear daylight"],
  ["dawn", "Misty dawn"],
  ["sunset", "Golden sunset"],
  ["storm", "Gathering storm"],
  ["moonlight", "Moonlit night"],
  ["aurora", "Aurora night"],
  ["dynamic", "Living day & night cycle"],
] as const;
export type LightingStyle = (typeof LIGHTING_STYLES)[number][0];
export type ShadowQuality = "low" | "medium" | "high";
export type Quality = "low" | "medium" | "high" | "ultra";
export interface GraphicsOptions {
  lighting: LightingStyle;
  exposure: number;
  bloom: number;
  fog: number;
  weather: number;
  waterSpeed: number;
  foam: number;
  spray: boolean;
  shadows: boolean;
  ao: boolean;
  /** Sun azimuth offset in degrees, rotating the key light around the island. */
  sunAngle: number;
  /** Length of a full day in the dynamic lighting mode, in minutes. */
  cycleMinutes: number;
  shadowQuality: ShadowQuality;
  /** Multiplies the quality preset's pixel ratio. */
  renderScale: number;
  /** 0 means uncapped (display refresh rate). */
  fpsCap: number;
  saturation: number;
  contrast: number;
  vignette: number;
  wind: number;
  antialias: boolean;
  dynamicResolution: boolean;
  showFps: boolean;
}
export const GRAPHICS_DEFAULTS: GraphicsOptions = {
  lighting: "cinematic",
  exposure: 1.16,
  bloom: 0.55,
  fog: 0.8,
  weather: 1,
  waterSpeed: 1,
  foam: 1,
  spray: true,
  shadows: true,
  ao: true,
  sunAngle: 0,
  cycleMinutes: 4,
  shadowQuality: "medium",
  renderScale: 1,
  fpsCap: 0,
  saturation: 1.05,
  contrast: 1.04,
  vignette: 0.28,
  wind: 1,
  antialias: true,
  dynamicResolution: false,
  showFps: false,
};
export const FPS_CAPS = [0, 30, 60, 120] as const;
/** Rendering budget per quality preset; graphics options refine it further. */
export const QUALITY_PRESETS: Record<
  Quality,
  {
    label: string;
    pixelRatio: number;
    shadowMap: number;
    post: boolean;
    aoSamples: number;
  }
> = {
  low: {
    label: "Low · fastest",
    pixelRatio: 1,
    shadowMap: 1024,
    post: false,
    aoSamples: 0,
  },
  medium: {
    label: "Medium · balanced",
    pixelRatio: 1.25,
    shadowMap: 1024,
    post: true,
    aoSamples: 8,
  },
  high: {
    label: "High · sharp",
    pixelRatio: 1.5,
    shadowMap: 2048,
    post: true,
    aoSamples: 12,
  },
  ultra: {
    label: "Ultra · cinematic",
    pixelRatio: 2,
    shadowMap: 2048,
    post: true,
    aoSamples: 16,
  },
};
export const SHADOW_MAP_SIZE: Record<ShadowQuality, number> = {
  low: 1024,
  medium: 2048,
  high: 4096,
};
export function isQuality(value: unknown): value is Quality {
  return typeof value === "string" && value in QUALITY_PRESETS;
}
export function parseGraphics(raw: string | null): GraphicsOptions {
  try {
    const input = JSON.parse(raw || "{}") || {};
    const value = (key: keyof GraphicsOptions, min: number, max: number) =>
      typeof input[key] === "number" && Number.isFinite(input[key])
        ? Math.max(min, Math.min(max, input[key]))
        : (GRAPHICS_DEFAULTS[key] as number);
    const flag = (key: keyof GraphicsOptions) =>
      typeof input[key] === "boolean"
        ? input[key]
        : (GRAPHICS_DEFAULTS[key] as boolean);
    return {
      lighting: LIGHTING_STYLES.some(([id]) => id === input.lighting)
        ? input.lighting
        : "cinematic",
      exposure: value("exposure", 0.65, 1.8),
      bloom: value("bloom", 0, 1.5),
      fog: value("fog", 0, 1.8),
      weather: value("weather", 0, 1.5),
      waterSpeed: value("waterSpeed", 0, 2),
      foam: value("foam", 0, 1.5),
      spray: input.spray !== false,
      shadows: input.shadows !== false,
      ao: input.ao !== false,
      sunAngle: value("sunAngle", 0, 360),
      cycleMinutes: value("cycleMinutes", 1, 20),
      shadowQuality: ["low", "medium", "high"].includes(input.shadowQuality)
        ? input.shadowQuality
        : GRAPHICS_DEFAULTS.shadowQuality,
      renderScale: value("renderScale", 0.5, 1.5),
      fpsCap: (FPS_CAPS as readonly number[]).includes(input.fpsCap)
        ? input.fpsCap
        : 0,
      saturation: value("saturation", 0, 2),
      contrast: value("contrast", 0.5, 1.5),
      vignette: value("vignette", 0, 1),
      wind: value("wind", 0, 2.5),
      antialias: flag("antialias"),
      dynamicResolution: flag("dynamicResolution"),
      showFps: flag("showFps"),
    };
  } catch {
    return { ...GRAPHICS_DEFAULTS };
  }
}
export function readGraphics(): GraphicsOptions {
  try {
    return parseGraphics(localStorage.getItem("wilder-graphics-v1"));
  } catch {
    return { ...GRAPHICS_DEFAULTS };
  }
}
export function saveGraphics(options: GraphicsOptions) {
  try {
    localStorage.setItem("wilder-graphics-v1", JSON.stringify(options));
  } catch {}
}
/** Pixel ratio for a preset, scaled by render scale and the dynamic-resolution governor. */
export function pixelRatioFor(
  quality: Quality,
  renderScale: number,
  device = 1,
  dynamic = 1,
) {
  return Math.max(
    0.5,
    Math.min(device, QUALITY_PRESETS[quality].pixelRatio) *
      renderScale *
      dynamic,
  );
}
/** Frame pacing: true when enough time has passed for the configured cap. */
export function frameDue(now: number, last: number, cap: number) {
  if (!cap) return true;
  return now - last >= 1000 / cap - 1.5;
}
/**
 * Dynamic resolution governor: lowers the scale when frames are slow and
 * restores it gradually when there is headroom.
 */
export function governResolution(
  current: number,
  frameMs: number,
  target = 1000 / 55,
) {
  if (frameMs > target * 1.25) return Math.max(0.55, current - 0.08);
  if (frameMs < target * 0.8) return Math.min(1, current + 0.03);
  return current;
}
/** Sun elevation/azimuth/warmth for the day-night cycle, phase in [0, 1). */
export function dayPhase(phase: number) {
  const p = ((phase % 1) + 1) % 1;
  const elevation = Math.sin(p * Math.PI * 2); // >0 day, <0 night
  return {
    elevation,
    daylight: Math.max(0, elevation),
    night: Math.max(0, -elevation),
    golden: Math.max(0, 1 - Math.abs(elevation) * 3.2),
    azimuth: p * Math.PI * 2,
  };
}
