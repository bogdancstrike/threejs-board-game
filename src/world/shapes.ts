import { getTiles } from "../game/data";
export const MAP_SHAPES: Record<string, { name: string; extent: number }> = {
  verdant: { name: "Wildwood island", extent: 19 },
  dragonkind: { name: "Dragonwing crags", extent: 23 },
  frost: { name: "Hexagonal ice floe", extent: 22 },
  desert: { name: "Diamond of the dunes", extent: 27 },
  sakura: { name: "Five-petal blossom", extent: 23 },
  ember: { name: "Volcanic caldera", extent: 23 },
  tide: { name: "Seven floating isles", extent: 20 },
  mycelium: { name: "Three-lobed hollow", extent: 23 },
  astral: { name: "Celestial crescent", extent: 24 },
  clockwork: { name: "Clockwork cog", extent: 24 },
};
function ellipse(
  x: number,
  z: number,
  cx: number,
  cz: number,
  rx: number,
  rz: number,
) {
  return (1 - Math.hypot((x - cx) / rx, (z - cz) / rz)) * Math.min(rx, rz);
}
function polygon(x: number, z: number, points: number[][]) {
  let inside = false,
    distance = Infinity;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const a = points[j],
      b = points[i];
    if (
      a[1] > z !== b[1] > z &&
      x < ((b[0] - a[0]) * (z - a[1])) / (b[1] - a[1]) + a[0]
    )
      inside = !inside;
    const dx = b[0] - a[0],
      dz = b[1] - a[1],
      t = Math.max(
        0,
        Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz)),
      );
    distance = Math.min(
      distance,
      Math.hypot(x - a[0] - t * dx, z - a[1] - t * dz),
    );
  }
  return inside ? distance : -distance;
}
const wing = [
  [0, -21],
  [7, -17],
  [13, -19],
  [21, -8],
  [14, -4],
  [20, 8],
  [10, 14],
  [0, 16],
  [-10, 14],
  [-21, 6],
  [-14, -3],
  [-22, -10],
  [-12, -19],
  [-6, -17],
];
const hex = Array.from({ length: 6 }, (_, i) => {
  const a = (i * Math.PI) / 3;
  return [Math.sin(a) * 21, Math.cos(a) * 21];
});
const gear = Array.from({ length: 64 }, (_, i) => {
  const a = (i / 64) * Math.PI * 2,
    r = i % 4 < 2 ? 21.5 : 18.7;
  return [Math.cos(a) * r, Math.sin(a) * r * 1.04];
});
export function rawShapeField(id: string, x: number, z: number): number {
  const a = Math.atan2(z / 18, x / 16);
  switch (id) {
    case "dragonkind":
      return polygon(x, z, wing);
    case "frost":
      return polygon(x, z, hex);
    case "desert":
      return polygon(x, z, [
        [0, -25],
        [23, 0],
        [0, 23],
        [-23, 0],
      ]);
    case "sakura":
      return (
        (1 - Math.hypot(x / 19, z / 20) / (1 + 0.14 * Math.cos(a * 5))) * 17
      );
    case "ember":
      return Math.min(
        ellipse(x, z, 0, 0, 19.7, 21.2),
        -ellipse(x, z, 0, -2.25, 4.3, 3.9),
      );
    case "tide":
      return Math.max(
        ...Array.from({ length: 7 }, (_, i) =>
          ellipse(x, z, i % 2 ? 1 : -1, 10 - i * 3.5, 14.4, 1.48),
        ),
      );
    case "mycelium":
      return Math.max(
        ellipse(x, z, -7, -1, 13, 16),
        ellipse(x, z, 6, -7, 12, 13),
        ellipse(x, z, 6, 7, 13, 12),
      );
    case "astral":
      return Math.min(
        ellipse(x, z, -2, 0, 20, 21),
        -ellipse(x, z, 9, 1, 14.5, 17.5),
      );
    case "clockwork":
      return polygon(x, z, gear);
    default:
      return ellipse(
        x,
        z,
        0,
        0,
        16.2 * (1 + 0.055 * Math.sin(a * 3)),
        18.4 * (1 + 0.04 * Math.cos(a * 5)),
      );
  }
}
const landmarkGrounds = [
  [-8.4, 8.15, 1.5],
  [-11.4, 12.6, 1.5],
  [-5.8, 12.3, 1.3],
  [-8, 12.5, 1.4],
  [-2.5, 12.8, 1.5],
  [3.8, 13.2, 2.3],
  [7.8, 8.2, 1.3],
  [9, 4.75, 1.2],
  [-8.5, -5.75, 1.3],
  [4.2, -15, 3.1],
  [-9, 4.75, 1.6],
  [-11.8, -9.1, 1.7],
  [10.8, -5.6, 1.4],
];
export function shapeField(id: string, x: number, z: number) {
  let field = rawShapeField(id, x, z);
  if (field > 3.2) return field;
  for (const [cx, cz, r] of landmarkGrounds)
    field = Math.max(field, r - Math.hypot(x - cx, z - cz));
  for (const tile of getTiles(id)) {
    const d = 0.99 - Math.hypot(tile.x - x, tile.z - z);
    if (d > field) field = d;
  }
  return field;
}
export function islandCenter(id: string, z: number) {
  return id === "tide"
    ? {
        x: 0,
        z: 10 - Math.max(0, Math.min(6, Math.round((10 - z) / 3.5))) * 3.5,
      }
    : { x: id === "astral" ? -3 : 0, z: 0 };
}
