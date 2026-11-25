import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { configPage, type ConfigState } from "../src/ui/config-page";
import { GRAPHICS_DEFAULTS } from "../src/world/graphics";
import {
  PREFERENCE_DEFAULTS,
  PROFILE_DEFAULTS,
} from "../src/settings/preferences";

const pkg = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
) as { version: string };

function state(overrides: Partial<ConfigState> = {}): ConfigState {
  return {
    graphics: structuredClone(GRAPHICS_DEFAULTS),
    prefs: structuredClone(PREFERENCE_DEFAULTS),
    profile: structuredClone(PROFILE_DEFAULTS),
    quality: "medium",
    audio: { enabled: true, music: 50, ambience: 50, effects: 50 },
    partySize: 1,
    escape: (s: string) => s,
    icon: () => "",
    ...overrides,
  };
}

describe("settings panel version line", () => {
  it("shows the package.json version as 'Version <version>'", () => {
    const html = configPage(state());
    expect(html).toContain(`Version ${pkg.version}`);
  });

  it("shows the version once", () => {
    const html = configPage(state());
    expect(html.split(`Version ${pkg.version}`).length - 1).toBe(1);
  });

  it("places the version after the last settings section (Accessibility)", () => {
    const html = configPage(state());
    const accessAt = html.indexOf('data-config-section="access"');
    const versionAt = html.indexOf(`Version ${pkg.version}`);
    expect(accessAt).toBeGreaterThan(-1);
    expect(versionAt).toBeGreaterThan(accessAt);
  });

  it("does not change the settings it renders when the version is shown", () => {
    const s = state();
    const before = JSON.stringify({ g: s.graphics, p: s.prefs, pr: s.profile });
    configPage(s);
    expect(JSON.stringify({ g: s.graphics, p: s.prefs, pr: s.profile })).toBe(
      before,
    );
  });

  it("still renders the settings body with the version line present", () => {
    const html = configPage(state());
    expect(html).toContain('class="config-page"');
    expect(html).toContain('id="config-body"');
    expect(html).toContain(`Version ${pkg.version}`);
  });
});
