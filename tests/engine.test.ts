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
  it("keeps every local hero unique regardless of the lead character", () => {
    for (const hero of CHARACTERS) {
      const state = newGame(4, hero.id);
      expect(state.players[0].character).toBe(hero.id);
      expect(new Set(state.players.map((p) => p.character)).size).toBe(4);
    }
  });
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
describe("the thirty-six worlds", () => {
  it("has thirty-six distinct themed worlds with complete routes", () => {
    expect(MAPS).toHaveLength(36);
    expect(new Set(MAPS.map((m) => m.id)).size).toBe(36);
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
  it("has thirty-six different silhouettes while supporting every tile corner", () => {
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
    expect(fingerprints.size).toBe(36);
  });
  it("keeps an open crater, crescent cutout, and archipelago channels", () => {
    expect(rawShapeField("ember", 0, -2.25)).toBeLessThan(0);
    expect(rawShapeField("astral", 9, 1)).toBeLessThan(0);
    expect(rawShapeField("tide", 0, 8.25)).toBeLessThan(0);
  });
});

import { GEOGRAPHY } from "../src/game/geography";
import { groundHeight } from "../src/game/data";
describe("varied floors and dimensions", () => {
  it("uses independent three-to-nine-floor profiles for all thirty-six maps", () => {
    const counts = new Set<number>(),
      sizes = new Set<string>();
    for (const m of MAPS) {
      const g = GEOGRAPHY[m.id];
      expect(g.floors).toBeGreaterThanOrEqual(3);
      expect(g.floors).toBeLessThanOrEqual(9);
      expect(groundHeight(12, m.id)).toBeCloseTo(0.8);
      expect(groundHeight(-18, m.id)).toBeCloseTo(
        0.8 + (g.floors - 1) * g.rise,
      );
      for (const tile of getTiles(m.id))
        expect(tile.y).toBeCloseTo(
          groundHeight(tile.z, m.id) + 0.04 + skyOffset(m.id, tile.id),
        );
      counts.add(g.floors);
      sizes.add(g.width + "x" + g.depth);
    }
    expect(counts.size).toBe(7);
    expect(sizes.size).toBeGreaterThan(20);
  });
});

import { SKY_ROUTES, skyOffset } from "../src/game/layers";
describe("ascending and descending sky routes", () => {
  it("climbs above the main island and returns to ground on every excursion", () => {
    for (const [id, layers] of Object.entries(SKY_ROUTES))
      for (const layer of layers) {
        const tiles = getTiles(id);
        expect(skyOffset(id, layer.start)).toBe(0);
        expect(skyOffset(id, layer.upEnd)).toBe(layer.height);
        expect(skyOffset(id, layer.end)).toBe(0);
        expect(
          tiles[layer.upEnd].y - groundHeight(tiles[layer.upEnd].z, id),
        ).toBeGreaterThan(6);
        expect(skyOffset(id, layer.downStart + 1)).toBeLessThan(layer.height);
      }
    expect(SKY_ROUTES.dream).toHaveLength(2);
  });
});
