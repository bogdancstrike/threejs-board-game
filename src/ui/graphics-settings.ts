import { readGraphics } from "../world/graphics";
export function graphicsSettings() {
  const g = readGraphics();
  const ranges = [
    ["exposure", "Exposure", 65, 180],
    ["bloom", "Bloom glow", 0, 150],
    ["fog", "Atmospheric haze", 0, 180],
    ["weather", "Weather particles", 0, 150],
    ["waterSpeed", "Water flow speed", 0, 200],
    ["foam", "Waterfall foam", 0, 150],
  ] as const;
  return `<section class="graphics-settings"><div class="section-label">CINEMATIC GRAPHICS</div><label class="settings-label">Lighting mood<select id="lighting-setting">${[
    ["cinematic", "Cinematic twilight"],
    ["daylight", "Clear daylight"],
    ["sunset", "Golden sunset"],
    ["moonlight", "Moonlit night"],
  ]
    .map(
      ([id, label]) =>
        `<option value="${id}" ${g.lighting === id ? "selected" : ""}>${label}</option>`,
    )
    .join(
      "",
    )}</select></label>${ranges.map(([key, label, min, max]) => `<label class="audio-range"><span>${label}</span><input type="range" min="${min}" max="${max}" value="${Math.round(g[key] * 100)}" data-graphics="${key}" aria-label="${label}"/><output id="graphics-${key}">${Math.round(g[key] * 100)}%</output></label>`).join("")}${[
    ["shadows", "Soft shadows"],
    ["ao", "Ambient occlusion"],
    ["spray", "Waterfall spray"],
  ]
    .map(
      ([key, label]) =>
        `<label class="toggle-setting"><span>${label}</span><input type="checkbox" data-graphics-toggle="${key}" ${g[key as "shadows" | "ao" | "spray"] ? "checked" : ""}/></label>`,
    )
    .join(
      "",
    )}<p class="modal-note">Medium and Ultra enable bloom, ambient occlusion and shadows. Low keeps water animation, lighting mood, exposure and atmosphere with lighter rendering. These preferences follow you across worlds.</p><button class="secondary-button full-width" data-action="reset-graphics">Restore cinematic defaults</button></section>`;
}
