import { DIFFICULTIES, type Difficulty } from "../game/decks";
import { CHARACTERS } from "../game/data";
import { isQuality, type Quality } from "../world/graphics";
export const MOVE_SPEEDS = {
  relaxed: { label: "Relaxed · savour each step", walk: 420, run: 240 },
  normal: { label: "Normal", walk: 300, run: 170 },
  brisk: { label: "Brisk · quicker turns", walk: 190, run: 110 },
  instant: { label: "Swift · minimal animation", walk: 70, run: 45 },
} as const;
export type MoveSpeed = keyof typeof MOVE_SPEEDS;
export const AURAS = [
  ["#cbb17a", "Gold"],
  ["#a88bcf", "Violet"],
  ["#8fc5b3", "Sage"],
  ["#8dbed2", "Ice"],
  ["#da998d", "Rose"],
  ["#e3c15a", "Sunlit"],
  ["#7fa3e6", "Sapphire"],
  ["#c97ba8", "Orchid"],
] as const;
export interface Preferences {
  quality: Quality;
  run: boolean;
  moveSpeed: MoveSpeed;
  /** Camera glides to the active hero when their turn starts or they move. */
  cameraFollow: boolean;
  fov: number;
  orbitSpeed: number;
  zoomSpeed: number;
  invertOrbit: boolean;
  menuOrbit: boolean;
  tooltips: boolean;
  legend: boolean;
  uiScale: number;
  reduceMotion: boolean;
  /** Ask before the active player rolls in pass-and-play. */
  handoff: boolean;
}
export interface Profile {
  name: string;
  character: string;
  tint: string;
  difficulty: Difficulty;
  partySize: number;
  mode: "classic" | "score";
  challenges: boolean;
}
export const PREFERENCE_DEFAULTS: Preferences = {
  quality: "medium",
  run: false,
  moveSpeed: "normal",
  cameraFollow: true,
  fov: 36,
  orbitSpeed: 1,
  zoomSpeed: 1,
  invertOrbit: false,
  menuOrbit: true,
  tooltips: true,
  legend: true,
  uiScale: 1,
  reduceMotion: false,
  handoff: true,
};
export const PROFILE_DEFAULTS: Profile = {
  name: "",
  character: CHARACTERS[0].id,
  tint: AURAS[0][0],
  difficulty: "soft",
  partySize: 1,
  mode: "classic",
  challenges: true,
};
const clamp = (v: unknown, min: number, max: number, fallback: number) =>
  typeof v === "number" && Number.isFinite(v)
    ? Math.max(min, Math.min(max, v))
    : fallback;
const bool = (v: unknown, fallback: boolean) =>
  typeof v === "boolean" ? v : fallback;
export function parsePreferences(raw: string | null): Preferences {
  let input: Record<string, unknown> = {};
  try {
    input = JSON.parse(raw || "{}") || {};
  } catch {}
  const d = PREFERENCE_DEFAULTS;
  return {
    quality: isQuality(input.quality) ? input.quality : d.quality,
    run: input.run === true,
    moveSpeed:
      typeof input.moveSpeed === "string" && input.moveSpeed in MOVE_SPEEDS
        ? (input.moveSpeed as MoveSpeed)
        : d.moveSpeed,
    cameraFollow: bool(input.cameraFollow, d.cameraFollow),
    fov: clamp(input.fov, 28, 60, d.fov),
    orbitSpeed: clamp(input.orbitSpeed, 0.3, 2.5, d.orbitSpeed),
    zoomSpeed: clamp(input.zoomSpeed, 0.3, 2.5, d.zoomSpeed),
    invertOrbit: bool(input.invertOrbit, d.invertOrbit),
    menuOrbit: bool(input.menuOrbit, d.menuOrbit),
    tooltips: bool(input.tooltips, d.tooltips),
    legend: bool(input.legend, d.legend),
    uiScale: clamp(input.uiScale, 0.85, 1.3, d.uiScale),
    reduceMotion: bool(input.reduceMotion, d.reduceMotion),
    handoff: bool(input.handoff, d.handoff),
  };
}
export function parseProfile(raw: string | null, legacyName = ""): Profile {
  let input: Record<string, unknown> = {};
  try {
    input = JSON.parse(raw || "{}") || {};
  } catch {}
  const d = PROFILE_DEFAULTS;
  const name =
    typeof input.name === "string" ? input.name.trim().slice(0, 24) : "";
  return {
    name: name || legacyName.trim().slice(0, 24),
    character: CHARACTERS.some((c) => c.id === input.character)
      ? (input.character as string)
      : d.character,
    tint:
      typeof input.tint === "string" && /^#[0-9a-f]{6}$/i.test(input.tint)
        ? input.tint
        : d.tint,
    difficulty: DIFFICULTIES.some((l) => l.id === input.difficulty)
      ? (input.difficulty as Difficulty)
      : d.difficulty,
    partySize: Math.round(clamp(input.partySize, 1, 8, d.partySize)),
    mode: input.mode === "score" ? "score" : "classic",
    challenges: bool(input.challenges, d.challenges),
  };
}
const read = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const write = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};
export const readPreferences = () =>
  parsePreferences(read("wilder-display-v1"));
export const savePreferences = (p: Preferences) =>
  write("wilder-display-v1", p);
export const readProfile = () =>
  parseProfile(read("wilder-profile-v1"), read("wilder-player-name") || "");
export function saveProfile(p: Profile) {
  write("wilder-profile-v1", p);
  try {
    if (p.name) localStorage.setItem("wilder-player-name", p.name);
  } catch {}
}
