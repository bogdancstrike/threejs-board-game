import * as THREE from "three";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { GLTFLoader, type GLTF } from "three/addons/loaders/GLTFLoader.js";
import { clone } from "three/addons/utils/SkeletonUtils.js";
import { characterEffects } from "./character-effects";
import { rigStaticModel } from "./rig";
import { registerRig } from "./animation";
import type { Character } from "../game/data";
const mats = new Map<string, THREE.MeshStandardMaterial>();
export function material(color: string, glow = 0, metal = 0) {
  const key = `${color}/${glow}/${metal}`;
  if (!mats.has(key))
    mats.set(
      key,
      new THREE.MeshStandardMaterial({
        color,
        roughness: metal ? 0.4 : 0.85,
        metalness: metal,
        emissive: color,
        emissiveIntensity: glow,
        flatShading: true,
      }),
    );
  const result = mats.get(key)!;
  result.userData.baseGlow = glow;
  return result;
}
const cube = new THREE.BoxGeometry(1, 1, 1),
  ball = new THREE.IcosahedronGeometry(1, 1),
  round = new THREE.SphereGeometry(1, 12, 8),
  cylinder = new THREE.CylinderGeometry(1, 1, 1, 12),
  pyramid = new THREE.ConeGeometry(1, 1, 8);
