import { describe, it, expect } from "vitest";
import {
  CONFIG_SECTIONS,
  configPage,
  type ConfigState,
} from "../src/ui/config-page";
import { GRAPHICS_DEFAULTS } from "../src/world/graphics";
import {
  PREFERENCE_DEFAULTS,
  PROFILE_DEFAULTS,
} from "../src/settings/preferences";
import pkg from "../package.json";

function state(): ConfigState {
  return {
    graphics: structuredClone(GRAPHICS_DEFAULTS),
    prefs: structuredClone(PREFERENCE_DEFAULTS),
    profile: structuredClone(PROFILE_DEFAULTS),
    quality: "medium",
    audio: { enabled: true, music: 50, ambience: 50, effects: 50 },
    partySize: 1,
    escape: (s: string) => s,
    icon: () => "",
  };
}

describe("configPage sections", () => {
  it("renders every settings section in order", () => {
    const html = configPage(state());
    let last = -1;
    for (const [id] of CONFIG_SECTIONS) {
      const at = html.indexOf(`data-config-section="${id}"`);
      expect(at).toBeGreaterThan(last);
      last = at;
    }
  });

  it("adds only the version note beyond the sections", () => {
    const html = configPage(state());
    expect(html.match(/config-version/g)?.length).toBe(1);
    expect(html).toContain(`Version ${pkg.version}`);
    expect(html.match(/<section /g)?.length).toBe(CONFIG_SECTIONS.length);
  });

  it("is deterministic for the same preferences", () => {
    expect(configPage(state())).toBe(configPage(state()));
  });
});
