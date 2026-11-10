import * as THREE from "three";
/** Lightweight animation rig for the supplied static figurines. It deforms their
 * existing meshes; production-authored weights and clips remain preferable. */
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
  const group = new THREE.Group();
  const root = new THREE.Bone();
  root.name = "animation_root";
  const make = (
    name: string,
    x: number,
    y: number,
    z: number,
    parent: THREE.Bone,
  ) => {
    const bone = new THREE.Bone();
    bone.name = name;
    bone.position.set(x, y, z);
    parent.add(bone);
    return bone;
  };
  const pelvis = make("pelvis", 0, 0.78, 0, root),
    spine = make("spine", 0, 0.28, 0, pelvis),
    head = make("head", 0, 0.26, 0, spine);
  const left = make("left_upleg", -0.12, -0.04, 0, pelvis),
    lk = make("left_lowerleg", 0, -0.34, 0, left),
    lf = make("left_foot", 0, -0.3, 0, lk);
  const right = make("right_upleg", 0.12, -0.04, 0, pelvis),
    rk = make("right_lowerleg", 0, -0.34, 0, right),
    rf = make("right_foot", 0, -0.3, 0, rk);
  const la = make("left_upperarm", -0.23, 0.1, 0, spine),
    ra = make("right_upperarm", 0.23, 0.1, 0, spine);
  const bones = [
    root,
    pelvis,
    spine,
    head,
    left,
    lk,
    lf,
    right,
    rk,
    rf,
    la,
    ra,
  ];
  group.add(root);
  group.updateMatrixWorld(true);
  const skeleton = new THREE.Skeleton(bones);
  const point = new THREE.Vector3();
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
    const pos = geometry.getAttribute("position");
    const skinIndices = new Uint16Array(pos.count * 4),
      weights = new Float32Array(pos.count * 4);
    for (let i = 0; i < pos.count; i++) {
      point.fromBufferAttribute(pos, i);
      const x = point.x,
        y = point.y;
      let a = 1,
        b = 2,
        w = 0;
      const leg = x < 0 ? 4 : 7;
      if (y < 0.72 && Math.abs(x) < 0.47) {
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
          b = 1;
          w = Math.max(0, Math.min(1, (y - 0.58) / 0.14));
        }
      } else if (y > 1.23) {
        a = 3;
        b = 2;
        w = Math.max(0, Math.min(1, (1.34 - y) / 0.11));
      } else if (Math.abs(x) > 0.24 && y > 0.68 && y < 1.2) {
        a = x < 0 ? 10 : 11;
        b = 2;
        w = Math.max(0, 1 - (Math.abs(x) - 0.24) / 0.14);
      } else {
        a = 2;
        b = 1;
        w = Math.max(0, Math.min(1, (1.02 - y) / 0.26));
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
  });
  group.userData.generatedRig = true;
  return group;
}
