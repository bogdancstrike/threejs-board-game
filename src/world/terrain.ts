import * as THREE from "three";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";
import { groundHeight, getTiles } from "../game/data";
import type { MapTheme } from "../game/maps";
import { MAP_SHAPES, shapeField, islandCenter } from "./shapes";
interface Point {
  x: number;
  z: number;
  field: number;
}
/** Clip a regular mesh against a signed landscape field, preserving the protected tile footprints. */
export function sculptTerrain(theme: MapTheme) {
  const group = new THREE.Group(),
    extent = MAP_SHAPES[theme.id].extent,
    step = 0.65,
    n = Math.ceil((extent * 2) / step),
    vertices: Point[][] = [],
    tiles = getTiles(theme.id);
  for (let row = 0; row <= n; row++) {
    vertices[row] = [];
    for (let col = 0; col <= n; col++) {
      const x = -extent + col * step,
        z = -extent + row * step;
      vertices[row][col] = { x, z, field: shapeField(theme.id, x, z) };
    }
  }
  const top: number[] = [],
    colors: number[] = [],
    uv: number[] = [],
    rock: number[] = [],
    rockColors: number[] = [];
  const palettes = theme.terrain.map((c) => new THREE.Color(c)),
    rockBase = new THREE.Color(theme.rock);
  const height = (p: Point) => {
    const near = Math.min(
      ...tiles.map((t) => Math.hypot(t.x - p.x, t.z - p.z)),
    );
    return (
      groundHeight(p.z) +
      Math.max(0, Math.min(1, (near - 1) / 2)) *
        (0.16 + 0.18 * Math.sin(p.x * 0.45 + p.z * 0.26))
    );
  };
  function addVertex(p: Point) {
    const y = height(p);
    top.push(p.x, y, p.z);
    uv.push(p.x * 0.25, p.z * 0.25);
    const region = Math.max(0, Math.min(2.999, (11 - p.z) / 7)),
      c = palettes[Math.floor(region)]
        .clone()
        .lerp(palettes[Math.min(3, Math.floor(region) + 1)], region % 1);
    const h = Math.sin(p.x * 12.9898 + p.z * 78.233) * 43758.5453;
    const grain = 0.94 + (h - Math.floor(h)) * 0.09;
    c.multiplyScalar(grain);
    colors.push(c.r, c.g, c.b);
  }
  function addCliff(a: Point, b: Point) {
    const ca = islandCenter(theme.id, a.z),
      cb = islandCenter(theme.id, b.z);
    const levels = [0, -0.65, -1.6, -3.2, -5.8],
      scales = [1, 1.01, 0.94, 0.74, 0.3];
    for (let layer = 0; layer < levels.length - 1; layer++) {
      const position = (
        p: Point,
        center: { x: number; z: number },
        i: number,
      ) => {
        const y =
          i === 0
            ? height(p)
            : levels[i] + Math.sin(p.x * 1.7 + p.z * 0.7) * 0.16;
        return [
          center.x + (p.x - center.x) * scales[i],
          y,
          center.z + (p.z - center.z) * scales[i],
        ];
      };
      const aa = position(a, ca, layer),
        bb = position(b, cb, layer),
        cc = position(a, ca, layer + 1),
        dd = position(b, cb, layer + 1);
      for (const v of [aa, cc, bb, bb, cc, dd]) {
        rock.push(...v);
        const c = rockBase
          .clone()
          .multiplyScalar(
            0.75 +
              layer * 0.035 +
              0.12 * Math.sin(a.x * 1.6 + a.z * 0.9 + layer),
          );
        rockColors.push(c.r, c.g, c.b);
      }
    }
  }
  function triangle(input: Point[]) {
    const output: Point[] = [],
      boundary: Point[] = [];
    for (let i = 0; i < 3; i++) {
      const a = input[i],
        b = input[(i + 1) % 3];
      if (a.field >= 0) output.push(a);
      if (a.field >= 0 !== b.field >= 0) {
        const t = a.field / (a.field - b.field),
          p = { x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t, field: 0 };
        output.push(p);
        boundary.push(p);
      }
    }
    for (let i = 1; i < output.length - 1; i++) {
      addVertex(output[0]);
      addVertex(output[i + 1]);
      addVertex(output[i]);
    }
    if (boundary.length === 2) addCliff(boundary[0], boundary[1]);
  }
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++) {
      const a = vertices[r][c],
        b = vertices[r][c + 1],
        d = vertices[r + 1][c],
        e = vertices[r + 1][c + 1];
      triangle([a, b, d]);
      triangle([b, e, d]);
    }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(top, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  const smooth = mergeVertices(geometry, 1e-4);
  geometry.dispose();
  smooth.computeVertexNormals();
  const ground = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 1,
    side: THREE.DoubleSide,
  });
  const land = new THREE.Mesh(smooth, ground);
  land.receiveShadow = true;
  group.add(land);
  const cliffGeo = new THREE.BufferGeometry();
  cliffGeo.setAttribute("position", new THREE.Float32BufferAttribute(rock, 3));
  cliffGeo.setAttribute(
    "color",
    new THREE.Float32BufferAttribute(rockColors, 3),
  );
  cliffGeo.computeVertexNormals();
  const cliffs = new THREE.Mesh(
    cliffGeo,
    new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 1,
      flatShading: true,
      side: THREE.DoubleSide,
    }),
  );
  cliffs.castShadow = true;
  cliffs.receiveShadow = true;
  group.add(cliffs);
  return group;
}
