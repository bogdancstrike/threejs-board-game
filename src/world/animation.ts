import * as THREE from "three";
import { updateCharacterEffects } from "./character-effects";
export const ACTIONS = [
  "idle",
  "walk",
  "run",
  "rest",
  "magic",
  "celebrate",
  "wave",
  "dance",
  "think",
  "bow",
] as const;
export type Action = (typeof ACTIONS)[number];
export function setAction(root: THREE.Object3D, action: Action) {
  root.userData.action = action;
  root.userData.actionStart = performance.now() / 1000;
}
type Kind =
  | "spine"
  | "head"
  | "arm"
  | "forearm"
  | "hand"
  | "leg"
  | "knee"
  | "foot";
interface Limb {
  node: THREE.Object3D;
  kind: Kind;
  /** +1 or −1: which side of the body the limb is on (0 for the spine). */
  side: number;
  bind: THREE.Quaternion;
  /** Parent orientation at bind time, relative to the character root. */
  parent: THREE.Quaternion;
  parentInverse: THREE.Quaternion;
  /** Rest offset that relaxes T-posed arms (character space). */
  rest: THREE.Quaternion;
  /** Frame for children of a relaxed arm, so elbow bends follow the arm. */
  frame: THREE.Quaternion;
  frameInverse: THREE.Quaternion;
  current: THREE.Quaternion;
}
const PATTERN =
  /(?:^|[\s_:|.])(?:(l|r|left|right)[\s_]*)?(thigh|upleg|upperleg|calf|lowerleg|shin|foot|upperarm|uparm|forearm|lowerarm|hand|spine|neck|head)(?:[\s_]*\d+)*$/i;
const KIND: Record<string, Kind> = {
  thigh: "leg",
  upleg: "leg",
  upperleg: "leg",
  calf: "knee",
  lowerleg: "knee",
  shin: "knee",
  foot: "foot",
  upperarm: "arm",
  uparm: "arm",
  forearm: "forearm",
  lowerarm: "forearm",
  hand: "hand",
  spine: "spine",
  neck: "head",
  head: "head",
};
const X = new THREE.Vector3(1, 0, 0),
  Y = new THREE.Vector3(0, 1, 0),
  Z = new THREE.Vector3(0, 0, 1);
const qa = new THREE.Quaternion(),
  qb = new THREE.Quaternion(),
  qc = new THREE.Quaternion();
const rot = (
  axis: THREE.Vector3,
  angle: number,
  out = new THREE.Quaternion(),
) => out.setFromAxisAngle(axis, angle);
/** A limb for hand-built prototype figures: no parent rotation, no rest offset. */
export function simpleLimb(
  node: THREE.Object3D,
  kind: Kind,
  side: number,
): Limb {
  return {
    node,
    kind,
    side,
    bind: node.quaternion.clone(),
    parent: new THREE.Quaternion(),
    parentInverse: new THREE.Quaternion(),
    rest: new THREE.Quaternion(),
    frame: new THREE.Quaternion(),
    frameInverse: new THREE.Quaternion(),
    current: new THREE.Quaternion(),
  };
}
/**
 * Discover limbs by bone name, record the bind pose in character space and
 * relax arms that were modelled in a T- or A-pose.
 */
