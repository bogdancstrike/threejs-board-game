import { describe, it, expect } from "vitest";
import { TILES, seededRandom, CHARACTERS } from "../src/game/data";
import { newGame, roll, choose, parseSave } from "../src/game/engine";
describe("board and roster", () => {
  it("has the required ordered, supported 93-tile path and 12 adults", () => {
    expect(TILES).toHaveLength(93);
    TILES.forEach((t, i) => {
      expect(t.id).toBe(i);
      expect(t.y).toBeGreaterThan(0);
      if (i)
        expect(
          Math.hypot(t.x - TILES[i - 1].x, t.z - TILES[i - 1].z),
        ).toBeLessThan(2.5);
    });
    expect(TILES[0].kind).toBe("start");
    expect(TILES[92].kind).toBe("finish");
    expect(new Set(CHARACTERS.map((c) => c.id)).size).toBe(12);
    expect(CHARACTERS.every((c) => c.age >= 21)).toBe(true);
  });
  it("generates repeatable randomness", () => {
    const a = seededRandom(),
      b = seededRandom();
    expect(Array.from({ length: 20 }, a)).toEqual(
      Array.from({ length: 20 }, b),
    );
  });
});
describe("game rules", () => {
  it("moves tile by tile, then changes turns", () => {
    const s = newGame(2);
    expect(roll(s, 3, 0)).toEqual([1, 2, 3]);
    expect(s.players[0].position).toBe(3);
    expect(s.active).toBe(1);
    expect(s.turn).toBe(2);
  });
  it("suspends turns for a mystery and resolves the chosen route", () => {
    const s = newGame(2);
    roll(s, 4, 0);
    expect(s.phase).toBe("event");
    expect(s.active).toBe(0);
    expect(() => roll(s, 2, 0)).toThrow();
    expect(choose(s, 0)).toEqual([5, 6]);
    expect(s.active).toBe(1);
    expect(s.phase).toBe("ready");
  });
  it("does not allow a purchase without gold", () => {
    const s = newGame();
    roll(s, 4, 2);
    expect(() => choose(s, 0)).toThrow("Not enough gold");
    expect(s.phase).toBe("event");
    choose(s, 1);
    expect(s.players[0].clues).toBe(1);
  });
  it("awards treasure and fortune and transports through portals", () => {
    const s = newGame();
    s.players[0].position = 6;
    roll(s, 1, 0);
    expect(s.players[0].gold).toBe(3);
    s.players[0].position = 8;
    roll(s, 1, 0);
    expect(s.players[0].gold).toBe(5);
    expect(s.players[0].clues).toBe(1);
    s.players[0].position = 16;
    expect(roll(s, 1, 0)).toEqual([17, 18, 19, 20]);
    expect(s.players[0].position).toBe(20);
  });
  it("clamps movement to the finish and declares the correct winner", () => {
    const s = newGame(2);
    s.active = 1;
    s.players[1].position = 90;
    expect(roll(s, 6, 0)).toEqual([91, 92]);
    expect(s.winner).toBe(1);
    expect(s.phase).toBe("won");
  });
  it("restores encounters and rejects malformed saves", () => {
    const s = newGame();
    roll(s, 4, 0);
    expect(parseSave(JSON.stringify(s))).toEqual(s);
    expect(parseSave("{")).toBeNull();
    s.players[0].position = 100;
    expect(parseSave(JSON.stringify(s))).toBeNull();
    expect(() => roll(newGame(), 7, 0)).toThrow();
  });
  it("can finish a complete 4 player expedition", () => {
    const s = newGame(4);
    for (let i = 0; i < 1000 && s.phase !== "won"; i++) {
      if (s.phase === "event") choose(s, 1);
      else roll(s, 3, i % 6);
    }
    expect(s.phase).toBe("won");
    expect(s.players[s.winner!].position).toBe(92);
  });
});

import { MAPS } from "../src/game/maps";
import { getTiles } from "../src/game/data";
import { currentMystery } from "../src/game/engine";
describe("the ten worlds", () => {
  it("has ten distinct themed worlds with complete routes", () => {
    expect(MAPS).toHaveLength(10);
    expect(new Set(MAPS.map((m) => m.theme)).size).toBe(10);
    for (const m of MAPS) {
      const tiles = getTiles(m.id);
      expect(tiles).toHaveLength(93);
      expect(tiles).toEqual(getTiles(m.id));
      expect(tiles[0].kind).toBe("start");
      expect(tiles[92].kind).toBe("finish");
      tiles.forEach((t, i) => {
        expect(t.id).toBe(i);
        expect(Number.isFinite(t.y)).toBe(true);
        if (i)
          expect(
            Math.hypot(t.x - tiles[i - 1].x, t.z - tiles[i - 1].z),
          ).toBeLessThan(2.6);
      });
      expect(parseSave(JSON.stringify(newGame(1, "lyra", m.id)))?.map).toBe(
        m.id,
      );
    }
  });
  it("uses dragon rider encounters on Dragonkind", () => {
    const s = newGame(1, "lyra", "dragonkind");
    roll(s, 4, 1);
    expect(currentMystery(s)?.title).toBe("The choosing");
    choose(s, 0);
    expect(s.players[0].position).toBe(6);
    expect(s.players[0].clues).toBe(1);
  });
});

import { shapeField, rawShapeField, MAP_SHAPES } from "../src/world/shapes";
describe("distinct physical landscapes", () => {
  it("has ten different silhouettes while supporting every tile corner", () => {
    const fingerprints = new Set();
    for (const map of MAPS) {
      expect(MAP_SHAPES[map.id]).toBeDefined();
      let signature = "";
      for (let z = -23; z <= 23; z += 2)
        for (let x = -23; x <= 23; x += 2)
          signature += rawShapeField(map.id, x, z) >= 0 ? "1" : "0";
      fingerprints.add(signature);
      for (const tile of getTiles(map.id))
        for (const dx of [-0.64, 0, 0.64])
          for (const dz of [-0.64, 0, 0.64])
            expect(
              shapeField(map.id, tile.x + dx, tile.z + dz),
              `${map.id} supports tile ${tile.id}`,
            ).toBeGreaterThan(0);
    }
    expect(fingerprints.size).toBe(10);
  });
  it("keeps an open crater, crescent cutout, and archipelago channels", () => {
    expect(rawShapeField("ember", 0, -2.25)).toBeLessThan(0);
    expect(rawShapeField("astral", 9, 1)).toBeLessThan(0);
    expect(rawShapeField("tide", 0, 8.25)).toBeLessThan(0);
  });
});
