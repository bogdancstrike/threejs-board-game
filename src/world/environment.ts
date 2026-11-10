import * as THREE from "three";
import { clone } from "three/addons/utils/SkeletonUtils.js";
import { groundHeight, getTiles, seededRandom } from "../game/data";
import type { MapTheme } from "../game/maps";
import { loadModel } from "./assets";
export const ENVIRONMENT_RESERVES = [
  { x: 3.8, z: 13.2, r: 2.1 },
  { x: -9, z: 4.75, r: 1.5 },
  { x: -11.8, z: -9.1, r: 1.7 },
  { x: 10.8, z: -5.6, r: 1.4 },
];
interface Placement {
  id: string;
  x: number;
  z: number;
  height: number;
  footprint: number;
  rotation?: number;
  floating?: boolean;
}
export interface EnvironmentAssets {
  group: THREE.Group;
  ready: Promise<void>;
  update: (t: number, dt: number) => void;
  dispose: () => void;
  setQuality: (q: string) => void;
}
function normalize(source: THREE.Object3D, height: number, footprint: number) {
  source.updateMatrixWorld(true);
  source.traverse((o) => {
    if (o instanceof THREE.SkinnedMesh) {
      o.skeleton.update();
      o.computeBoundingBox();
    }
  });
  const bounds = new THREE.Box3().setFromObject(source),
    size = bounds.getSize(new THREE.Vector3()),
    center = bounds.getCenter(new THREE.Vector3());
  const scale = Math.min(
    height / Math.max(size.y, 0.001),
    footprint / Math.max(size.x, size.z, 0.001),
  );
  const group = new THREE.Group();
  group.add(source);
  source.position.sub(new THREE.Vector3(center.x, bounds.min.y, center.z));
  group.scale.setScalar(scale);
  return group;
}
export function addEnvironmentAssets(theme: MapTheme): EnvironmentAssets {
  const group = new THREE.Group();
  group.userData.sharedAsset = true;
  const mixers: THREE.AnimationMixer[] = [],
    updates: ((t: number) => void)[] = [],
    loaded: THREE.Object3D[] = [],
    rng = seededRandom(theme.id.length * 117),
    tiles = getTiles(theme.id);
  let disposed = false;
  const placements: Placement[] = [
    {
      id: "tavern",
      x: 3.8,
      z: 13.2,
      height: 3.1,
      footprint: 3.5,
      rotation: 0.18,
    },
    {
      id: "craftsman",
      x: -7.2,
      z: 11.9,
      height: 1.3,
      footprint: 1.1,
      rotation: -0.2,
    },
    { id: "pet", x: 6.6, z: 8.25, height: 0.6, footprint: 0.6 },
    {
      id: "warrior",
      x: 7.4,
      z: -14.8,
      height: 1.4,
      footprint: 1.2,
      rotation: Math.PI,
    },
  ];
  if (["forest", "sakura", "mushroom", "astral"].includes(theme.theme))
    placements.push({
      id: "boutique",
      x: -9,
      z: 4.75,
      height: 2.7,
      footprint: 2.2,
      rotation: 0.3,
    });
  if (["forest", "mushroom", "astral", "clockwork"].includes(theme.theme))
    placements.push({
      id: "wizard-tower",
      x: -11.8,
      z: -9.1,
      height: 4.5,
      footprint: 2.6,
      rotation: 0.2,
    });
  if (theme.theme === "mushroom")
    placements.push({ id: "hut", x: 10.8, z: -5.6, height: 3, footprint: 2.2 });
  const plantPositions = [
    [-12.5, 4.8],
    [-7, 1.3],
    [6, 4.75],
    [8, -2.25],
    [-10, -2.3],
    [-6, -5.7],
    [10, -9.3],
    [-1, -9.3],
  ];
  for (let i = 0; i < plantPositions.length; i++) {
    const [x, z] = plantPositions[i];
    if (Math.min(...tiles.map((t) => Math.hypot(t.x - x, t.z - z))) < 1.1)
      continue;
    const magical = ["mushroom", "astral", "ice"].includes(theme.theme);
    placements.push({
      id: magical ? "light-plant" : i % 2 ? "fern" : "flowers",
      x,
      z,
      height: 0.6 + rng() * 0.25,
      footprint: 0.7,
      rotation: rng() * 6,
    });
  }
  if (["forest", "sakura", "astral", "mushroom"].includes(theme.theme))
    for (const [x, z] of [
      [-12.5, 12.8],
      [11.8, 8.3],
      [-11.7, 1.3],
      [9, -9.3],
    ])
      placements.push({
        id: "purple-tree",
        x,
        z,
        height: 2.3,
        footprint: 1.7,
        rotation: rng() * 6,
      });
  for (const [x, z] of [
    [-6, 4.7],
    [10, 1.3],
    [-7, -2.2],
    [9.4, -5.7],
  ])
    placements.push({
      id: "mushrooms",
      x,
      z,
      height: theme.theme === "mushroom" ? 1 : 0.45,
      footprint: theme.theme === "mushroom" ? 1.4 : 0.7,
      rotation: rng() * 6,
    });
  if (["forest", "sakura", "mushroom"].includes(theme.theme))
    placements.push({
      id: "butterfly",
      x: -7,
      z: 3.6,
      height: 0.5,
      footprint: 0.6,
      floating: true,
    });
  if (theme.theme === "volcano")
    placements.push({
      id: "phoenix",
      x: 0,
      z: -9,
      height: 1.8,
      footprint: 3.2,
      floating: true,
    });
  if (theme.theme === "ocean")
    placements.push({
      id: "whale",
      x: 17,
      z: 0,
      height: 1.5,
      footprint: 5,
      floating: true,
    });
  if (theme.theme === "dragon")
    placements.push({
      id: "dragon",
      x: -2,
      z: -11.5,
      height: 3,
      footprint: 5,
      floating: true,
    });
  const tasks = placements.map(async (p) => {
    try {
      const gltf = await loadModel(`/models/environment/${p.id}.glb`);
      if (disposed) return;
      const source = clone(gltf.scene);
      source.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.castShadow = ![
            "flowers",
            "fern",
            "light-plant",
            "butterfly",
          ].includes(p.id);
          o.receiveShadow = true;
        }
      });
      const model = normalize(source, p.height, p.footprint);
      model.position.set(p.x, groundHeight(p.z) + (p.floating ? 2 : 0), p.z);
      model.rotation.y = p.rotation || 0;
      model.userData.environmentId = p.id;
      group.add(model);
      loaded.push(model);
      if (gltf.animations.length) {
        const mixer = new THREE.AnimationMixer(source);
        mixer.clipAction(gltf.animations[0]).play();
        mixers.push(mixer);
      }
      if (p.floating) {
        const y = model.position.y;
        updates.push((t) => {
          if (p.id === "whale") {
            const a = t * 0.065;
            model.position.set(
              Math.cos(a) * 18,
              -1 + Math.sin(t * 0.3),
              Math.sin(a) * 18,
            );
            model.rotation.y = -a - Math.PI / 2;
          } else if (p.id === "phoenix") {
            const a = t * 0.13;
            model.position.set(
              Math.cos(a) * 6,
              7 + Math.sin(t * 0.9) * 0.4,
              -9 + Math.sin(a) * 3,
            );
            model.rotation.y = -a;
          } else {
            model.position.x = p.x + Math.sin(t * 0.5) * 0.3;
            model.position.y = y + Math.sin(t * 1.2) * 0.25;
            model.rotation.y = (p.rotation || 0) + Math.sin(t * 0.3) * 0.3;
          }
        });
      }
      if (["flowers", "fern", "light-plant", "purple-tree"].includes(p.id)) {
        const base = model.rotation.z;
        updates.push((t) => {
          model.rotation.z = base + Math.sin(t * 0.8 + p.x) * 0.018;
        });
      }
      if (p.id === "pet") {
        updates.push((t) => {
          model.rotation.y = Math.sin(t * 0.4) * 0.25;
          model.position.y =
            groundHeight(p.z) + Math.max(0, Math.sin(t * 0.8)) * 0.08;
        });
      }
    } catch (error) {
      console.warn(
        `Environment asset ${p.id} unavailable; the procedural world remains playable.`,
        error,
      );
    }
  });
  return {
    group,
    ready: Promise.all(tasks).then(() => {}),
    update(t, dt) {
      mixers.forEach((m) => m.update(dt));
      updates.forEach((f) => f(t));
    },
    setQuality(q) {
      for (const object of loaded) {
        const id = object.userData.environmentId;
        object.visible =
          q !== "low" ||
          !["flowers", "fern", "mushrooms", "butterfly"].includes(id);
      }
    },
    dispose() {
      disposed = true;
      mixers.forEach((m) => {
        m.stopAllAction();
        m.uncacheRoot(m.getRoot());
      });
      group.removeFromParent();
    },
  };
}
