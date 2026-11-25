import { describe, it, expect } from "vitest";
import { MESSAGES } from "../src/i18n";

// Walks the Romanian UI dictionary against the English one. A missing or empty
// key is reported grouped by screen (the part of the key before the first dot),
// so a gap is easy to find and fix.

const en = MESSAGES.en;
const ro = MESSAGES.ro;

function groupByScreen(keys: string[]): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const key of keys) {
    const screen = key.includes(".") ? key.split(".")[0] : "(root)";
    (out[screen] ??= []).push(key);
  }
  return out;
}

describe("Romanian UI dictionary, walked by screen", () => {
  const enKeys = Object.keys(en);

  it("has an entry for every English UI key", () => {
    const missing = enKeys.filter((k) => !(k in ro));
    expect(groupByScreen(missing)).toEqual({});
  });

  it("has no empty Romanian UI entry", () => {
    const empty = Object.keys(ro).filter((k) => !ro[k]?.trim());
    expect(groupByScreen(empty)).toEqual({});
  });

  it("has no Romanian key without an English source", () => {
    const orphan = Object.keys(ro).filter((k) => !(k in en));
    expect(groupByScreen(orphan)).toEqual({});
  });
});
