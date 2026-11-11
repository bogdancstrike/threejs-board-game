import * as THREE from "three";
/**
 * Lightweight skeleton for the supplied static figurines. It finds each arm
 * (T-pose, A-pose or hanging), adds shoulder/elbow/wrist joints along it and
 * skins the existing meshes, so the shared pose system can relax and animate
 * them. Production-authored weights remain preferable.
 */
interface ArmLine {
  shoulder: THREE.Vector3;
  hand: THREE.Vector3;
  extended: boolean;
}
const BONES = [
  "Root",
  "Pelvis",
  "Spine",
  "Head",
  "L_Thigh",
  "L_Calf",
  "L_Foot",
  "R_Thigh",
  "R_Calf",
  "R_Foot",
  "L_UpperArm",
  "L_Forearm",
  "L_Hand",
  "R_UpperArm",
  "R_Forearm",
  "R_Hand",
] as const;
const index = (name: (typeof BONES)[number]) => BONES.indexOf(name);
/** Locate an arm from the vertex cloud of a model normalised to 1.5 units. */
export function detectArm(points: Float32Array, side: -1 | 1): ArmLine {
  let tipX = 0,
    tip = new THREE.Vector3(side * 0.24, 0.66, 0),
    shoulderSum = 0,
    shoulderCount = 0;
  for (let i = 0; i < points.length; i += 3) {
    const x = points[i] * side,
      y = points[i + 1];
    if (y < 0.55 || y > 1.38 || x < 0.2) continue;
    if (x > tipX) {
      tipX = x;
      tip = new THREE.Vector3(points[i], y, points[i + 2]);
    }
    if (x < 0.3 && y > 1.0) {
      shoulderSum += y;
      shoulderCount++;
    }
  }
  const extended = tipX > 0.42;
  const shoulderY = extended
    ? THREE.MathUtils.clamp(
        shoulderCount ? shoulderSum / shoulderCount : 1.18,
        1.02,
        1.3,
      )
    : 1.18;
  const shoulder = new THREE.Vector3(side * 0.15, shoulderY, 0);
  return {
    shoulder,
    hand: extended ? tip : new THREE.Vector3(side * 0.24, 0.68, 0.02),
    extended,
  };
}
export function rigStaticModel(
  source: THREE.Object3D,
  height = 1.5,
): THREE.Group {
  source.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(source),
    size = bounds.getSize(new THREE.Vector3()),
    center = bounds.getCenter(new THREE.Vector3());
  const scale = height / size.y;
  const transform = new THREE.Matrix4()
    .makeScale(scale, scale, scale)
    .multiply(
      new THREE.Matrix4().makeTranslation(-center.x, -bounds.min.y, -center.z),
    );
  // Bake every mesh into normalised float geometry first.
  const baked: { node: THREE.Mesh; geometry: THREE.BufferGeometry }[] = [];
  source.traverse((node) => {
    if (!(node instanceof THREE.Mesh)) return;
    const geometry = node.geometry.clone();
    // Meshopt may expose normalized integer positions. Bake world transforms
    // into floats, so vertices above one unit are not clamped during conversion.
    const original = geometry.getAttribute("position"),
      positions = new Float32Array(original.count * 3);
    for (let i = 0; i < original.count; i++) {
      positions[i * 3] = original.getX(i);
      positions[i * 3 + 1] = original.getY(i);
      positions[i * 3 + 2] = original.getZ(i);
    }
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    geometry.applyMatrix4(transform.clone().multiply(node.matrixWorld));
    baked.push({ node, geometry });
  });
  const all = new Float32Array(
    baked.reduce(
      (n, b) => n + b.geometry.getAttribute("position").count * 3,
      0,
    ),
  );
  let offset = 0;
  for (const { geometry } of baked) {
    const array = geometry.getAttribute("position").array as Float32Array;
    all.set(array, offset);
    offset += array.length;
  }
  const arms = { [-1]: detectArm(all, -1), [1]: detectArm(all, 1) } as Record<
    number,
    ArmLine
  >;
  // Skeleton.
  const group = new THREE.Group();
  const world: THREE.Vector3[] = [];
  const bones: THREE.Bone[] = [];
  const make = (
    name: (typeof BONES)[number],
    position: THREE.Vector3,
    parent?: THREE.Bone,
  ) => {
    const bone = new THREE.Bone();
    bone.name = name;
    const parentPosition = parent
      ? world[bones.indexOf(parent)]
      : new THREE.Vector3();
    bone.position.copy(position).sub(parentPosition);
    parent?.add(bone);
    bones.push(bone);
    world.push(position.clone());
    return bone;
  };
  const root = make("Root", new THREE.Vector3());
  const pelvis = make("Pelvis", new THREE.Vector3(0, 0.78, 0), root),
    spine = make("Spine", new THREE.Vector3(0, 1.0, 0), pelvis);
  make("Head", new THREE.Vector3(0, 1.26, 0), spine);
  for (const side of [-1, 1]) {
    const x = side * 0.1,
      prefix = side < 0 ? "L" : "R";
    const thigh = make(
      `${prefix}_Thigh`,
      new THREE.Vector3(x, 0.74, 0),
      pelvis,
    );
    const calf = make(`${prefix}_Calf`, new THREE.Vector3(x, 0.42, 0), thigh);
    make(`${prefix}_Foot`, new THREE.Vector3(x, 0.08, 0), calf);
  }
  for (const side of [-1, 1]) {
    const prefix = side < 0 ? "L" : "R",
      arm = arms[side],
      along = (t: number) => arm.shoulder.clone().lerp(arm.hand, t);
    const upper = make(`${prefix}_UpperArm`, arm.shoulder.clone(), spine);
    const fore = make(`${prefix}_Forearm`, along(0.46), upper);
    make(`${prefix}_Hand`, along(0.8), fore);
  }
  group.add(root);
  group.updateMatrixWorld(true);
  const skeleton = new THREE.Skeleton(bones);
  const point = new THREE.Vector3(),
    closest = new THREE.Vector3();
  const assignArm = (p: THREE.Vector3): [number, number, number] | null => {
    const side = p.x < 0 ? -1 : 1,
      arm = arms[side],
      prefix = side < 0 ? "L" : "R";
    if (
      p.x * side < (arm.extended ? 0.13 : 0.16) ||
      p.y < (arm.extended ? 0.5 : 0.86)
    )
      return null;
    const axis = arm.hand.clone().sub(arm.shoulder),
      length = axis.length();
    axis.divideScalar(length);
    const t = THREE.MathUtils.clamp(
      point.copy(p).sub(arm.shoulder).dot(axis) / length,
      -0.1,
      1.1,
    );
    closest.copy(arm.shoulder).addScaledVector(axis, t * length);
    const radius = arm.extended ? 0.11 : 0.058;
    if (t < -0.05 || closest.distanceTo(p) > radius) return null;
    const upper = index(`${prefix}_UpperArm`),
      fore = index(`${prefix}_Forearm`),
      hand = index(`${prefix}_Hand`),
      spineIndex = index("Spine");
    const smooth = (a: number, b: number) =>
      THREE.MathUtils.clamp((t - a) / (b - a), 0, 1);
    if (t < 0.12) return [spineIndex, upper, smooth(0, 0.12)];
    if (t < 0.4) return [upper, fore, 0];
    if (t < 0.52) return [upper, fore, smooth(0.4, 0.52)];
    if (t < 0.76) return [fore, hand, 0];
    if (t < 0.86) return [fore, hand, smooth(0.76, 0.86)];
    return [hand, fore, 0];
  };
  for (const { node, geometry } of baked) {
    const pos = geometry.getAttribute("position");
    const skinIndices = new Uint16Array(pos.count * 4),
      weights = new Float32Array(pos.count * 4);
    for (let i = 0; i < pos.count; i++) {
      const p = new THREE.Vector3().fromBufferAttribute(pos, i);
      const x = p.x,
        y = p.y;
      let a = index("Spine"),
        b = index("Pelvis"),
        w = 0;
      const arm = assignArm(p);
      const leg = x < 0 ? index("L_Thigh") : index("R_Thigh");
      if (arm) [a, b, w] = arm;
      else if (y < 0.72 && Math.abs(x) < 0.47) {
        if (y < 0.16) {
          a = leg + 2;
          b = leg + 1;
          w = Math.max(0, Math.min(1, y / 0.16));
        } else if (y < 0.43) {
          a = leg + 1;
          b = leg;
          w = Math.max(0, Math.min(1, (y - 0.28) / 0.2));
        } else {
          a = leg;
          b = index("Pelvis");
          w = Math.max(0, Math.min(1, (y - 0.58) / 0.14));
        }
      } else if (y > 1.22) {
        a = index("Head");
        b = index("Spine");
        w = Math.max(0, Math.min(1, (1.32 - y) / 0.1));
      } else {
        a = index("Spine");
        b = index("Pelvis");
        w = Math.max(0, Math.min(1, (1.0 - y) / 0.24));
      }
      skinIndices[i * 4] = a;
      skinIndices[i * 4 + 1] = b;
      weights[i * 4] = 1 - w;
      weights[i * 4 + 1] = w;
    }
    geometry.setAttribute(
      "skinIndex",
      new THREE.Uint16BufferAttribute(skinIndices, 4),
    );
    geometry.setAttribute(
      "skinWeight",
      new THREE.Float32BufferAttribute(weights, 4),
    );
    const mesh = new THREE.SkinnedMesh(geometry, node.material);
    mesh.name = node.name;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    mesh.bind(skeleton, new THREE.Matrix4());
    mesh.frustumCulled = false;
  }
  group.userData.generatedRig = true;
  group.userData.arms = arms;
  return group;
}
