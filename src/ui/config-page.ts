import {
  FPS_CAPS,
  LIGHTING_STYLES,
  QUALITY_PRESETS,
  type GraphicsOptions,
  type Quality,
} from "../world/graphics";
import {
  AURAS,
  MOVE_SPEEDS,
  type Preferences,
  type Profile,
} from "../settings/preferences";
import { CHARACTERS } from "../game/data";
import { DIFFICULTIES } from "../game/decks";
export const CONFIG_SECTIONS = [
  ["profile", "user-round", "Player"],
  ["display", "monitor", "Display & performance"],
  ["lighting", "sun", "Lighting & atmosphere"],
  ["grading", "palette", "Colour & water"],
  ["gameplay", "dices", "Gameplay"],
  ["camera", "move-3d", "Camera & controls"],
  ["audio", "volume-2", "Audio"],
  ["access", "accessibility", "Accessibility"],
] as const;
type Range = [
  key: string,
  label: string,
  min: number,
  max: number,
  divisor?: number,
  unit?: string,
  step?: number,
];
export function formatSetting(value: number, unit = "%") {
  if (unit === "%") return Math.round(value) + "%";
  if (unit === "°") return Math.round(value) + "°";
  if (unit === "min") return value + " min";
  if (unit === "x") return (value / 100).toFixed(2) + "×";
  return String(value);
}
const range = (
  attr: "graphics" | "pref",
  source: Record<string, unknown>,
  [key, label, min, max, divisor = 100, unit = "%", step = 1]: Range,
  hint = "",
) => {
  const value = Math.round((source[key] as number) * divisor);
  return `<label class="audio-range config-range"><span>${label}${hint ? `<small>${hint}</small>` : ""}</span><input type="range" min="${min}" max="${max}" step="${step}" value="${value}" data-${attr}="${key}" data-divisor="${divisor}" data-unit="${unit}" aria-label="${label}"/><output id="${attr}-${key}">${formatSetting(value, unit)}</output></label>`;
};
const toggle = (
  attr: "graphics-toggle" | "pref-toggle" | "profile-toggle",
  key: string,
  label: string,
  hint: string,
  checked: boolean,
) =>
  `<label class="toggle-setting"><span><strong>${label}</strong><small>${hint}</small></span><input type="checkbox" data-${attr}="${key}" ${checked ? "checked" : ""}/></label>`;
const select = (
  id: string,
  attr: string,
  label: string,
  options: readonly (readonly [string | number, string])[],
  value: string | number,
) =>
  `<label class="settings-label">${label}<select ${id ? `id="${id}"` : ""} ${attr}>${options.map(([v, l]) => `<option value="${v}" ${String(v) === String(value) ? "selected" : ""}>${l}</option>`).join("")}</select></label>`;
const section = (id: string, eyebrow: string, title: string, body: string) =>
  `<section class="config-section" id="config-${id}" data-config-section="${id}"><header><span class="eyebrow">${eyebrow}</span><h3>${title}</h3></header><div class="config-grid">${body}</div></section>`;
