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
import { t, getLanguage } from "../i18n";
export const CONFIG_SECTIONS = [
  ["profile", "user-round", "config.sec.profile"],
  ["display", "monitor", "config.sec.display"],
  ["lighting", "sun", "config.sec.lighting"],
  ["grading", "palette", "config.sec.grading"],
  ["gameplay", "dices", "config.sec.gameplay"],
  ["camera", "move-3d", "config.sec.camera"],
  ["audio", "volume-2", "config.sec.audio"],
  ["access", "accessibility", "config.sec.access"],
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
  /** Present while in an Adventure room: the shared card deck. */
  room?: { difficulty: string; host: boolean };
  escape: (s: string) => string;
  icon: (name: string) => string;
}
export function configPage(s: ConfigState) {
  const g = s.graphics as unknown as Record<string, unknown>,
    p = s.prefs as unknown as Record<string, unknown>,
    i = s.icon;
  const hero = CHARACTERS.find((c) => c.id === s.profile.character)!;
  const nav = `<nav class="config-nav" aria-label="${t("config.navAria")}">${CONFIG_SECTIONS.map(([id, ic, label], n) => `<button data-config-jump="${id}" class="${n === 0 ? "active" : ""}">${i(ic)}<span>${t(label)}</span></button>`).join("")}</nav>`;
  const profile = section(
    "profile",
    t("config.eye.profile"),
    t("config.sec.profile"),
    `<div class="profile-card"><div id="profile-preview" class="profile-preview" style="--hero-color:${hero.color}"></div><div class="profile-fields"><label class="settings-label">${t("config.displayName")}<input id="profile-name" class="text-input" maxlength="24" autocomplete="nickname" placeholder="${t("config.namePlaceholder")}" value="${s.escape(s.profile.name)}"/></label>${select(
      "profile-character",
      'data-profile="character"',
      t("config.favAdventurer"),
      CHARACTERS.map((c) => [
        c.id,
        `${c.name} · ${c.title.replace(/^The /, "")}`,
      ]),
      s.profile.character,
    )}<div class="settings-label">${t("config.auraColour")}<div class="color-options profile-auras">${AURAS.map(([c, n]) => `<button aria-label="${t("config.auraAria", { name: n })}" data-profile-tint="${c}" style="--swatch:${c}" class="${c === s.profile.tint ? "active" : ""}"></button>`).join("")}</div></div><label class="settings-label">${t("settings.languageLabel")}<select id="language-setting" aria-label="${t("settings.languageLabel")}">${[
      ["en", t("settings.languageEn")],
      ["ro", t("settings.languageRo")],
    ]
      .map(
        ([v, l]) =>
          `<option value="${v}" ${getLanguage() === v ? "selected" : ""}>${l}</option>`,
      )
      .join(
        "",
      )}</select><small>${t("settings.languageHint")}</small></label><p class="modal-note">${t("config.profileNote")}</p></div></div>${select(
      "profile-difficulty",
      'data-profile="difficulty"',
      t("config.defaultDifficulty"),
      DIFFICULTIES.map((d) => [
        d.id,
        `${d.name} · ${d.count} cards${d.adult ? " · adults" : ""}`,
      ]),
      s.profile.difficulty,
    )}${select(
      "profile-party",
      'data-profile="partySize"',
      t("config.defaultParty"),
      [1, 2, 3, 4, 5, 6, 7, 8].map((n) => [
        n,
        n === 1 ? t("config.solo") : t("config.players", { count: n }),
      ]),
      s.profile.partySize,
    )}${select(
      "profile-mode",
      'data-profile="mode"',
      t("config.defaultRules"),
      [
        ["classic", t("config.rulesClassic")],
        ["score", t("config.rulesScore")],
      ],
      s.profile.mode,
    )}${toggle("profile-toggle", "challenges", t("config.roadDefault"), t("config.roadDefaultHint"), s.profile.challenges)}`,
  );
  const display = section(
    "display",
    t("config.eye.display"),
    t("config.sec.display"),
    `${select(
      "quality-setting",
      "",
      t("config.qualityPreset"),
      Object.entries(QUALITY_PRESETS).map(([k, v]) => [k, v.label]),
      s.quality,
    )}${select(
      "",
      'data-graphics-select="shadowQuality"',
      t("config.shadowRes"),
      [
        ["low", t("config.shadowLow")],
        ["medium", t("config.shadowMedium")],
        ["high", t("config.shadowHigh")],
      ],
      s.graphics.shadowQuality,
    )}${select(
      "",
      'data-graphics-select="fpsCap"',
      t("config.fpsLimit"),
      FPS_CAPS.map((f) => [f, f ? `${f} FPS` : t("config.fpsUnlimited")]),
      s.graphics.fpsCap,
    )}${range("graphics", g, ["renderScale", t("config.renderScale"), 50, 150, 100, "%", 5], t("config.renderScaleHint"))}${toggle("graphics-toggle", "dynamicResolution", t("config.dynamicRes"), t("config.dynamicResHint"), s.graphics.dynamicResolution)}${toggle("graphics-toggle", "antialias", t("config.fxaa"), t("config.fxaaHint"), s.graphics.antialias)}${toggle("graphics-toggle", "shadows", t("config.softShadows"), t("config.softShadowsHint"), s.graphics.shadows)}${toggle("graphics-toggle", "ao", t("config.ao"), t("config.aoHint"), s.graphics.ao)}${toggle("graphics-toggle", "showFps", t("config.showFps"), t("config.showFpsHint"), s.graphics.showFps)}<p class="modal-note">${t("config.qualityNote")}</p>`,
  );
  const lighting = section(
    "lighting",
    t("config.eye.lighting"),
    t("config.sec.lighting"),
    `${select("lighting-setting", "", t("config.lightingMood"), LIGHTING_STYLES, s.graphics.lighting)}${range("graphics", g, ["sunAngle", t("config.sunDirection"), 0, 360, 1, "°", 5], t("config.sunDirectionHint"))}${range("graphics", g, ["cycleMinutes", t("config.dayLength"), 1, 20, 1, "min"], t("config.dayLengthHint"))}${range("graphics", g, ["exposure", t("config.exposure"), 65, 180])}${range("graphics", g, ["bloom", t("config.bloom"), 0, 150])}${range("graphics", g, ["fog", t("config.haze"), 0, 180])}${range("graphics", g, ["weather", t("config.weather"), 0, 150])}${range("graphics", g, ["wind", t("config.foliageWind"), 0, 250])}`,
  );
  const grading = section(
    "grading",
    t("config.eye.grading"),
    t("config.sec.grading"),
    `${range("graphics", g, ["saturation", t("config.saturation"), 0, 200])}${range("graphics", g, ["contrast", t("config.contrast"), 50, 150])}${range("graphics", g, ["vignette", t("config.vignette"), 0, 100])}${range("graphics", g, ["waterSpeed", t("config.waterSpeed"), 0, 200])}${range("graphics", g, ["foam", t("config.foam"), 0, 150])}${toggle("graphics-toggle", "spray", t("config.spray"), t("config.sprayHint"), s.graphics.spray)}<button class="secondary-button full-width" data-action="reset-graphics">${i("rotate-ccw")}${t("config.restoreCinematic")}</button>`,
  );
  const gameplay = section(
    "gameplay",
    t("config.eye.gameplay"),
    t("config.sec.gameplay"),
    `${
      s.room
        ? `<div class="spice-setting">${select(
            "game-difficulty",
            s.room.host ? "" : "disabled",
            t("config.spiceLevel"),
            DIFFICULTIES.map((d) => [d.id, `${d.name} · ${d.count} cards`]),
            s.room.difficulty,
          )}<p class="modal-note">${s.room.host ? t("config.cardsFor") : t("config.onlyHostDeck")}</p></div>`
        : ""
    }${select(
      "",
      'data-pref-select="moveSpeed"',
      t("config.movementSpeed"),
      Object.entries(MOVE_SPEEDS).map(([k, v]) => [k, v.label]),
      s.prefs.moveSpeed,
    )}${toggle("pref-toggle", "run", t("config.run"), t("config.runHint"), s.prefs.run).replace('data-pref-toggle="run"', 'id="run-setting" data-pref-toggle="run"')}${toggle("pref-toggle", "cameraFollow", t("config.cameraFollow"), t("config.cameraFollowHint"), s.prefs.cameraFollow)}${toggle("pref-toggle", "tooltips", t("config.tooltips"), t("config.tooltipsHint"), s.prefs.tooltips)}${toggle("pref-toggle", "legend", t("config.legend"), t("config.legendHint"), s.prefs.legend)}${toggle("pref-toggle", "handoff", t("config.handoff"), t("config.handoffHint"), s.prefs.handoff)}${select(
      "party-setting",
      "",
      t("config.offlineParty"),
      [1, 2, 3, 4].map((n) => [
        n,
        n === 1 ? t("config.soloExpedition") : t("config.localPassPlay", { count: n }),
      ]),
      s.partySize,
    )}<button class="secondary-button full-width" data-action="confirm-restart">${i("rotate-ccw")}${t("config.newExpedition")}</button><p class="modal-note">${t("config.partyNote")}</p>`,
  );
  const camera = section(
    "camera",
    t("config.eye.camera"),
    t("config.sec.camera"),
    `${range("pref", p, ["fov", t("config.fov"), 28, 60, 1, "°"])}${range("pref", p, ["orbitSpeed", t("config.orbitSpeed"), 30, 250])}${range("pref", p, ["zoomSpeed", t("config.zoomSpeed"), 30, 250])}${toggle("pref-toggle", "invertOrbit", t("config.invertOrbit"), t("config.invertOrbitHint"), s.prefs.invertOrbit)}${toggle("pref-toggle", "menuOrbit", t("config.menuOrbit"), t("config.menuOrbitHint"), s.prefs.menuOrbit)}<div class="keyboard-guide config-keys"><span><kbd>SPACE</kbd> ${t("config.keyRoll")}</span><span><kbd>F</kbd> ${t("config.keyFind")}</span><span><kbd>R</kbd> ${t("config.keyReset")}</span><span><kbd>ESC</kbd> ${t("config.keyClose")}</span></div>`,
  );
  const audio = section(
    "audio",
    t("config.eye.audio"),
    t("config.sec.audio"),
    `<label class="toggle-setting"><span><strong>${t("config.enableSound")}</strong><small>${t("config.enableSoundHint")}</small></span><input type="checkbox" id="audio-enabled" ${s.audio.enabled ? "checked" : ""}></label>${(
      [
        ["music", t("config.ambientMusic")],
        ["ambience", t("config.worldAmbience")],
        ["effects", t("config.gameEffects")],
      ] as const
    )
      .map(
        ([id, label]) =>
          `<label class="audio-range"><span>${label}</span><input aria-label="${t("config.volumeAria", { name: label })}" type="range" min="0" max="100" value="${Math.round(s.audio[id] * 100)}" data-audio-volume="${id}"/><output id="volume-${id}">${Math.round(s.audio[id] * 100)}%</output></label>`,
      )
      .join("")}`,
  );
  const access = section(
    "access",
    t("config.eye.access"),
    t("config.sec.access"),
    `${range("pref", p, ["uiScale", t("config.interfaceSize"), 85, 130, 100, "%", 5])}${toggle("pref-toggle", "reduceMotion", t("config.reduceMotion"), t("config.reduceMotionHint"), s.prefs.reduceMotion)}<button class="secondary-button full-width" data-action="reset-preferences">${i("rotate-ccw")}${t("config.restoreGameplay")}</button>`,
  );
  return `<div class="config-page">${nav}<div class="config-body" id="config-body">${profile}${display}${lighting}${grading}${gameplay}${camera}${audio}${access}</div></div>`;
}
