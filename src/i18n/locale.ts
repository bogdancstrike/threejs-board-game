import type { Language } from "./types";

export const LANGUAGE_STORAGE_KEY = "wilder-language-v1";
export const DEFAULT_LANGUAGE: Language = "en";
export const SUPPORTED_LANGUAGES: readonly Language[] = ["en", "ro"];

export const isLanguage = (v: unknown): v is Language =>
  typeof v === "string" && (SUPPORTED_LANGUAGES as readonly string[]).includes(v);

/** Reads the saved language; falls back to English when none or unsupported. */
export function readSavedLanguage(): Language {
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return isLanguage(saved) ? saved : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

export function saveLanguage(lang: Language): void {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch {}
}
