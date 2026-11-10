import { describe, it, expect } from "vitest";
import { readAudioPreferences } from "../src/audio/audio";
describe("audio preferences", () => {
  it("starts quietly and rejects corrupted storage", () => {
    expect(readAudioPreferences(null).enabled).toBe(false);
    expect(readAudioPreferences("{")).toEqual(readAudioPreferences(null));
  });
  it("clamps volume while keeping the three channels independent", () => {
    expect(
      readAudioPreferences(
        JSON.stringify({ enabled: true, music: 0, ambience: 2, effects: -1 }),
      ),
    ).toEqual({ enabled: true, music: 0, ambience: 1, effects: 0 });
  });
});