export function registerRig(
  root: THREE.Object3D,
  model: THREE.Object3D,
  options: { lockArms?: boolean } = {},
) {
  root.updateMatrixWorld(true);
  const rootInverse = root.getWorldQuaternion(new THREE.Quaternion()).invert();
  const rootMatrixInverse = root.matrixWorld.clone().invert();
  const found = new Map<string, THREE.Object3D>();
  model.traverse((node) => {
    if (!(node instanceof THREE.Bone)) return;
    const name = node.name.replace(/\.\d+$/, "");
    if (/twist|lift|helper|armor|nub|socket|guard|collar|auto/i.test(name))
      return;
    const match = PATTERN.exec(name);
    if (!match) return;
    const kind = KIND[match[2].toLowerCase()];
    const position = node
      .getWorldPosition(new THREE.Vector3())
      .applyMatrix4(rootMatrixInverse);
    const side =
      kind === "spine" || kind === "head" ? 0 : position.x < 0 ? -1 : 1;
    const key = `${kind}:${side}`;
    if (!found.has(key)) found.set(key, node);
  });
  const limbs: Limb[] = [];
  const positionOf = (node: THREE.Object3D) =>
    node.getWorldPosition(new THREE.Vector3()).applyMatrix4(rootMatrixInverse);
  for (const [key, node] of found) {
    const [kind, sideText] = key.split(":") as [Kind, string];
    const side = Number(sideText);
    const parent = node.parent
      ? rootInverse
          .clone()
          .multiply(node.parent.getWorldQuaternion(new THREE.Quaternion()))
      : new THREE.Quaternion();
    limbs.push({
      node,
      kind,
      side,
      bind: node.quaternion.clone(),
      parent,
      parentInverse: parent.clone().invert(),
      rest: new THREE.Quaternion(),
      frame: new THREE.Quaternion(),
      frameInverse: new THREE.Quaternion(),
      current: new THREE.Quaternion(),
    });
  }
  // Relax arms: rotate each upper arm so it hangs slightly away from the body.
  for (const side of [-1, 1]) {
    const arm = found.get(`arm:${side}`),
      fore = found.get(`forearm:${side}`);
    if (!arm || !fore || options.lockArms) continue;
    const direction = positionOf(fore).sub(positionOf(arm)).normalize();
    if (direction.y < -0.86) continue;
    const target = new THREE.Vector3(side * 0.2, -1, 0.05).normalize();
    const rest = new THREE.Quaternion().setFromUnitVectors(direction, target);
    for (const limb of limbs)
      if (limb.side === side && limb.kind === "arm") limb.rest.copy(rest);
      else if (
        limb.side === side &&
        (limb.kind === "forearm" || limb.kind === "hand")
      ) {
        limb.frame.copy(rest);
        limb.frameInverse.copy(rest).invert();
      }
  }
  root.userData.limbs = limbs;
  root.userData.armsLocked = Boolean(options.lockArms);
}
/** Character-space target rotation for one limb in the current action. */
function pose(
  limb: Limb,
  action: Action,
  t: number,
  phase: number,
  age: number,
  out: THREE.Quaternion,
) {
  out.identity();
  const { kind, side } = limb;
  const s = side || 1;
  const walk = action === "walk",
    run = action === "run";
  const speed = run ? 11 : 6.6,
    cycle = t * speed + phase + (side < 0 ? Math.PI : 0),
    swing = Math.sin(cycle);
  const breathe = Math.sin(t * 1.7 + phase);
  // Helpers: positive "forward" swings a hanging limb toward +Z.
  const forward = (a: number) => rot(X, -a, qa);
  const outward = (a: number) => rot(Z, s * a, qb);
  const mul = (q: THREE.Quaternion) => out.premultiply(q);
  if (walk || run) {
    const amp = run ? 0.85 : 0.42;
    if (kind === "leg") mul(forward(swing * amp + (run ? 0.12 : 0)));
    if (kind === "knee")
      mul(
        rot(X, Math.max(0, -Math.cos(cycle)) * (run ? 1.5 : 0.75) + 0.08, qa),
      );
    if (kind === "foot") mul(rot(X, -Math.max(0, swing) * 0.25, qa));
    if (kind === "arm")
      mul(forward(-swing * (run ? 0.9 : 0.42))).premultiply(outward(0.08));
    if (kind === "forearm")
      mul(forward((run ? 1.35 : 0.28) + Math.max(0, -swing) * 0.3));
    if (kind === "spine")
      mul(
        rot(Y, Math.sin(t * speed + phase) * (run ? 0.12 : 0.07), qa),
      ).premultiply(rot(X, run ? 0.2 : 0.04, qb));
    if (kind === "head") mul(rot(X, run ? -0.12 : 0, qa));
    return out;
  }
  switch (action) {
    case "magic": {
      const pulse = Math.sin(t * 3 + phase) * 0.1;
      if (kind === "arm") mul(forward(1.15 + pulse)).premultiply(outward(0.35));
      if (kind === "forearm") mul(forward(0.35));
      if (kind === "hand") mul(rot(X, 0.5, qa));
      if (kind === "spine") mul(rot(X, -0.08, qa));
      if (kind === "head") mul(rot(X, -0.1, qa));
      break;
    }
    case "celebrate": {
      const pump = Math.sin(t * 9) * 0.25;
      if (kind === "arm") mul(outward(2.55 + pump));
      if (kind === "forearm") mul(forward(0.25));
      if (kind === "spine") mul(rot(X, -0.12, qa));
      if (kind === "head") mul(rot(X, -0.2, qa));
      if (kind === "leg") mul(forward(Math.max(0, Math.sin(t * 9)) * 0.25));
      if (kind === "knee") mul(rot(X, Math.max(0, Math.sin(t * 9)) * 0.45, qa));
      break;
    }
    case "wave": {
      // The right-hand side waves; the other arm rests on the hip.
      const waving = s > 0;
      if (kind === "arm")
        mul(waving ? outward(2.1) : outward(0.35)).premultiply(
          waving ? forward(0.25) : forward(-0.15),
        );
      if (kind === "forearm")
        mul(
          waving
            ? rot(Z, s * (0.95 + Math.sin(t * 9) * 0.4), qa)
            : forward(1.2),
        );
      if (kind === "head") mul(rot(Z, -0.12, qa)).premultiply(rot(Y, 0.15, qb));
      if (kind === "spine") mul(rot(Z, -0.05, qa));
      break;
    }
    case "dance": {
      const beat = t * 6.2 + phase,
        bounce = Math.sin(beat * 2);
      if (kind === "arm")
        mul(
          forward(0.8 + Math.sin(beat + (s > 0 ? 0 : Math.PI)) * 0.7),
        ).premultiply(outward(0.5 + Math.cos(beat) * 0.25));
      if (kind === "forearm") mul(forward(1.2 + Math.sin(beat) * 0.3));
      if (kind === "spine")
        mul(rot(Y, Math.sin(beat) * 0.28, qa)).premultiply(
          rot(Z, Math.sin(beat) * 0.1, qb),
        );
      if (kind === "head") mul(rot(Z, Math.sin(beat + 1) * 0.15, qa));
      if (kind === "leg")
        mul(forward(Math.max(0, bounce * (s > 0 ? 1 : -1)) * 0.35));
      if (kind === "knee") mul(rot(X, 0.25 + Math.max(0, bounce) * 0.3, qa));
      break;
    }
    case "think": {
      const thinking = s > 0;
      if (kind === "arm")
        mul(thinking ? forward(0.85) : forward(0.35)).premultiply(
          rot(Z, -s * (thinking ? 0.35 : 0.5), qb),
        );
      if (kind === "forearm") mul(forward(thinking ? 2.1 : 1.45));
      if (kind === "head")
        mul(rot(Z, 0.14, qa)).premultiply(
          rot(X, 0.08 + Math.sin(t * 0.9) * 0.04, qb),
        );
      if (kind === "spine") mul(rot(Y, 0.08, qa));
      break;
    }
    case "bow": {
      const depth = Math.sin(Math.min(Math.PI, ((age % 3.2) / 2) * Math.PI));
      if (kind === "spine") mul(rot(X, depth * 0.6, qa));
      if (kind === "head") mul(rot(X, depth * 0.25, qa));
      if (kind === "arm")
        mul(s > 0 ? forward(depth * 0.9) : forward(-0.1)).premultiply(
          rot(Z, -s * depth * 0.4, qb),
        );
      if (kind === "forearm") mul(forward(s > 0 ? 1.4 * depth : 0.2));
      break;
    }
    case "rest": {
      if (kind === "leg") mul(forward(0.95));
      if (kind === "knee") mul(rot(X, 1.7, qa));
      if (kind === "foot") mul(rot(X, -0.5, qa));
      if (kind === "arm") mul(forward(0.45)).premultiply(outward(0.12));
      if (kind === "forearm") mul(forward(0.8));
      if (kind === "spine") mul(rot(X, 0.12 + breathe * 0.02, qa));
      if (kind === "head") mul(rot(Y, Math.sin(t * 0.35 + phase) * 0.35, qa));
      break;
    }
    default: {
      // Idle: breathing, weight shifts, relaxed elbows and an occasional glance.
      const glance =
        Math.sin(t * 0.37 + phase) *
        0.3 *
        Math.max(0, Math.sin(t * 0.13 + phase));
      if (kind === "arm")
        mul(outward(0.06 + breathe * 0.02)).premultiply(
          forward(Math.sin(t * 0.8 + phase + s) * 0.04),
        );
      if (kind === "forearm") mul(forward(0.18 + breathe * 0.03));
      if (kind === "hand") mul(rot(X, 0.1, qa));
      if (kind === "spine")
        mul(rot(X, breathe * 0.015, qa)).premultiply(
          rot(Z, Math.sin(t * 0.5 + phase) * 0.02, qb),
        );
      if (kind === "head")
        mul(rot(Y, glance, qa)).premultiply(
          rot(X, Math.sin(t * 0.6) * 0.03, qb),
        );
      if (kind === "leg") mul(rot(Z, s * Math.sin(t * 0.5 + phase) * 0.02, qa));
    }
  }
  return out;
}
const target = new THREE.Quaternion(),
  world = new THREE.Quaternion();
