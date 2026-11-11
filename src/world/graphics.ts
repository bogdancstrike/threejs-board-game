export type LightingStyle = "cinematic" | "daylight" | "sunset" | "moonlight";
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
};
export function parseGraphics(raw: string | null): GraphicsOptions {
  try {
    const input = JSON.parse(raw || "{}") || {};
    const value = (key: keyof GraphicsOptions, min: number, max: number) =>
      typeof input[key] === "number" && Number.isFinite(input[key])
        ? Math.max(min, Math.min(max, input[key]))
        : (GRAPHICS_DEFAULTS[key] as number);
    return {
      lighting: ["cinematic", "daylight", "sunset", "moonlight"].includes(
        input.lighting,
      )
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
