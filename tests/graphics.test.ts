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