export function animateCharacter(root: THREE.Object3D, t: number, dt: number) {
  const action: Action = root.userData.action || "idle",
    body = root.userData.body as THREE.Object3D | undefined;
  if (!body) return;
  updateCharacterEffects(root, t, action);
  const phase = root.userData.phase || 0;
  const age = performance.now() / 1000 - (root.userData.actionStart || 0);
  const moving = action === "walk" || action === "run";
  const speed = action === "run" ? 11 : 6.6;
  const cycle = t * speed + phase;
  const initial = body.userData.initialY ?? body.position.y;
  body.userData.initialY = initial;
  body.position.y =
    initial +
    (moving
      ? Math.abs(Math.sin(cycle)) * (action === "run" ? 0.07 : 0.035)
      : action === "celebrate"
        ? Math.max(0, Math.sin(t * 9)) * 0.12
        : action === "dance"
          ? Math.abs(Math.sin(t * 6.2 + phase)) * 0.05
          : Math.sin(t * 1.7 + phase) * 0.006) -
    (action === "rest" ? 0.22 : 0);
  body.rotation.z = moving
    ? Math.sin(cycle) * 0.025
    : action === "dance"
      ? Math.sin(t * 6.2 + phase) * 0.06
      : Math.sin(t * 0.5 + phase) * 0.01;
  body.rotation.x = action === "run" ? 0.06 : 0;
  body.rotation.y =
    action === "magic"
      ? Math.sin(t * 2) * 0.1
      : action === "dance"
        ? Math.sin(t * 3.1) * 0.25
        : 0;
  if (root.userData.mixer) root.userData.mixer.update(dt);
  const limbs = root.userData.limbs as Limb[] | undefined;
  if (!limbs?.length) return;
  const blend = 1 - Math.exp(-dt * 12);
  for (const limb of limbs) {
    pose(limb, action, t, phase, age, target);
    if (
      root.userData.armsLocked &&
      (limb.kind === "arm" || limb.kind === "forearm")
    )
      target.slerp(qc.identity(), 0.75);
    // Character-space delta: animated pose on top of the rest offset; children
    // of a relaxed arm express it in the arm's relaxed frame.
    world
      .copy(limb.frameInverse)
      .multiply(target)
      .multiply(limb.frame)
      .multiply(limb.rest);
    // Convert to the bone's local space using its bind-time parent orientation.
    target
      .copy(limb.parentInverse)
      .multiply(world)
      .multiply(limb.parent)
      .multiply(limb.bind);
    if (limb.current.lengthSq() === 0 || !limb.node.userData.posed) {
      limb.current.copy(target);
      limb.node.userData.posed = true;
    } else limb.current.slerp(target, blend);
    limb.node.quaternion.copy(limb.current);
  }
}
