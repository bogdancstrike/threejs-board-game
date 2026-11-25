import { en } from "./en";
import { ro } from "./ro";
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  SUPPORTED_LANGUAGES,
  readSavedLanguage,
  saveLanguage,
} from "./locale";
import type { Language, Messages } from "./types";

export { LANGUAGE_STORAGE_KEY, DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES };
export type { Language };

export const MESSAGES: Record<Language, Messages> = { en, ro };

let current: Language = DEFAULT_LANGUAGE;

export function getLanguage(): Language {
  return current;
}

/** Applies the saved language (or English by default) at startup. */
export function initLanguage(): Language {
  current = readSavedLanguage();
  if (typeof document !== "undefined") document.documentElement.lang = current;
  return current;
}

/** Sets and persists the language choice. */
export function setLanguage(lang: Language): void {
  current = lang;
  saveLanguage(lang);
  if (typeof document !== "undefined") document.documentElement.lang = lang;
}

/** Looks up a message in the current language, falling back to English. */
export function t(
  key: string,
  params: Record<string, string | number> = {},
): string {
  const text = MESSAGES[current][key] ?? en[key] ?? key;
  return text.replace(/\{(\w+)\}/g, (m, name: string) =>
    name in params ? String(params[name]) : m,
  );
}
