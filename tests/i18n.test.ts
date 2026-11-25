import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Acceptance tests for openspec/changes/i18n (English and Romanian localization).
//
// Written from the spec scenarios only, without the implementation. They use
// Vitest with a stubbed localStorage (no browser). They assume the module
// contract below, which the implementation must provide at src/i18n/index.ts:
//
//   export const LANGUAGE_STORAGE_KEY = "wilder-language-v1";
//   export const DEFAULT_LANGUAGE = "en";
//   export const SUPPORTED_LANGUAGES = ["en", "ro"];
//   export const MESSAGES: { en: Record<string, string>; ro: Record<string, string> };
//   export function getLanguage(): "en" | "ro";
//   export function setLanguage(lang: "en" | "ro"): void;   // persists the choice
//   export function initLanguage(): "en" | "ro";            // reads saved choice at startup
//   export function t(key: string, params?: Record<string, string | number>): string;

type Lang = "en" | "ro";
type I18n = typeof import("../src/i18n/index");

const KEY = "wilder-language-v1";
// Proper names of worlds and characters that must stay identical in RO.
const PROPER_NAMES = ["The Verdant Crown", "Elowen"];

function stubStorage(initial: Record<string, string> = {}) {
  const store = new Map<string, string>(Object.entries(initial));
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => void store.set(k, String(v)),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
  });
  return store;
}

async function load(initial: Record<string, string> = {}) {
  const store = stubStorage(initial);
  vi.resetModules();
  const mod: I18n = await import("../src/i18n/index");
  return { mod, store };
}

// Letters-only comparison ignores numbers and punctuation-only strings.
const hasLetters = (s: string) => /\p{L}/u.test(s);

beforeEach(() => {
  vi.resetModules();
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe("default-en: no saved language choice", () => {
  it("starts in English when nothing is saved", async () => {
    const { mod } = await load();
    expect(mod.DEFAULT_LANGUAGE).toBe("en");
    expect(mod.initLanguage()).toBe("en");
    expect(mod.getLanguage()).toBe("en");
  });

  it("starts in English when the saved value is not a supported language", async () => {
    const { mod } = await load({ [KEY]: "fr" });
    expect(mod.initLanguage()).toBe("en");
    expect(mod.t("menu.newGame")).toBe(mod.MESSAGES.en["menu.newGame"]);
  });

  it("shows English strings for player-visible text", async () => {
    const { mod } = await load();
    mod.initLanguage();
    for (const [key, value] of Object.entries(mod.MESSAGES.en)) {
      expect(mod.t(key)).toBe(value);
    }
  });
});

describe("select-ro: switching from English to Romanian", () => {
  it("translates every English message key into Romanian", async () => {
    const { mod } = await load();
    expect(Object.keys(mod.MESSAGES.ro).sort()).toEqual(
      Object.keys(mod.MESSAGES.en).sort(),
    );
    for (const key of Object.keys(mod.MESSAGES.en)) {
      expect(mod.MESSAGES.ro[key], key).toBeTruthy();
    }
  });

  it("changes every letter-bearing English message to different Romanian text", async () => {
    const { mod } = await load();
    for (const [key, en] of Object.entries(mod.MESSAGES.en)) {
      if (!hasLetters(en)) continue;
      if (PROPER_NAMES.some((name) => en === name)) continue;
      expect(mod.MESSAGES.ro[key], key).not.toBe(en);
    }
  });

  it("displays Romanian text after setLanguage('ro')", async () => {
    const { mod } = await load();
    mod.initLanguage();
    mod.setLanguage("ro");
    expect(mod.getLanguage()).toBe("ro");
    for (const [key, value] of Object.entries(mod.MESSAGES.ro)) {
      expect(mod.t(key)).toBe(value);
    }
  });

  it("keeps proper names of worlds and characters unchanged in Romanian", async () => {
    const { mod } = await load();
    const allEn = Object.values(mod.MESSAGES.en).join("\n");
    const allRo = Object.values(mod.MESSAGES.ro).join("\n");
    for (const name of PROPER_NAMES) {
      expect(allEn).toContain(name);
      expect(allRo).toContain(name);
    }
    mod.setLanguage("ro");
    for (const name of PROPER_NAMES) {
      const found = Object.keys(mod.MESSAGES.en).filter((k) =>
        mod.MESSAGES.en[k].includes(name),
      );
      for (const key of found) {
        expect(mod.t(key), key).toContain(name);
      }
    }
  });

  it("preserves interpolation placeholders so game state values still appear", async () => {
    const { mod } = await load();
    const placeholders = (s: string) =>
      [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
    for (const key of Object.keys(mod.MESSAGES.en)) {
      expect(placeholders(mod.MESSAGES.ro[key]), key).toEqual(
        placeholders(mod.MESSAGES.en[key]),
      );
    }
  });

  it("interpolates the same numeric game values in Romanian", async () => {
    const { mod } = await load();
    mod.setLanguage("ro");
    for (const key of Object.keys(mod.MESSAGES.en)) {
      if (!/\{\w+\}/.test(mod.MESSAGES.en[key])) continue;
      const params = Object.fromEntries(
        [...mod.MESSAGES.en[key].matchAll(/\{(\w+)\}/g)].map((m) => [m[1], 7]),
      );
      expect(mod.t(key, params), key).toMatch(/7/);
    }
  });
});

describe("select-en: switching from Romanian back to English", () => {
  it("displays English text again and keeps proper names", async () => {
    const { mod } = await load();
    mod.initLanguage();
    mod.setLanguage("ro");
    mod.setLanguage("en");
    expect(mod.getLanguage()).toBe("en");
    for (const [key, value] of Object.entries(mod.MESSAGES.en)) {
      expect(mod.t(key)).toBe(value);
    }
    for (const name of PROPER_NAMES) {
      const key = Object.keys(mod.MESSAGES.en).find((k) =>
        mod.MESSAGES.en[k].includes(name),
      );
      if (key) expect(mod.t(key)).toContain(name);
    }
  });
});

describe("restore-language: saved choice on a later visit", () => {
  it("persists the selected language under the storage key", async () => {
    const { mod, store } = await load();
    mod.setLanguage("ro");
    expect(store.get(KEY)).toBe("ro");
  });

  it("restores Romanian and reports RO as selected after a reload", async () => {
    const { mod } = await load({ [KEY]: "ro" });
    expect(mod.initLanguage()).toBe("ro");
    expect(mod.getLanguage()).toBe("ro");
    expect(mod.t("menu.newGame")).toBe(mod.MESSAGES.ro["menu.newGame"]);
  });

  it("a saved RO choice takes precedence over the English default", async () => {
    const { mod } = await load({ [KEY]: "ro" });
    expect(mod.DEFAULT_LANGUAGE).toBe("en");
    expect(mod.initLanguage()).not.toBe(mod.DEFAULT_LANGUAGE);
  });
});
