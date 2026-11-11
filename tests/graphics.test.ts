import { describe, it, expect } from "vitest";
import { parseGraphics, GRAPHICS_DEFAULTS } from "../src/world/graphics";
describe("graphics preferences", () => {
  it("recovers defaults from absent and malformed storage", () => {
    for (const raw of [null, "{", "null"])
      expect(parseGraphics(raw)).toEqual(GRAPHICS_DEFAULTS);
  });
  it("clamps ranges and validates named presets without accepting arbitrary input", () => {
    expect(
      parseGraphics(
        JSON.stringify({
          exposure: 99,
          bloom: -2,
          lighting: "bad",
          weather: 9,
          shadows: false,
          ao: false,
          spray: false,
        }),
      ),
    ).toMatchObject({
      exposure: 1.8,
      bloom: 0,
      lighting: "cinematic",
      weather: 1.5,
      shadows: false,
      ao: false,
      spray: false,
    });
    expect(
      parseGraphics('{"lighting":"sunset","exposure":"bright"}'),
    ).toMatchObject({ lighting: "sunset", exposure: 1.16 });
  });
});
import {
  pixelRatioFor,
  frameDue,
  governResolution,
  dayPhase,
} from "../src/world/graphics";
import {
  parsePreferences,
  parseProfile,
  PREFERENCE_DEFAULTS,
} from "../src/settings/preferences";
describe("extended rendering configuration", () => {
  it("validates new lighting moods, shadow tiers and frame caps", () => {
    const g = parseGraphics(
      JSON.stringify({
        lighting: "aurora",
        shadowQuality: "ultra",
        fpsCap: 45,
        renderScale: 9,
        sunAngle: -4,
        dynamicResolution: true,
        showFps: "yes",
      }),
    );
    expect(g).toMatchObject({
      lighting: "aurora",
      shadowQuality: "medium",
      fpsCap: 0,
      renderScale: 1.5,
      sunAngle: 0,
      dynamicResolution: true,
      showFps: false,
    });
    expect(parseGraphics('{"fpsCap":30}').fpsCap).toBe(30);
  });
  it("derives pixel ratio, frame pacing and resolution governance", () => {
    expect(pixelRatioFor("low", 1, 2)).toBe(1);
    expect(pixelRatioFor("ultra", 0.5, 2)).toBe(1);
    expect(pixelRatioFor("medium", 0.5, 1, 0.5)).toBe(0.5);
    expect(frameDue(10, 0, 0)).toBe(true);
    expect(frameDue(20, 0, 30)).toBe(false);
    expect(frameDue(33, 0, 30)).toBe(true);
    expect(governResolution(1, 40)).toBeCloseTo(0.92);
    expect(governResolution(0.56, 80)).toBe(0.55);
    expect(governResolution(0.9, 5)).toBeCloseTo(0.93);
    expect(governResolution(0.9, 18)).toBe(0.9);
  });
  it("cycles from day to night", () => {
    expect(dayPhase(0.25).daylight).toBeCloseTo(1);
    expect(dayPhase(0.75).night).toBeCloseTo(1);
    expect(dayPhase(1.0).golden).toBeCloseTo(1);
  });
});
describe("player preferences and profile", () => {
  it("recovers defaults and clamps values", () => {
    expect(parsePreferences("{")).toEqual(PREFERENCE_DEFAULTS);
    expect(
      parsePreferences(
        JSON.stringify({
          quality: "high",
          fov: 200,
          moveSpeed: "warp",
          run: true,
        }),
      ),
    ).toMatchObject({
      quality: "high",
      fov: 60,
      moveSpeed: "normal",
      run: true,
    });
  });
  it("validates the profile and migrates the legacy player name", () => {
    expect(parseProfile(null, "  Rowan ").name).toBe("Rowan");
    const p = parseProfile(
      JSON.stringify({
        name: "x".repeat(40),
        character: "nobody",
        tint: "red",
        difficulty: "hot",
        partySize: 12,
        mode: "score",
        challenges: false,
      }),
    );
    expect(p).toMatchObject({
      difficulty: "hot",
      partySize: 8,
      mode: "score",
      challenges: false,
    });
    expect(p.name).toHaveLength(24);
    expect(p.tint).toMatch(/^#/);
  });
});
