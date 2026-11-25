import { describe, it, expect } from "vitest";
import packageJson from "../package.json";
import {
  configPage,
  versionLabel,
  type ConfigState,
} from "../src/ui/config-page";
import { GRAPHICS_DEFAULTS } from "../src/world/graphics";
import {
  PREFERENCE_DEFAULTS,
  PROFILE_DEFAULTS,
} from "../src/settings/preferences";

const state = (): ConfigState => ({
  graphics: { ...GRAPHICS_DEFAULTS },
  prefs: { ...PREFERENCE_DEFAULTS },
  profile: { ...PROFILE_DEFAULTS },
  quality: "medium",
  audio: { enabled: false, music: 0.5, ambience: 0.5, effects: 0.5 },
  partySize: 1,
  escape: (s: string) => s,
  icon: () => "",
});

describe("settings panel version line", () => {
  it("builds the exact label text from a version string", () => {
    expect(versionLabel("0.4.2")).toBe("Version 0.4.2");
  });

  it("labels the package.json version without a 'v' prefix", () => {
    expect(versionLabel(packageJson.version)).toBe(
      `Version ${packageJson.version}`,
    );
  });

  it("is included in the settings panel markup", () => {
    expect(configPage(state())).toContain(`Version ${packageJson.version}`);
  });
});
