import * as THREE from "three";
import {updateCharacterEffects} from "./character-effects";
export type Action = "idle" | "walk" | "run" | "rest" | "magic" | "celebrate";
export function setAction(root: THREE.Object3D, action: Action) {
  root.userData.action = action;
  root.userData.actionStart = performance.now() / 1000;
}
export function animateCharacter(root: THREE.Object3D, t: number, dt: number) {
  const action: Action = root.userData.action || "idle",
    body = root.userData.body as THREE.Object3D | undefined;
  if (!body) return;
  updateCharacterEffects(root,t,action);
  const phase = root.userData.phase || 0;
  const speed = action === "run" ? 13 : 7;
  const moving = action === "walk" || action === "run";
  const rest = action === "rest";
  const cycle = t * speed + phase;
  const initial = body.userData.initialY ?? body.position.y;
  body.userData.initialY = initial;
  body.position.y =
    initial +
    (moving
      ? Math.abs(Math.sin(cycle)) * 0.055
      : action === "celebrate"
        ? Math.abs(Math.sin(t * 7)) * 0.16
        : Math.sin(t * 1.6 + phase) * 0.008) -
    (rest ? 0.09 : 0);
  body.rotation.z = moving
    ? Math.sin(cycle) * 0.035
    : Math.sin(t * 0.75 + phase) * 0.012;
  body.rotation.x = action === "run" ? 0.1 : rest ? -0.07 : 0;
  if (root.userData.mixer) root.userData.mixer.update(dt);
  const limbs = root.userData.limbs as
    | {
        node: THREE.Object3D;
        side: number;
        kind: string;
        rotation: THREE.Euler;
      }[]
    | undefined;
  limbs?.forEach(({ node, side, kind, rotation }) => {
    node.rotation.copy(rotation);
    if (moving) {
      const swing =
        Math.sin(cycle + side * Math.PI) * (action === "run" ? 0.7 : 0.4);
      if (kind === "leg") node.rotation.x += swing;
      if (kind === "knee") node.rotation.x += Math.max(0, -swing) * 0.65;
      if (kind === "arm") node.rotation.x -= swing * 0.65;
    } else if (action === "magic" || action === "celebrate") {
      if (kind === "arm") node.rotation.z += side === 0 ? -0.8 : 0.8;
    } else if (rest) {
      if (kind === "leg") node.rotation.x += 0.35;
      if (kind === "knee") node.rotation.x -= 0.5;
      if (kind === "arm") node.rotation.x -= 0.4;
    } else if (kind === "arm") {
      node.rotation.z += Math.sin(t * 1.3 + side) * 0.04;
    }
  });
  if (action === "magic") {
    body.rotation.y = Math.sin(t * 2) * 0.12;
  } else body.rotation.y = 0;
}
export function registerRig(root: THREE.Object3D, model: THREE.Object3D) {
  const limbs: {
    node: THREE.Object3D;
    side: number;
    kind: string;
    rotation: THREE.Euler;
  }[] = [];
  model.traverse((node) => {
    if (!(node instanceof THREE.Bone)) return;
    const name = node.name.toLowerCase();
    const side = /(?:^|_)l(?:_|$)|left/.test(name) ? 0 : 1;
    let kind = "";
    if (/thigh|upleg/.test(name) && !/twist|lift|helper/.test(name))
      kind = "leg";
    else if (/calf|lowerleg/.test(name) && !/twist|lift|helper/.test(name))
      kind = "knee";
    else if (/upperarm|up_arm/.test(name) && !/twist|helper/.test(name))
      kind = "arm";
    if (kind) limbs.push({ node, side, kind, rotation: node.rotation.clone() });
  });
  root.userData.limbs = limbs;
}
