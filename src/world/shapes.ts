import { getTiles } from "../game/data";
import { GEOGRAPHY, geography } from "../game/geography";
export const MAP_SHAPES = Object.fromEntries(
  Object.entries(GEOGRAPHY).map(([id, g]) => [
    id,
    {
      name: g.shape,
      extent: Math.ceil(Math.max(g.width, g.depth) * 1.14 + 2),
      floors: g.floors,
      size: g.size,
    },
  ]),
) as Record<
  string,
  { name: string; extent: number; floors: number; size: string }
>;
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
  const g = geography(id),
    X = x / g.width,
    Z = z / g.depth,
    r = Math.hypot(X, Z),
    angle = Math.atan2(Z, X);
  const poly = (points: number[][]) =>
    polygon(
      x,
      z,
      points.map(([x, z]) => [x * g.width, z * g.depth]),
    );
  if (id === "stormreach")
    return poly([
      [-0.2, -1],
      [0.45, -0.85],
      [0.1, -0.3],
      [0.85, -0.45],
      [0.28, 0.05],
      [1, 0.2],
      [0.12, 0.44],
      [0.3, 1],
      [-0.3, 0.75],
      [-0.05, 0.15],
      [-0.8, 0.4],
      [-0.38, -0.05],
      [-1, -0.2],
      [-0.3, -0.4],
    ]);
  if (id === "autumn")
    return poly([
      [0, -1],
      [0.15, -0.55],
      [0.5, -0.85],
      [0.45, -0.35],
      [0.9, -0.55],
      [0.65, -0.05],
      [1, 0.12],
      [0.45, 0.4],
      [0.1, 0.45],
      [0.1, 1],
      [-0.1, 1],
      [-0.1, 0.45],
      [-0.45, 0.4],
      [-1, 0.12],
      [-0.65, -0.05],
      [-0.9, -0.55],
      [-0.45, -0.35],
      [-0.5, -0.85],
      [-0.15, -0.55],
    ]);
  if (id === "jade") return (1 + 0.15 * Math.cos(angle * 8) - r) * 18;
  if (id === "necropolis")
    return (
      Math.max(
        Math.min(0.43 - Math.abs(X), 1 - Math.abs(Z)),
        Math.min(1 - Math.abs(X), 0.39 - Math.abs(Z)),
      ) * 20
    );
  if (id === "skyharbor")
    return Math.max(
      ellipse(x, z, -g.width * 0.33, 1, g.width * 0.67, g.depth * 0.86),
      ellipse(x, z, g.width * 0.33, -1, g.width * 0.67, g.depth * 0.94),
    );
  if (id === "coral")
    return Math.min(
      ellipse(x, z, 0, 0, g.width, g.depth),
      -ellipse(
        x,
        z,
        g.width * 0.2,
        -g.depth * 0.1,
        g.width * 0.57,
        g.depth * 0.6,
      ),
      Math.max(Math.abs(Z - 0.55) - 0.1, -X - 0.2) * 18,
    );
  if (id === "amber") {
    let field = -100;
    for (const [cx, cz] of [
      [-0.37, 0],
      [0.28, -0.34],
      [0.28, 0.34],
    ])
      field = Math.max(
        field,
        polygon(
          x,
          z,
          Array.from({ length: 6 }, (_, i) => {
            const a = (i * Math.PI) / 3;
            return [
              (cx + Math.sin(a) * 0.67) * g.width,
              (cz + Math.cos(a) * 0.67) * g.depth,
            ];
          }),
        ),
      );
    return field;
  }
  if (id === "obsidian")
    return poly([
      [-1, -0.75],
      [1, -0.75],
      [0.8, -0.2],
      [0.42, 0.02],
      [0.45, 0.62],
      [0.8, 0.85],
      [0.8, 1],
      [-0.8, 1],
      [-0.8, 0.85],
      [-0.45, 0.62],
      [-0.42, 0.02],
      [-0.8, -0.2],
    ]);
  if (id === "crystal")
    return poly(
      Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI) / 6,
          r = i % 2 ? 0.61 : 1;
        return [Math.cos(a) * r, Math.sin(a) * r];
      }),
    );
  if (id === "jungle") {
    let field = -100;
    for (let i = 0; i < 7; i++) {
      const centerZ = -g.depth * 0.72 + i * g.depth * 0.24;
      field = Math.max(
        field,
        ellipse(
          x,
          z,
          Math.sin(i * 0.85) * g.width * 0.31,
          centerZ,
          g.width * 0.62,
          g.depth * 0.31,
        ),
      );
    }
    return field;
  }
  if (id === "rose") {
    const Y = -Z;
    return -((X * X + Y * Y - 1) ** 3 - X * X * Y ** 3) * 7;
  }
  if (id === "lunar")
    return Math.max(
      Math.min(
        ellipse(x, z, -g.width * 0.3, 0, g.width * 0.65, g.depth),
        -ellipse(x, z, -g.width * 0.05, 0, g.width * 0.54, g.depth * 0.82),
      ),
      Math.min(
        ellipse(x, z, g.width * 0.3, 0, g.width * 0.65, g.depth),
        -ellipse(x, z, g.width * 0.05, 0, g.width * 0.54, g.depth * 0.82),
      ),
    );
  if (id === "brass")
    return poly([
      [-1, -1],
      [1, -1],
      [0.7, -0.65],
      [0.28, 0],
      [0.7, 0.65],
      [1, 1],
      [-1, 1],
      [-0.7, 0.65],
      [-0.28, 0],
      [-0.7, -0.65],
    ]);
  if (id === "pearl")
    return poly([
      [0, -1],
      [0.3, -0.4],
      [0.9, -0.55],
      [1, 0.05],
      [0.45, 0.3],
      [0.2, 0.55],
      [0.15, 1],
      [-0.15, 1],
      [-0.2, 0.55],
      [-0.45, 0.3],
      [-1, 0.05],
      [-0.9, -0.55],
      [-0.3, -0.4],
    ]);
  if (id === "verdigris") {
    let field = Math.max(0.23 - r, 0.11 - Math.abs(r - 0.87));
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4,
        side = X * Math.cos(a) + Z * Math.sin(a),
        along = -X * Math.sin(a) + Z * Math.cos(a);
      field = Math.max(
        field,
        Math.min(0.11 - Math.abs(side), 0.93 - Math.abs(along)),
      );
    }
    return field * 20;
  }
  if (id === "snowspire")
    return poly([
      [0, -1],
      [1, 0.9],
      [-1, 0.9],
    ]);
  if (id === "sunken")
    return Math.min(
      ellipse(x, z, 0, 0, g.width, g.depth),
      -ellipse(x, z, 2, 0, g.width * 0.58, g.depth * 0.64),
      Math.max(-X + 0.25, Z + 0.61) * 18,
    );
  if (id === "dream") {
    const base = Math.min(1 - Math.abs(X), 1 - Math.abs(Z)) * 20,
      hole1 =
        -Math.min(0.2 - Math.abs(X + 0.27), 0.17 - Math.abs(Z + 0.25)) * 20,
      hole2 =
        -Math.min(0.2 - Math.abs(X - 0.27), 0.17 - Math.abs(Z - 0.25)) * 20;
    return Math.min(base, hole1, hole2);
  }
  if (id === "nightmarket") {
    let field = ellipse(x, z, 0, 0, g.width * 0.75, g.depth * 0.8);
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        field = Math.max(
          field,
          ellipse(
            x,
            z,
            sx * g.width * 0.53,
            sz * g.depth * 0.5,
            g.width * 0.46,
            g.depth * 0.46,
          ),
        );
    return field;
  }
  if (id === "aurora")
    return (
      (1 -
        Math.hypot(
          (x - Math.sin(z * 0.17) * 5.7) / (g.width * 0.62),
          z / g.depth,
        )) *
      18
    );

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
  [-8.7, -14.4, 2.5],
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
