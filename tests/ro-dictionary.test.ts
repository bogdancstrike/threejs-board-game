import { describe, it, expect } from "vitest";
import { contentRo } from "../src/i18n/content-ro";
import { MAPS } from "../src/game/maps";
import { EXTRA_MAPS } from "../src/game/extra-maps";
import { CHARACTERS, MYSTERIES, TILE_INFO, REGIONS } from "../src/game/data";
import { ROAD_STOPS } from "../src/game/road";
import { SKY_ROUTES } from "../src/game/layers";
import { DIFFICULTIES } from "../src/game/decks";
import { MOVE_SPEEDS } from "../src/settings/preferences";
import { LIGHTING_STYLES, QUALITY_PRESETS } from "../src/world/graphics";

// Walks every English source string that the game shows in play and checks
// that the Romanian dictionary has an entry for it. Proper names of worlds,
// characters and regions are exempt: they stay identical in every language.

const PROPER_NAMES = new Set<string>([
  ...CHARACTERS.map((c) => c.name),
  ...MAPS.map((m) => m.name),
  ...EXTRA_MAPS.map((m) => m.name),
  ...Object.values(SKY_ROUTES)
    .flat()
    .map((s) => s.name),
  ...MAPS.flatMap((m) => m.regions),
  ...EXTRA_MAPS.flatMap((m) => m.regions),
  // Region names from the data (e.g. "The Arcane Highlands").
  ...REGIONS.map((r) => r.name),
]);

function collectStrings(): string[] {
  const out = new Set<string>();
  const add = (s: unknown) => {
    if (typeof s !== "string") return;
    if (!/\p{L}/u.test(s)) return; // numbers, punctuation, icons
    if (/^[a-z-]+$/.test(s)) return; // ids and keys
    if (s.startsWith("#")) return; // colours
    if (PROPER_NAMES.has(s)) return;
    out.add(s);
  };
  const walk = (o: unknown) => {
    if (typeof o === "string") add(o);
    else if (Array.isArray(o)) o.forEach(walk);
    else if (o && typeof o === "object") Object.values(o).forEach(walk);
  };
  for (const m of [...MAPS, ...EXTRA_MAPS]) {
    walk(m.tagline);
    walk(m.description);
    walk(m.encounters);
  }
  walk(MYSTERIES);
  walk(ROAD_STOPS);
  walk(TILE_INFO);
  walk(REGIONS.map((r) => ({ short: r.short, subtitle: r.subtitle })));
  walk(CHARACTERS.map((c) => ({ title: c.title, bio: c.bio })));
  walk(DIFFICULTIES.map((d) => d.description));
  walk(MOVE_SPEEDS);
  walk(LIGHTING_STYLES);
  walk(Object.values(QUALITY_PRESETS).map((q) => q.label));
  return [...out];
}

describe("Romanian content dictionary", () => {
  const source = collectStrings();

  it("finds the English game content to check", () => {
    expect(source.length).toBeGreaterThan(400);
  });

  it("has a Romanian entry for every English source string", () => {
    const missing = source.filter((s) => !(s in contentRo));
    expect(missing).toEqual([]);
  });

  it("does not leave an empty Romanian entry", () => {
    const empty = Object.entries(contentRo).filter(([, v]) => !v.trim());
    expect(empty).toEqual([]);
  });

  it("keeps proper names of worlds and characters unchanged", () => {
    for (const name of PROPER_NAMES) {
      if (name in contentRo) expect(contentRo[name]).toBe(name);
    }
  });
});
