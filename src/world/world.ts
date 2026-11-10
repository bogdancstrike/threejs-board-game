import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { groundHeight, seededRandom, getTiles, TILE_INFO } from "../game/data";
import type { MapTheme } from "../game/maps";
import { waterMaterial } from "./water";
import { ENVIRONMENT_RESERVES } from "./environment";
import { sculptTerrain } from "./terrain";
import { shapeField, rawShapeField } from "./shapes";
import { destination } from "./landmarks";
import {
  box,
  crystal,
  cyl,
  cone,
  sphere,
  pine,
  blossom,
  house,
  material,
  loadModel,
  sharedGeometries,
  isSharedMaterial,
  addWind,
} from "./assets";
export interface World {
  group: THREE.Group;
  tiles: THREE.InstancedMesh;
  animated: ((t: number) => void)[];
  dispose: () => void;
}
function roundedTile() {
  const s = new THREE.Shape();
  s.moveTo(-0.52, -0.64);
  s.lineTo(0.4, -0.68);
  s.lineTo(0.66, -0.39);
  s.lineTo(0.64, 0.38);
  s.lineTo(0.43, 0.62);
  s.lineTo(-0.39, 0.66);
  s.lineTo(-0.67, 0.4);
  s.lineTo(-0.64, -0.38);
  s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, {
    depth: 0.075,
    bevelEnabled: true,
    bevelSegments: 1,
    steps: 1,
    bevelSize: 0.025,
    bevelThickness: 0.015,
  });
  geo.rotateX(-Math.PI / 2);
  return geo;
}
function tileSymbols(TILES: ReturnType<typeof getTiles>) {
  const canvas = document.createElement("canvas");
  canvas.width = 1280;
  canvas.height = 1280;
  const ctx = canvas.getContext("2d")!;
  const geos: THREE.BufferGeometry[] = [];
  for (const t of TILES) {
    const col = t.id % 10,
      row = Math.floor(t.id / 10),
      px = col * 128,
      py = row * 128;
    ctx.fillStyle = t.kind === "path" ? "#e7e7cb" : "#f4e8c7";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = t.kind === "path" ? "500 29px Georgia" : "500 58px Georgia";
    ctx.fillText(
      t.kind === "path"
        ? String(t.id + 1).padStart(2, "0")
        : TILE_INFO[t.kind].icon,
      px + 64,
      py + 61,
    );
    if (t.kind !== "path") {
      ctx.font = "500 19px sans-serif";
      ctx.globalAlpha = 0.65;
      ctx.fillText(String(t.id + 1).padStart(2, "0"), px + 64, py + 104);
      ctx.globalAlpha = 1;
    }
    const geo = new THREE.PlaneGeometry(1.22, 1.22);
    const uv = geo.getAttribute("uv");
    for (let i = 0; i < uv.count; i++)
      uv.setXY(i, (col + uv.getX(i)) / 10, 1 - (row + 1 - uv.getY(i)) / 10);
    geo.rotateX(-Math.PI / 2);
    geo.translate(t.x, t.y + 0.1, t.z);
    geos.push(geo);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  const merged = mergeGeometries(geos);
  geos.forEach((g) => g.dispose());
  return new THREE.Mesh(
    merged,
    new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
    }),
  );
}
function batch(group: THREE.Group) {
  group.updateMatrixWorld(true);
  const map = new Map<THREE.Material, THREE.BufferGeometry[]>();
  group.traverse((o) => {
    if (o instanceof THREE.Mesh && !Array.isArray(o.material)) {
      let geometry = o.geometry.clone().applyMatrix4(o.matrixWorld);
      geometry.deleteAttribute("uv");
      geometry.deleteAttribute("uv1");
      if (geometry.index) {
        const indexed = geometry;
        geometry = indexed.toNonIndexed();
        indexed.dispose();
      }
      const list = map.get(o.material) || [];
      list.push(geometry);
      map.set(o.material, list);
    }
  });
  const out = new THREE.Group();
  for (const [mat, geos] of map) {
    const merged = mergeGeometries(geos);
    if (merged) {
      const m = new THREE.Mesh(merged, mat);
      m.castShadow = true;
      m.receiveShadow = true;
      out.add(m);
    }
    geos.forEach((g) => g.dispose());
  }
  return out;
}
export function buildWorld(theme: MapTheme): World {
  const TILES = getTiles(theme.id);
  const group = new THREE.Group(),
    props = new THREE.Group(),
    animated: ((t: number) => void)[] = [],
    rng = seededRandom(4759 + theme.id.length);
  group.add(sculptTerrain(theme));
  const tiles = new THREE.InstancedMesh(
    roundedTile(),
    new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0.04 }),
    93,
  );
  const matrix = new THREE.Matrix4(),
    color = new THREE.Color();
  for (const tile of TILES) {
    matrix.makeRotationY(tile.rotation + Math.sin(tile.id * 7.3) * 0.055);
    matrix.setPosition(tile.x, tile.y, tile.z);
    tiles.setMatrixAt(tile.id, matrix);
    color
      .set(theme.terrain[tile.region])
      .lerp(
        new THREE.Color(
          tile.kind === "path" ? "#c6c4a2" : TILE_INFO[tile.kind].color,
        ),
        tile.kind === "path" ? 0.13 : 0.38,
      );
    tiles.setColorAt(tile.id, color);
  }
  tiles.castShadow = true;
  tiles.receiveShadow = true;
  group.add(tiles, tileSymbols(TILES));
  // A quiet earth-colored ribbon makes the route readable between stepping stones.
  for (let i = 1; i < TILES.length; i++) {
    const a = TILES[i - 1],
      b = TILES[i],
      mid = new THREE.Vector3(
        (a.x + b.x) / 2,
        (a.y + b.y) / 2 - 0.12,
        (a.z + b.z) / 2,
      ),
      len = Math.hypot(a.x - b.x, a.z - b.z);
    const road = box(
      props,
      theme.theme === "ice"
        ? "#c4d6d5"
        : theme.theme === "desert"
          ? "#c2a57b"
          : theme.theme === "volcano"
            ? "#85736a"
            : "#a3a586",
      mid.x,
      mid.y + 0.1,
      mid.z,
      1.14,
      0.045,
      len + 0.15,
    );
    road.rotation.y = Math.atan2(b.x - a.x, b.z - a.z);
    road.rotation.x = -Math.atan2(b.y - a.y, len);
  }
  for (const t of TILES) {
    if (t.kind === "path" && t.id % 3 === 0) {
      const side = t.id % 2 === 0 ? 1 : -1;
      for (let j = 0; j < 3; j++) {
        const tuft = cone(
          props,
          theme.foliage,
          t.x + side * (0.46 + j * 0.04),
          t.y + 0.1 + j * 0.02,
          t.z + 0.43 - j * 0.07,
          0.055,
          0.19 + j * 0.035,
        );
        tuft.rotation.z = side * 0.3;
      }
    }
    if (t.id % 5 === 0) {
      sphere(
        props,
        theme.rock,
        t.x - 0.57,
        t.y + 0.065,
        t.z - 0.5,
        0.1,
        0.07,
        0.13,
      );
      sphere(
        props,
        theme.terrain[t.region],
        t.x + 0.48,
        t.y + 0.095,
        t.z - 0.52,
        0.17,
        0.035,
        0.1,
      );
    }
  }
  const distance = (x: number, z: number) =>
    Math.min(...TILES.map((t) => Math.hypot(t.x - x, t.z - z)));
  const riverX = (z: number) => -3.5 + Math.sin(z * 0.3) * 1.8;
  const riverVerts: number[] = [],
    riverIds: number[] = [];
  const riverSamples = Array.from({ length: 149 }, (_, i) => {
    const z = -20 + i * 0.3;
    return { z, inside: shapeField(theme.id, riverX(z), z) > 0.25 };
  });
  const riverEdges: number[] = [];
  for (let i = 0; i < riverSamples.length; i++) {
    const { z, inside } = riverSamples[i],
      x = riverX(z);
    for (const d of [-0.62, 0.62])
      riverVerts.push(x + d, groundHeight(z) + 0.035, z);
    if (i < riverSamples.length - 1 && inside && riverSamples[i + 1].inside) {
      const n = i * 2;
      riverIds.push(n, n + 2, n + 1, n + 1, n + 2, n + 3);
    }
    if (i < riverSamples.length - 1 && inside && !riverSamples[i + 1].inside)
      riverEdges.push(z);
  }
  const rg = new THREE.BufferGeometry();
  rg.setAttribute("position", new THREE.Float32BufferAttribute(riverVerts, 3));
  rg.setIndex(riverIds);
  rg.computeVertexNormals();
  const riverFlow = waterMaterial(
    theme.water,
    false,
    theme.theme === "volcano",
  );
  group.add(new THREE.Mesh(rg, riverFlow.material));
  animated.push(riverFlow.update);
  const waterfallPositions = [
    ...riverEdges.slice(-3),
    ...[6, -1, -8].filter((z) => shapeField(theme.id, riverX(z), z) > 0.2),
  ].slice(0, 4);
  for (const z of waterfallPositions) {
    const x = riverX(z),
      top = groundHeight(z),
      height = riverEdges.includes(z) ? groundHeight(z) + 3.7 : 1.1;
    const waterfallFlow = waterMaterial(
      theme.water,
      true,
      theme.theme === "volcano",
    );
    animated.push(waterfallFlow.update);
    const fall = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, height, 4, 12),
      waterfallFlow.material,
    );
    fall.position.set(x, top - height / 2, z + 0.1);
    group.add(fall);
    for (let i = 0; i < 8; i++) {
      const stream = box(
        props,
        "#c4eef0",
        x - 0.5 + i * 0.15,
        top - height / 2,
        z + 0.12,
        0.025,
        height,
        0.02,
        0.45,
      );
      stream.rotation.z = (rng() - 0.5) * 0.03;
    }
    for (let j = 0; j < 5; j++) {
      const foam = sphere(
        group,
        theme.water,
        x + (rng() - 0.5),
        top - height + 0.2,
        z + (rng() - 0.5) * 0.3,
        0.25,
        0.1,
        0.18,
        0.35,
      );
      animated.push((t) => {
        foam.scale.y = 0.1 + Math.sin(t * 1.5 + j) * 0.025;
      });
    }
  }
  for (const tile of TILES.filter((t) => Math.abs(t.x - riverX(t.z)) < 1.3)) {
    for (const side of [-1, 1]) {
      box(
        props,
        "#9a825b",
        tile.x,
        tile.y + 0.3,
        tile.z + side * 0.73,
        1.65,
        0.07,
        0.07,
      );
      for (const dx of [-0.64, 0.64])
        box(
          props,
          "#786950",
          tile.x + dx,
          tile.y + 0.15,
          tile.z + side * 0.73,
          0.07,
          0.4,
          0.07,
        );
    }
    box(props, "#8f7956", tile.x, tile.y - 0.02, tile.z, 1.65, 0.12, 1.55);
  }
  function place(o: THREE.Object3D, x: number, z: number, rot = 0) {
    o.position.set(x, groundHeight(z), z);
    o.rotation.y = rot;
    props.add(o);
  }
  // Deliberately placed landmarks leave every playable tile unobstructed.
  place(house("#547f87", 1.1), -8.4, 8.15, 0.1);
  place(house(theme.roof, 0.8), -11.4, 12.6, 0.2);
  place(house(theme.roof, 0.75), -5.8, 12.3, -0.15);
  place(house(theme.roof, 0.65), 7.8, 8.2, -0.1);
  for (let i = 0; i < 3; i++) {
    cyl(props, "#85664b", -7 + i * 0.45, groundHeight(8) + 0.25, 8, 0.19, 0.5);
    box(
      props,
      "#b79465",
      -9 + i * 0.3,
      groundHeight(11.9) + 0.18,
      11.9,
      0.32,
      0.36,
      0.32,
    );
  }
  const forge = house("#4b7d85", 0.65);
  place(forge, -8, 12.5, 0.1);
  box(props, "#78665c", -6.9, groundHeight(12.5) + 0.45, 12.5, 0.6, 0.9, 0.6);
  box(
    props,
    "#ffb45e",
    -6.9,
    groundHeight(12.5) + 0.32,
    12.82,
    0.4,
    0.35,
    0.04,
    2,
  );
  // Market stall and a fenced little vegetable garden.
  for (const x of [-3.2, -1.8])
    cyl(props, "#8d7456", x, groundHeight(12.8) + 0.55, 12.8, 0.045, 1.1);
  box(props, theme.roof, -2.5, groundHeight(12.8) + 1.12, 12.8, 1.7, 0.15, 1.1);
  box(props, "#aa8a5f", -2.5, groundHeight(12.8) + 0.4, 12.8, 1.6, 0.12, 0.7);
  for (let i = 0; i < 7; i++) {
    box(
      props,
      "#a8926c",
      -12.8 + i * 0.4,
      groundHeight(8) + 0.35,
      8,
      0.06,
      0.7,
      0.07,
    );
  }
  box(props, "#a8926c", -11.6, groundHeight(8) + 0.46, 8, 2.5, 0.05, 0.05);
  const fortress = destination(theme);
  fortress.scale.setScalar(0.95);
  place(fortress, 4.2, -15, 0.04);
  // Rotating windmill.
  const mill = new THREE.Group();
  cone(mill, "#cfbd98", 0, 1, 0, 0.63, 2.3);
  cone(mill, theme.roof, 0, 2.3, 0, 0.8, 0.8);
  const sails = new THREE.Group();
  sails.position.set(0, 1.9, 0.72);
  for (let i = 0; i < 4; i++) {
    const blade = new THREE.Group();
    box(blade, "#b9ad88", 0, 0.63, 0, 0.28, 1.25, 0.055);
    box(blade, "#766d54", 0.12, 0.65, 0.035, 0.03, 1.3, 0.03);
    blade.rotation.z = (i * Math.PI) / 2;
    sails.add(blade);
  }
  mill.add(sails);
  mill.position.set(9, groundHeight(4.75), 4.75);
  group.add(mill);
  animated.push((t) => (sails.rotation.z = t * 0.18));
  // Runic portal.
  const portal = new THREE.Group();
  for (const x of [-0.73, 0.73])
    box(portal, "#8d94a0", x, 0.8, 0, 0.32, 1.6, 0.4);
  const arch = new THREE.Mesh(
    new THREE.TorusGeometry(0.74, 0.19, 5, 16, Math.PI),
    material("#9aa2a9"),
  );
  arch.position.y = 1.55;
  portal.add(arch);
  const energy = new THREE.Mesh(
    new THREE.CircleGeometry(0.66, 40),
    new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      uniforms: {
        time: { value: 0 },
        tint: { value: new THREE.Color(theme.accent) },
      },
      vertexShader:
        "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
      fragmentShader:
        "uniform float time;uniform vec3 tint;varying vec2 vUv;void main(){vec2 p=vUv-.5;float r=length(p);float wave=sin(r*45.-time*2.+atan(p.y,p.x)*3.);float a=smoothstep(.5,.1,r);gl_FragColor=vec4(tint*(.8+wave*.4),a*.8);}",
    }),
  );
  energy.position.set(0, 1.2, 0.02);
  energy.scale.y = 1.5;
  portal.add(energy);
  portal.position.set(-8.5, groundHeight(-5.75), -5.75);
  group.add(portal);
  animated.push((t) => (energy.material.uniforms.time.value = t));
  for (const [x, z] of [
    [-5, -9.3],
    [7, -5.7],
    [-12, -6],
    [11, -12],
  ]) {
    place(crystal(theme.accent, 0.7 + rng() * 0.4), x, z);
  }
  // Ruins and shrine.
  for (let i = 0; i < 4; i++) {
    const x = -5 + i * 0.6,
      z = -9.25;
    const h = 0.6 + rng() * 0.7;
    cyl(props, "#abb1a0", x, groundHeight(z) + h / 2, z, 0.16, h);
    cyl(props, "#c1c4af", x, groundHeight(z) + h, z, 0.22, 0.1);
  }
  box(props, "#949f93", -4.1, groundHeight(-9.25) + 0.1, -9.25, 3, 0.2, 1.2);
  function themedTree(x: number, z: number, s: number) {
    const y = groundHeight(z);
    if (theme.theme === "mushroom") {
      cyl(props, "#c1b6bc", x, y + s * 0.6, z, s * 0.15, s * 1.2);
      const cap = meshCap(props, theme.foliage, x, y + s * 1.2, z, s * 0.75);
      cap.scale.y = s * 0.32;
      for (let i = 0; i < 3; i++)
        sphere(
          props,
          theme.accent,
          x + (rng() - 0.5) * s,
          y + s * 1.45,
          z + (rng() - 0.5) * s,
          0.06,
          0.035,
          0.06,
          0.5,
        );
      return;
    }
    if (theme.theme === "desert" || theme.theme === "ocean") {
      const trunk = cyl(props, "#947b5a", x, y + s * 0.8, z, 0.1 * s, s * 1.6);
      trunk.rotation.z = 0.1;
      for (let i = 0; i < 6; i++) {
        const leaf = sphere(
          props,
          theme.foliage,
          x + Math.cos(i) * s * 0.45,
          y + s * 1.7,
          z + Math.sin(i) * s * 0.45,
          s * 0.65,
          0.13 * s,
          0.2 * s,
        );
        leaf.rotation.y = -i;
      }
      return;
    }
    if (theme.theme === "sakura" || (theme.theme === "forest" && rng() < 0.2)) {
      place(blossom(s), x, z);
      return;
    }
    const tree = pine(s, Math.floor(rng() * 3));
    if (theme.theme !== "forest")
      tree.traverse((o) => {
        if (o instanceof THREE.Mesh && o.geometry.type === "ConeGeometry")
          o.material = material(theme.foliage);
      });
    place(tree, x, z);
    if (theme.theme === "ice")
      cone(props, "#d5e3dd", x, y + s * 2.1, z, s * 0.43, s * 0.8);
  }
  for (let i = 0; i < 330; i++) {
    const x = (rng() - 0.5) * 27,
      z = (rng() - 0.5) * 29;
    if (
      shapeField(theme.id, x, z) < 0.6 ||
      ENVIRONMENT_RESERVES.some((p) => Math.hypot(x - p.x, z - p.z) < p.r) ||
      distance(x, z) < 1.55 ||
      Math.abs(x - riverX(z)) < 1.1 ||
      Math.hypot(x - 4, z + 15) < 4 ||
      Math.hypot(x + 8.5, z + 5.75) < 2.3 ||
      Math.hypot(x - 9, z - 4.75) < 2.3 ||
      Math.hypot(x + 8, z - 8.15) < 2
    )
      continue;
    themedTree(x, z, 0.38 + rng() * 0.62);
  }
  for (let i = 0; i < 200; i++) {
    const x = (rng() - 0.5) * 28,
      z = (rng() - 0.5) * 30;
    if (
      shapeField(theme.id, x, z) < 0.35 ||
      distance(x, z) < 1 ||
      Math.abs(x - riverX(z)) < 0.8
    )
      continue;
    const y = groundHeight(z);
    if (i % 6 === 0)
      sphere(props, theme.rock, x, y + 0.13, z, 0.22 + rng() * 0.2, 0.2, 0.22);
    else if (i % 4 === 0) {
      cyl(props, "#b4bda6", x, y + 0.12, z, 0.03, 0.22);
      sphere(
        props,
        theme.theme === "mushroom" ? theme.accent : "#d6b178",
        x,
        y + 0.24,
        z,
        0.12,
        0.065,
        0.12,
        0.15,
      );
    } else {
      const tuft = cone(props, theme.foliage, x, y + 0.13, z, 0.09, 0.28);
      tuft.rotation.z = (rng() - 0.5) * 0.5;
    }
  }
  // Each realm has an exclusive silhouette and focal feature.
  if (theme.theme === "dragon") {
    dragon(group, animated, -1, groundHeight(-11) + 3, -11, theme.accent);
    for (const x of [-11.8, 11.8]) {
      cone(props, "#73747b", x, groundHeight(-7) + 1.8, -7, 1.3, 3.6);
      crystal(theme.accent);
    }
    for (let i = 0; i < 6; i++)
      box(
        props,
        "#b4a594",
        -6 + i * 0.5,
        groundHeight(-2.25) + 1,
        -2.25,
        0.22,
        2,
        0.7,
      );
  }
  if (theme.theme === "desert") {
    for (let i = 0; i < 5; i++)
      box(
        props,
        "#d6ba86",
        -7.5,
        groundHeight(-9.25) + i * 0.3,
        -9.25,
        3.6 - i * 0.6,
        0.3,
        3.6 - i * 0.6,
      );
  }
  if (theme.theme === "astral") {
    const orbit = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.3, 0.035, 6, 64),
        material("#d8c78f", 0.45),
      );
      ring.rotation.set(i * 0.7, 0.3 + i * 0.7, 0);
      orbit.add(ring);
    }
    sphere(orbit, theme.accent, 0, 0, 0, 0.35, 0.35, 0.35, 1);
    orbit.position.set(-7, groundHeight(-9.2) + 2, -9.2);
    group.add(orbit);
    animated.push((t) => (orbit.rotation.y = t * 0.15));
  }
  if (theme.theme === "clockwork") {
    const gear = new THREE.Group();
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1, 0.18, 6, 24),
      material("#c49b60", 0.1, 0.45),
    );
    gear.add(ring);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const tooth = box(
        gear,
        "#c49b60",
        Math.cos(a) * 1.15,
        Math.sin(a) * 1.15,
        0,
        0.3,
        0.3,
        0.22,
      );
      tooth.rotation.z = a;
    }
    gear.position.set(-7, groundHeight(-9) + 1.8, -9);
    group.add(gear);
    animated.push((t) => (gear.rotation.z = t * 0.14));
  }
  if (theme.theme === "ocean") {
    const light = new THREE.Group();
    cyl(light, "#d5d4b6", 0, 1.4, 0, 0.55, 2.8);
    cyl(light, "#678c96", 0, 2.8, 0, 0.7, 0.16);
    cyl(light, "#f3d69b", 0, 3.05, 0, 0.4, 0.4, 1);
    cone(light, theme.roof, 0, 3.5, 0, 0.8, 0.6);
    place(light, -8, -9.2);
  }
  // Floating satellites create a clear floating-island silhouette.
  for (const [x, z, s] of [
    [-18, 3, 1],
    [17, -7, 1.2],
    [-16, -14, 0.7],
    [14, 15, 0.5],
  ]) {
    const rock = sphere(group, theme.rock, x, -1.5, z, s * 1.2, s * 1.5, s);
    cone(group, theme.terrain[2], x, -0.4, z, s * 1.1, 0.3);
    const c = crystal(theme.accent, s * 0.7);
    c.position.set(x, -0.2, z);
    group.add(c);
    animated.push((t) => {
      c.position.y = -0.2 + Math.sin(t * 0.5 + x) * 0.12;
      rock.position.y = -1.5 + Math.sin(t * 0.5 + x) * 0.12;
    });
  }
  const cloudCanvas = document.createElement("canvas");
  cloudCanvas.width = 64;
  cloudCanvas.height = 64;
  const cloudCtx = cloudCanvas.getContext("2d")!;
  const gradient = cloudCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, "rgba(170,196,201,.55)");
  gradient.addColorStop(0.5, "rgba(143,173,184,.2)");
  gradient.addColorStop(1, "rgba(143,173,184,0)");
  cloudCtx.fillStyle = gradient;
  cloudCtx.fillRect(0, 0, 64, 64);
  const cloudTexture = new THREE.CanvasTexture(cloudCanvas);
  const cloudMaterial = new THREE.SpriteMaterial({
    map: cloudTexture,
    transparent: true,
    opacity: 0.18,
    depthWrite: false,
  });
  for (let i = 0; i < 8; i++) {
    const cloud = new THREE.Sprite(cloudMaterial);
    const a = (i / 8) * Math.PI * 2;
    cloud.position.set(Math.cos(a) * 11, -5, Math.sin(a) * 13);
    cloud.scale.set(13, 3.5, 1);
    group.add(cloud);
    animated.push((t) => {
      cloud.position.x = Math.cos(a) * 11 + Math.sin(t * 0.05 + i) * 0.4;
    });
  }
  for (const [x, z] of [
    [-9.9, 9],
    [-6, 11.9],
    [10, 5.4],
    [-8, -5],
    [4, -12.1],
  ]) {
    const y = groundHeight(z);
    cyl(props, "#736d52", x, y + 0.45, z, 0.035, 0.9);
    box(props, "#ffd193", x, y + 0.96, z, 0.14, 0.2, 0.14, 1.6);
    cone(props, "#6b7060", x, y + 1.1, z, 0.15, 0.13);
  }
  props.traverse((o) => {
    if (
      o instanceof THREE.Mesh &&
      o.material instanceof THREE.MeshStandardMaterial
    ) {
      const color = "#" + o.material.color.getHexString();
      if (
        [
          theme.foliage,
          "#2b6358",
          "#3e7860",
          "#4d8564",
          "#d59ca6",
          "#d9a7bd",
        ].includes(color)
      )
        addWind(o.material);
    }
  });
  if (theme.id === "ember") {
    const basin = cyl(group, "#f08b42", 0, -0.3, -2.25, 4.2, 0.06, 1.1);
    basin.scale.z = 0.9;
    animated.push((t) => {
      (basin.material as THREE.MeshStandardMaterial).emissiveIntensity =
        1 + Math.sin(t * 0.9) * 0.18;
    });
  }
  for (let i = 1; i < TILES.length; i++) {
    const a = TILES[i - 1],
      b = TILES[i],
      x = (a.x + b.x) / 2,
      z = (a.z + b.z) / 2;
    if (rawShapeField(theme.id, x, z) >= 0) continue;
    const length = Math.hypot(b.x - a.x, b.z - a.z),
      angle = Math.atan2(b.x - a.x, b.z - a.z),
      y = (a.y + b.y) / 2;
    const bridge = box(
      props,
      theme.id === "astral" ? "#9b91bc" : "#a18c65",
      x,
      y - 0.1,
      z,
      1.05,
      0.15,
      length + 0.5,
    );
    bridge.rotation.y = angle;
    for (const side of [-1, 1]) {
      const rail = box(
        props,
        "#b8ad8c",
        x + Math.cos(angle) * 0.62 * side,
        y + 0.3,
        z - Math.sin(angle) * 0.62 * side,
        0.045,
        0.055,
        length + 0.4,
      );
      rail.rotation.y = angle;
    }
  }
  const batched = batch(props);
  group.add(batched);
  const cleanup: (() => void)[] = [];
  // Reuse the supplied bridge without loading an entire prebuilt scene.
  loadModel("/models/bridge.glb")
    .then((gltf) => {
      if (!group.parent) return;
      const model = gltf.scene.clone(true);
      const b = new THREE.Box3().setFromObject(model),
        s = b.getSize(new THREE.Vector3()),
        c = b.getCenter(new THREE.Vector3());
      model.position.sub(new THREE.Vector3(c.x, b.min.y, c.z));
      const container = new THREE.Group();
      container.userData.sharedAsset = true;
      container.add(model);
      container.scale.setScalar(2.1 / Math.max(s.x, s.z));
      container.position.set(riverX(8.1), groundHeight(8.1) + 0.05, 8.1);
      group.add(container);
    })
    .catch(() => {});
  return {
    group,
    tiles,
    animated,
    dispose() {
      group.traverse((o) => {
        if (!(o instanceof THREE.Mesh)) return;
        let parent: THREE.Object3D | null = o;
        while (parent) {
          if (parent.userData.sharedAsset) return;
          parent = parent.parent;
        }
        if (!sharedGeometries.has(o.geometry)) o.geometry.dispose();
        for (const mat of Array.isArray(o.material) ? o.material : [o.material])
          if (!isSharedMaterial(mat)) {
            if (mat instanceof THREE.MeshBasicMaterial && mat.map)
              mat.map.dispose();
            mat.dispose();
          }
      });
      cloudTexture.dispose();
      cloudMaterial.dispose();
      cleanup.forEach((f) => f());
      group.removeFromParent();
    },
  };
}
function meshCap(
  p: THREE.Object3D,
  c: string,
  x: number,
  y: number,
  z: number,
  r: number,
) {
  const m = new THREE.Mesh(
    new THREE.SphereGeometry(1, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2),
    material(c, 0.18),
  );
  m.position.set(x, y, z);
  m.scale.set(r, r, r);
  p.add(m);
  return m;
}
function dragon(
  group: THREE.Group,
  animated: ((t: number) => void)[],
  x: number,
  y: number,
  z: number,
  color: string,
) {
  const g = new THREE.Group();
  sphere(g, "#3c4754", 0, 0, 0, 0.65, 0.45, 1.15);
  sphere(g, "#3c4754", 0, 0.48, 0.86, 0.35, 0.32, 0.5);
  cone(g, color, -0.18, 0.8, 0.7, 0.08, 0.35);
  cone(g, color, 0.18, 0.8, 0.7, 0.08, 0.35);
  for (const dx of [-0.16, 0.16])
    sphere(g, "#f1bd6d", dx, 0.57, 1.22, 0.06, 0.035, 0.03, 2);
  const tail = cone(g, "#3c4754", 0, -0.05, -1.2, 0.3, 1.7);
  tail.rotation.x = -Math.PI / 2;
  const wings: THREE.Group[] = [];
  for (const dir of [-1, 1]) {
    const wing = new THREE.Group();
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(dir * 2.7, 0.9);
    shape.lineTo(dir * 1.8, -0.65);
    shape.lineTo(dir * 0.9, -0.25);
    shape.lineTo(0, -0.7);
    const m = new THREE.Mesh(
      new THREE.ShapeGeometry(shape),
      new THREE.MeshStandardMaterial({
        color: "#865b60",
        roughness: 0.8,
        side: THREE.DoubleSide,
      }),
    );
    m.rotation.x = -Math.PI / 2;
    wing.add(m);
    wing.position.set(dir * 0.4, 0.2, -0.1);
    g.add(wing);
    wings.push(wing);
    for (const dz of [-0.5, 0.5]) {
      const leg = box(g, "#3c4754", dir * 0.42, -0.5, dz, 0.18, 0.65, 0.2);
      leg.rotation.z = dir * 0.25;
    }
  }
  g.position.set(x, y, z);
  group.add(g);
  animated.push((t) => {
    g.position.y = y + Math.sin(t * 0.9) * 0.3;
    g.rotation.y = Math.sin(t * 0.13) * 0.25;
    wings.forEach(
      (w, i) => (w.rotation.z = Math.sin(t * 1.7) * 0.22 * (i === 0 ? -1 : 1)),
    );
  });
}