export function mesh(
  parent: THREE.Object3D,
  geo: THREE.BufferGeometry,
  color: string,
  x: number,
  y: number,
  z: number,
  sx = 1,
  sy = 1,
  sz = 1,
  glow = 0,
) {
  const o = new THREE.Mesh(geo, material(color, glow));
  o.position.set(x, y, z);
  o.scale.set(sx, sy, sz);
  o.castShadow = true;
  o.receiveShadow = true;
  parent.add(o);
  return o;
}
export function box(
  p: THREE.Object3D,
  c: string,
  x: number,
  y: number,
  z: number,
  w: number,
  h: number,
  d: number,
  g = 0,
) {
  return mesh(p, cube, c, x, y, z, w, h, d, g);
}
export function sphere(
  p: THREE.Object3D,
  c: string,
  x: number,
  y: number,
  z: number,
  w: number,
  h = w,
  d = w,
  g = 0,
) {
  return mesh(p, ball, c, x, y, z, w, h, d, g);
}
export function cyl(
  p: THREE.Object3D,
  c: string,
  x: number,
  y: number,
  z: number,
  r: number,
  h: number,
  g = 0,
) {
  return mesh(p, cylinder, c, x, y, z, r, h, r, g);
}
export function cone(
  p: THREE.Object3D,
  c: string,
  x: number,
  y: number,
  z: number,
  r: number,
  h: number,
  g = 0,
) {
  return mesh(p, pyramid, c, x, y, z, r, h, r, g);
}
export function pine(scale = 1, variant = 0) {
  const g = new THREE.Group();
  cyl(g, "#705845", 0, 0.65, 0, 0.12, 1.3);
  const colors = ["#2b6358", "#3e7860", "#4d8564"];
  for (let i = 0; i < 3; i++)
    cone(
      g,
      colors[(i + variant) % 3],
      0,
      1 + i * 0.52,
      0,
      0.85 - i * 0.16,
      1.3,
    );
  g.scale.setScalar(scale);
  return g;
}
export function blossom(scale = 1) {
  const g = new THREE.Group();
  cyl(g, "#6e514f", 0, 0.8, 0, 0.15, 1.6);
  const b = cyl(g, "#6e514f", 0.25, 1.35, 0, 0.1, 0.9);
  b.rotation.z = -0.65;
  for (const [x, y, z, r] of [
    [0, 2, 0, 0.85],
    [-0.65, 1.8, 0.15, 0.65],
    [0.65, 2, 0.2, 0.7],
    [0.2, 2.5, -0.2, 0.6],
  ])
    sphere(g, x > 0 ? "#d59ca6" : "#d9a7bd", x, y, z, r, r * 0.7, r);
  g.scale.setScalar(scale);
  return g;
}
export function crystal(color = "#9b8edb", scale = 1) {
  const g = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const c = cone(
      g,
      color,
      (i - 1) * 0.32,
      0.45 + (i % 2) * 0.3,
      0,
      0.23,
      0.9 + (i % 2) * 0.6,
      0.65,
    );
    c.rotation.z = (i - 1) * -0.25;
    cyl(g, color, (i - 1) * 0.32, 0.15, 0, 0.23, 0.25, 0.4);
  }
  g.scale.setScalar(scale);
  return g;
}
export function house(roof = "#456d79", scale = 1) {
  const g = new THREE.Group();
  box(g, "#d0bd97", 0, 0.8, 0, 1.8, 1.6, 1.6);
  box(g, "#82745d", 0, 0.08, 0, 2, 0.16, 1.8);
  const r = cone(g, roof, 0, 1.95, 0, 1.65, 1.25);
  r.rotation.y = Math.PI / 4;
  r.scale.z = 1.1;
  for (const x of [-0.85, 0.85])
    box(g, "#655040", x, 0.8, 0.83, 0.09, 1.6, 0.08);
  box(g, "#655040", 0, 0.83, 0.84, 1.8, 0.1, 0.08);
  box(g, "#564941", 0, 0.47, 0.87, 0.44, 0.9, 0.08);
  for (const x of [-0.56, 0.56]) {
    box(g, "#655040", x, 1.15, 0.85, 0.4, 0.5, 0.09);
    box(g, "#ffd087", x, 1.15, 0.91, 0.27, 0.35, 0.025, 1.5);
  }
  box(g, "#9d8d78", 0.55, 2.2, -0.3, 0.3, 1.1, 0.3);
  g.scale.setScalar(scale);
  return g;
}
export function castle() {
  const g = new THREE.Group();
  box(g, "#9aaca4", 0, 1.1, 0, 4.8, 2.2, 2.8);
  box(g, "#c4c5ac", 0, 0.2, 0.5, 5.5, 0.4, 4);
  for (const x of [-2.1, 2.1])
    for (const z of [-1.1, 1.1]) {
      cyl(g, "#b8c4b1", x, 1.9, z, 0.63, 3.8);
      cyl(g, "#839b96", x, 3.5, z, 0.7, 0.3);
      cone(g, "#b86d52", x, 4.2, z, 1, 1.4);
      cyl(g, "#d9b567", x, 5, z, 0.035, 0.45);
      const flag = box(g, "#d9b567", x + 0.22, 5.08, z, 0.45, 0.22, 0.03);
      flag.rotation.y = 0.2;
      box(g, "#ffd28b", x, 2.7, z + 0.62, 0.16, 0.42, 0.04, 1.3);
    }
  box(g, "#b7c1b2", 0, 2.3, -0.4, 2, 4.6, 2);
  cone(g, "#af634c", 0, 5.1, -0.4, 1.75, 1.5);
  for (const x of [-0.55, 0, 0.55])
    box(g, "#ffd28b", x, 3.8, 0.63, 0.2, 0.45, 0.04, 1.3);
  box(g, "#33494b", 0, 0.8, 1.43, 1, 1.6, 0.08);
  const arch = new THREE.Mesh(
    new THREE.TorusGeometry(0.52, 0.13, 5, 12, Math.PI),
    material("#d7c8a4"),
  );
  arch.position.set(0, 1.5, 1.5);
  g.add(arch);
  for (let i = 0; i < 4; i++)
    box(g, "#a4ad9b", 0, 0.12 - i * 0.09, 2 + i * 0.27, 1.4, 0.18, 0.4);
  for (let i = -4; i <= 4; i++) {
    box(g, "#bcc3aa", i * 0.48, 2.35, 1.1, 0.27, 0.4, 0.4);
  }
  return g;
}
export function prototypeCharacter(c: Character, tint = c.color) {
  const g = new THREE.Group();
  cyl(g, "#36464b", 0, 0.05, 0, 0.4, 0.1);
  cyl(g, tint, 0, 0.11, 0, 0.37, 0.035, 0.5);
  const body = new THREE.Group();
  body.position.y = 0.12;
  g.add(body);
  const male = ["paladin", "swordsman", "scholar"].includes(c.role);
  const robe = ["mage", "priest", "fox", "frost", "scholar"].includes(c.role);
  for (const x of [-0.1, 0.1]) {
    box(body, "#383646", x, 0.22, 0, 0.12, 0.4, 0.15);
    mesh(body, round, c.skin, x, 0.51, 0, 0.075, 0.19, 0.075);
    box(body, "#383646", x, 0.08, 0.035, 0.13, 0.13, 0.22);
  }
  if (robe) cone(body, c.color, 0, 0.48, 0, 0.27, 0.65);
  mesh(body, round, c.color, 0, 0.77, 0, male ? 0.22 : 0.18, 0.28, 0.12);
  cyl(body, "#d4b775", 0, 0.65, 0, 0.19, 0.055);
  mesh(body, round, c.skin, 0, 1.17, 0, 0.135, 0.17, 0.13);
  mesh(body, round, c.hair, 0, 1.28, -0.025, 0.15, 0.13, 0.135);
  if (!male) mesh(body, round, c.hair, 0, 1.05, -0.105, 0.16, 0.28, 0.08);
  for (const x of [-0.053, 0.053]) {
    mesh(body, round, "#eee8e3", x, 1.19, 0.116, 0.031, 0.02, 0.01);
    sphere(body, c.color, x, 1.19, 0.126, 0.014, 0.019, 0.007);
    const arm = mesh(
      body,
      round,
      c.color,
      x < 0 ? -0.24 : 0.24,
      0.79,
      0,
      0.065,
      0.22,
      0.065,
    );
    arm.rotation.z = x < 0 ? -0.3 : 0.3;
    sphere(body, c.skin, x < 0 ? -0.29 : 0.29, 0.61, 0.02, 0.06);
  }
  if (["mage", "frost"].includes(c.role)) {
    cyl(body, c.color, 0, 1.35, 0, 0.3, 0.035);
    const hat = cone(
      body,
      c.role === "mage" ? "#52416d" : c.color,
      0,
      1.58,
      0,
      0.23,
      0.5,
    );
    hat.rotation.z = -0.17;
  }
  if (["mage", "priest", "frost", "scholar"].includes(c.role)) {
    cyl(body, "#b59b66", 0.32, 0.77, 0.03, 0.023, 1.15);
    sphere(body, c.color, 0.32, 1.4, 0.03, 0.12, 0.15, 0.12, 1.8);
  } else {
    const sword = box(body, "#dddac7", 0.34, 0.72, 0.05, 0.04, 0.65, 0.04);
    sword.rotation.z = -0.2;
    box(body, "#d4b775", 0.3, 0.56, 0.05, 0.22, 0.04, 0.05);
  }
  if (["knight", "paladin", "valkyrie", "swordsman"].includes(c.role)) {
    const cape = cone(
      body,
      c.role === "swordsman" ? "#393447" : c.color,
      0,
      0.75,
      -0.13,
      0.29,
      0.7,
    );
    cape.scale.z = 0.35;
    for (const x of [-0.21, 0.21])
      sphere(body, "#d6c28c", x, 0.93, 0, 0.105, 0.065, 0.12);
  }
  if (["demon", "fox"].includes(c.role))
    for (const x of [-0.12, 0.12]) {
      const horn = cone(
        body,
        c.role === "fox" ? c.color : "#d7c3ae",
        x,
        1.43,
        0,
        0.065,
        0.24,
      );
      horn.rotation.z = x < 0 ? 0.4 : -0.4;
    }
  const limbs: {
    node: THREE.Object3D;
    side: number;
    kind: string;
    rotation: THREE.Euler;
  }[] = [];
  for (const child of [...body.children]) {
    if (Math.abs(child.position.x) === 0.1 && child.position.y < 0.6) {
      const pivot = new THREE.Group();
      pivot.position.set(child.position.x, 0.58, 0);
      body.add(pivot);
      pivot.attach(child);
      limbs.push({
        node: pivot,
        side: pivot.position.x < 0 ? 0 : 1,
        kind: "leg",
        rotation: pivot.rotation.clone(),
      });
    } else if (Math.abs(child.position.x) === 0.24) {
      const pivot = new THREE.Group();
      pivot.position.set(child.position.x, 0.94, 0);
      body.add(pivot);
      pivot.attach(child);
      limbs.push({
        node: pivot,
        side: pivot.position.x < 0 ? 0 : 1,
        kind: "arm",
        rotation: pivot.rotation.clone(),
      });
    }
  }
  g.userData.limbs = limbs;
  g.userData.body = body;
  characterEffects(g, c);
  return g;
}
export const MODEL_PATHS: Record<string, string> = {
  lyra: "/models/lyra.glb",
  seraphine: "/models/seraphine.glb",
  rhea: "/models/rhea.glb",
  selene: "/models/selene.glb",
  nyx: "/models/nyx.glb",
  alaric: "/models/environment/warrior.glb",
  elowen: "/models/environment/archer.glb",
  vesper: "/models/environment/demon-queen.glb",
};
const loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);
const cache = new Map<string, Promise<GLTF>>();
export async function loadModel(url: string) {
  if (!cache.has(url)) cache.set(url, loader.loadAsync(url));
  return cache.get(url)!;
}
export async function characterModel(c: Character, tint = c.color) {
  const root = prototypeCharacter(c, tint);
  if (!MODEL_PATHS[c.id]) return root;
  try {
    const gltf = await loadModel(MODEL_PATHS[c.id]);
    const model = clone(gltf.scene);
    model.updateMatrixWorld(true);
    model.traverse((o) => {
      if (o instanceof THREE.SkinnedMesh) {
        o.skeleton.update();
        o.computeBoundingBox();
      }
    });
    const bounds = new THREE.Box3().setFromObject(model);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const normalizer = new THREE.Group();
    let display: THREE.Object3D = model;
    if (!gltf.scene.getObjectByProperty("isSkinnedMesh", true)) {
      display = rigStaticModel(model);
      normalizer.add(display);
    } else {
      normalizer.add(model);
      model.position.sub(new THREE.Vector3(center.x, bounds.min.y, center.z));
      normalizer.scale.setScalar(1.5 / size.y);
    }
    normalizer.position.y = 0.13;
    model.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    root.remove(root.userData.body);
    root.add(normalizer);
    root.userData.body = normalizer;
    root.userData.asset = true;
    registerRig(root, display);
    if (gltf.animations.length) {
      const mixer = new THREE.AnimationMixer(model);
      const idle = gltf.animations.find((a) => /^idle$/i.test(a.name));
      if (idle) mixer.clipAction(idle).play();
      root.userData.mixer = mixer;
    }
    return root;
  } catch (e) {
    console.warn("Character asset unavailable; using labeled prototype.", e);
    return root;
  }
}

export const sharedGeometries = new Set([cube, ball, round, cylinder, pyramid]);
export function isSharedMaterial(m: THREE.Material) {
  return [...mats.values()].includes(m as THREE.MeshStandardMaterial);
}

const foliageTime = { value: 0 };
export function addWind(mat: THREE.MeshStandardMaterial) {
  if (mat.userData.wind) return;
  mat.userData.wind = true;
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.foliageTime = foliageTime;
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\nuniform float foliageTime;",
      )
      .replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\ntransformed.x+=sin(foliageTime*1.1+position.x*.9+position.z*.5)*.035*clamp(position.y,0.,3.);transformed.z+=cos(foliageTime*.8+position.x*.6)*.02;",
      );
  };
  mat.customProgramCacheKey = () => "foliage-wind-v1";
}
export function updateWorldMaterials(t: number) {
  foliageTime.value = t;
  for (const mat of mats.values()) {
    const intensity = mat.userData.baseGlow as number | undefined;
    if (intensity)
      mat.emissiveIntensity =
        intensity * (0.9 + Math.sin(t * 1.2 + mat.color.r * 7) * 0.13);
  }
}