export interface ConfigState {
  graphics: GraphicsOptions;
  prefs: Preferences;
  profile: Profile;
  quality: Quality;
  audio: { enabled: boolean; music: number; ambience: number; effects: number };
  partySize: number;
  escape: (s: string) => string;
  icon: (name: string) => string;
}
export function configPage(s: ConfigState) {
  const g = s.graphics as unknown as Record<string, unknown>,
    p = s.prefs as unknown as Record<string, unknown>,
    i = s.icon;
  const hero = CHARACTERS.find((c) => c.id === s.profile.character)!;
  const nav = `<nav class="config-nav" aria-label="Settings sections">${CONFIG_SECTIONS.map(([id, ic, label], n) => `<button data-config-jump="${id}" class="${n === 0 ? "active" : ""}">${i(ic)}<span>${label}</span></button>`).join("")}</nav>`;
  const profile = section(
    "profile",
    "WHO IS TRAVELLING?",
    "Player profile",
    `<div class="profile-card"><div id="profile-preview" class="profile-preview" style="--hero-color:${hero.color}"></div><div class="profile-fields"><label class="settings-label">Display name<input id="profile-name" class="text-input" maxlength="24" autocomplete="nickname" placeholder="What should the island call you?" value="${s.escape(s.profile.name)}"/></label>${select(
      "profile-character",
      'data-profile="character"',
      "Favourite adventurer",
      CHARACTERS.map((c) => [
        c.id,
        `${c.name} · ${c.title.replace(/^The /, "")}`,
      ]),
      s.profile.character,
    )}<div class="settings-label">Aura colour<div class="color-options profile-auras">${AURAS.map(([c, n]) => `<button aria-label="${n} aura" data-profile-tint="${c}" style="--swatch:${c}" class="${c === s.profile.tint ? "active" : ""}"></button>`).join("")}</div></div><p class="modal-note">Your profile pre-fills new games and rooms. Choose your hero again any time from the adventurer gallery.</p></div></div>${select(
      "profile-difficulty",
      'data-profile="difficulty"',
      "Default card difficulty",
      DIFFICULTIES.map((d) => [
        d.id,
        `${d.name} · ${d.count} cards${d.adult ? " · adults" : ""}`,
      ]),
      s.profile.difficulty,
    )}${select(
      "profile-party",
      'data-profile="partySize"',
      "Default party size",
      [1, 2, 3, 4, 5, 6, 7, 8].map((n) => [
        n,
        n === 1 ? "Solo" : `${n} players`,
      ]),
      s.profile.partySize,
    )}${select(
      "profile-mode",
      'data-profile="mode"',
      "Default victory rules",
      [
        ["classic", "Classic race · first to finish"],
        ["score", "Score expedition · highest points"],
      ],
      s.profile.mode,
    )}${toggle("profile-toggle", "challenges", "Road adventures by default", "Dangers, dares, cards and mini-games", s.profile.challenges)}`,
  );
  const display = section(
    "display",
    "SMOOTH OR SPECTACULAR",
    "Display & performance",
    `${select(
      "quality-setting",
      "",
      "Graphics quality preset",
      Object.entries(QUALITY_PRESETS).map(([k, v]) => [k, v.label]),
      s.quality,
    )}${select(
      "",
      'data-graphics-select="shadowQuality"',
      "Shadow resolution",
      [
        ["low", "Low · 1024"],
        ["medium", "Medium · 2048"],
        ["high", "High · 4096"],
      ],
      s.graphics.shadowQuality,
    )}${select(
      "",
      'data-graphics-select="fpsCap"',
      "Frame-rate limit",
      FPS_CAPS.map((f) => [f, f ? `${f} FPS` : "Unlimited · match display"]),
      s.graphics.fpsCap,
    )}${range("graphics", g, ["renderScale", "Render scale", 50, 150, 100, "%", 5], "Lower for speed, higher for crispness")}${toggle("graphics-toggle", "dynamicResolution", "Dynamic resolution", "Lowers resolution automatically to keep motion smooth", s.graphics.dynamicResolution)}${toggle("graphics-toggle", "antialias", "Edge smoothing (FXAA)", "Softens jagged edges on Medium and above", s.graphics.antialias)}${toggle("graphics-toggle", "shadows", "Soft shadows", "Cast shadows from the sun and moon", s.graphics.shadows)}${toggle("graphics-toggle", "ao", "Ambient occlusion", "Contact shading in crevices and under props", s.graphics.ao)}${toggle("graphics-toggle", "showFps", "Show frame rate", "A small performance meter on the board", s.graphics.showFps)}<p class="modal-note">Low skips post-processing entirely. High and Ultra add sharper pixels, light shafts, more particles and higher-quality occlusion.</p>`,
  );
  const lighting = section(
    "lighting",
    "SET THE MOOD",
    "Lighting & atmosphere",
    `${select("lighting-setting", "", "Lighting mood", LIGHTING_STYLES, s.graphics.lighting)}${range("graphics", g, ["sunAngle", "Sun direction", 0, 360, 1, "°", 5], "Rotate the light around the island")}${range("graphics", g, ["cycleMinutes", "Day length", 1, 20, 1, "min"], "Used by the living day & night cycle")}${range("graphics", g, ["exposure", "Exposure", 65, 180])}${range("graphics", g, ["bloom", "Bloom glow", 0, 150])}${range("graphics", g, ["fog", "Atmospheric haze", 0, 180])}${range("graphics", g, ["weather", "Weather particles", 0, 150])}${range("graphics", g, ["wind", "Wind in the foliage", 0, 250])}`,
  );
  const grading = section(
    "grading",
    "THE FINISHING TOUCH",
    "Colour & water",
    `${range("graphics", g, ["saturation", "Colour saturation", 0, 200])}${range("graphics", g, ["contrast", "Contrast", 50, 150])}${range("graphics", g, ["vignette", "Vignette", 0, 100])}${range("graphics", g, ["waterSpeed", "Water flow speed", 0, 200])}${range("graphics", g, ["foam", "Waterfall foam", 0, 150])}${toggle("graphics-toggle", "spray", "Waterfall spray", "Mist particles where water lands", s.graphics.spray)}<button class="secondary-button full-width" data-action="reset-graphics">${i("rotate-ccw")}Restore cinematic defaults</button>`,
  );
  const gameplay = section(
    "gameplay",
    "YOUR PACE",
    "Gameplay",
    `${select(
      "",
      'data-pref-select="moveSpeed"',
      "Movement speed",
      Object.entries(MOVE_SPEEDS).map(([k, v]) => [k, v.label]),
      s.prefs.moveSpeed,
    )}${toggle("pref-toggle", "run", "Run between tiles", "A quicker pace for your adventure", s.prefs.run).replace('data-pref-toggle="run"', 'id="run-setting" data-pref-toggle="run"')}${toggle("pref-toggle", "cameraFollow", "Camera follows the hero", "Glide along as the active adventurer moves", s.prefs.cameraFollow)}${toggle("pref-toggle", "tooltips", "Tile tooltips", "Describe tiles when you hover them", s.prefs.tooltips)}${toggle("pref-toggle", "legend", "Board legend", "Show the tile colour key", s.prefs.legend)}${toggle("pref-toggle", "handoff", "Pass-the-device prompts", "Pause between players on a shared screen", s.prefs.handoff)}${select(
      "party-setting",
      "",
      "Offline Classic party",
      [1, 2, 3, 4].map((n) => [
        n,
        n === 1 ? "Solo expedition" : `${n} players · local pass-and-play`,
      ]),
      s.partySize,
    )}<button class="secondary-button full-width" data-action="confirm-restart">${i("rotate-ccw")}Start a new expedition</button><p class="modal-note">Party size applies when you start a new expedition. Your current game is saved on this browser automatically.</p>`,
  );
  const camera = section(
    "camera",
    "LOOK AROUND",
    "Camera & controls",
    `${range("pref", p, ["fov", "Field of view", 28, 60, 1, "°"])}${range("pref", p, ["orbitSpeed", "Orbit speed", 30, 250])}${range("pref", p, ["zoomSpeed", "Zoom speed", 30, 250])}${toggle("pref-toggle", "invertOrbit", "Invert orbit", "Drag moves the world instead of the camera", s.prefs.invertOrbit)}${toggle("pref-toggle", "menuOrbit", "Slow orbit on the title screen", "A gentle tour of the island behind the menu", s.prefs.menuOrbit)}<div class="keyboard-guide config-keys"><span><kbd>SPACE</kbd> Roll</span><span><kbd>F</kbd> Find hero</span><span><kbd>R</kbd> Reset view</span><span><kbd>ESC</kbd> Close</span></div>`,
  );
  const audio = section(
    "audio",
    "THE SOUND OF YOUR JOURNEY",
    "Audio",
    `<label class="toggle-setting"><span><strong>Enable sound</strong><small>Original generative music and themed soundscapes</small></span><input type="checkbox" id="audio-enabled" ${s.audio.enabled ? "checked" : ""}></label>${(
      [
        ["music", "Ambient music"],
        ["ambience", "World ambience"],
        ["effects", "Game effects"],
      ] as const
    )
      .map(
        ([id, label]) =>
          `<label class="audio-range"><span>${label}</span><input aria-label="${label} volume" type="range" min="0" max="100" value="${Math.round(s.audio[id] * 100)}" data-audio-volume="${id}"/><output id="volume-${id}">${Math.round(s.audio[id] * 100)}%</output></label>`,
      )
      .join("")}`,
  );
  const access = section(
    "access",
    "COMFORT FIRST",
    "Accessibility",
    `${range("pref", p, ["uiScale", "Interface size", 85, 130, 100, "%", 5])}${toggle("pref-toggle", "reduceMotion", "Reduce motion", "Calmer camera, fewer animated flourishes", s.prefs.reduceMotion)}<button class="secondary-button full-width" data-action="reset-preferences">${i("rotate-ccw")}Restore gameplay & camera defaults</button>`,
  );
  return `<div class="config-page">${nav}<div class="config-body" id="config-body">${profile}${display}${lighting}${grading}${gameplay}${camera}${audio}${access}</div></div>`;
}
