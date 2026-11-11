import * as THREE from "three";
import { getTiles } from "../game/data";
import { SKY_ROUTES, skyOffset } from "../game/layers";
import type { MapTheme } from "../game/maps";
import { box, cyl, cone, sphere, material, crystal } from "./assets";
import { shapeField } from "./shapes";
import { groundHeight } from "../game/data";
/** Billowing puffs along every cloud-island rim (one instanced draw call). */
function cloudRims(id: string) {
  const spots: THREE.Vector3[] = [];
  for (let x = -26; x <= 26; x += 1.1)
    for (let z = -27; z <= 27; z += 1.1) {
      const f = shapeField(id, x, z);
      if (f > -0.2 && f < 0.9 && (Math.round(x * 7 + z * 3) & 1) === 0)
        spots.push(new THREE.Vector3(x, groundHeight(z, id) - 0.25, z));
    }
  const mesh = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(1, 2),
    new THREE.MeshStandardMaterial({ color: "#f6f9fd", roughness: 0.95 }),
    spots.length,
  );
  const m = new THREE.Matrix4(),
    q = new THREE.Quaternion(),
    scale = new THREE.Vector3();
  spots.forEach((p, i) => {
    const r = 0.7 + ((i * 37) % 10) / 14;
    scale.set(r, r * 0.6, r);
    m.compose(p, q, scale);
    mesh.setMatrixAt(i, m);
  });
  mesh.receiveShadow = true;
  return mesh;
}
/** An actual suspended board section: stairs climb to supported sky platforms,
 * bridges connect them, and a separate descent returns to the main island. */
export function skyways(theme: MapTheme) {
  const group = new THREE.Group(),
    animated: ((t: number) => void)[] = [],
    tiles = getTiles(theme.id),
    layers = SKY_ROUTES[theme.id] || [];
  if (theme.id === "clouds") group.add(cloudRims(theme.id));
  for (const layer of layers) {
    for (let id = layer.start + 1; id < layer.end; id++) {
      const t = tiles[id],
        offset = skyOffset(theme.id, id);
      if (theme.id === "clouds") {
        // Each raised step rests on its own little cloud.
        for (let k = 0; k < 4; k++) {
          const puff = sphere(
            group,
            "#f4f8fc",
            t.x + Math.cos(id * 1.7 + k * 1.6) * 0.45,
            t.y - 0.32 - (k % 2) * 0.18,
            t.z + Math.sin(id * 1.7 + k * 1.6) * 0.45,
            0.95 - k * 0.12,
            0.55,
            0.95 - k * 0.12,
          );
          const base = puff.position.y;
          animated.push(
            (time) =>
              (puff.position.y = base + Math.sin(time * 0.7 + id + k) * 0.05),
          );
        }
      } else {
        cyl(group, "#889fa6", t.x, t.y - 0.16, t.z, 0.82, 0.3);
        cone(group, theme.rock, t.x, t.y - 0.65, t.z, 0.78, 1.05).rotation.z =
          Math.PI;
      }
      cyl(group, theme.terrain[t.region], t.x, t.y - 0.005, t.z, 0.84, 0.08);
      if (id % 4 === 0) {
        const c = crystal(theme.accent, 0.3);
        c.position.set(t.x + 0.55, t.y + 0.02, t.z - 0.45);
        group.add(c);
      }
      if (offset > layer.height * 0.8 && id % 6 === 0) {
        const cloud = sphere(
          group,
          "#acbfc8",
          t.x,
          t.y - 0.75,
          t.z,
          1.4,
          0.25,
          1.1,
        );
        (cloud.material as THREE.MeshStandardMaterial).transparent = true;
        const cm = (cloud.material as THREE.MeshStandardMaterial).clone();
        cm.opacity = 0.28;
        cm.depthWrite = false;
        cloud.material = cm;
        animated.push(
          (time) => (cloud.position.x = t.x + Math.sin(time * 0.3 + id) * 0.2),
        );
      }
    }
    for (let id = layer.start + 1; id <= layer.end; id++) {
      const a = tiles[id - 1],
        b = tiles[id],
        dx = b.x - a.x,
        dz = b.z - a.z,
        length = Math.hypot(dx, dz),
        angle = Math.atan2(dx, dz),
        dy = b.y - a.y;
      const deck = box(
        group,
        "#aa9972",
        (a.x + b.x) / 2,
        (a.y + b.y) / 2 - 0.055,
        (a.z + b.z) / 2,
        1.12,
        0.15,
        length + 0.12,
      );
      deck.rotation.y = angle;
      deck.rotation.x = -Math.atan2(dy, length);
      for (const side of [-1, 1]) {
        const sx = Math.cos(angle) * 0.65 * side,
          sz = -Math.sin(angle) * 0.65 * side;
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(a.x + sx, a.y + 0.48, a.z + sz),
          new THREE.Vector3(
            (a.x + b.x) / 2 + sx,
            (a.y + b.y) / 2 + 0.25,
            (a.z + b.z) / 2 + sz,
          ),
          new THREE.Vector3(b.x + sx, b.y + 0.48, b.z + sz),
        ]);
        const rope = new THREE.Mesh(
          new THREE.TubeGeometry(curve, 8, 0.024, 4, false),
          material("#c0ae84"),
        );
        group.add(rope);
        cyl(group, "#b29c70", b.x + sx, b.y + 0.2, b.z + sz, 0.032, 0.6);
      }
      if (Math.abs(dy) > 0.2) {
        const n = Math.ceil(Math.abs(dy) / 0.14);
        for (let j = 0; j < n; j++) {
          const u = (j + 0.5) / n,
            step = box(
              group,
              "#b8a47d",
              a.x + dx * u,
              a.y + dy * u + 0.02,
              a.z + dz * u,
              1.1,
              0.12,
              length / n + 0.05,
            );
          step.rotation.y = angle;
        }
      }
    }
    // Spacious cloud landing with a small arcane shrine at the top of the climb.
    const landing = tiles[Math.min(layer.upEnd + 3, layer.downStart)];
    cyl(group, "#91aaa7", landing.x, landing.y - 0.35, landing.z, 1.55, 0.5);
    if (theme.id === "clouds")
      sphere(
        group,
        "#f7fbff",
        landing.x,
        landing.y - 0.9,
        landing.z,
        3.4,
        1.4,
        3,
      );
    else
      cone(
        group,
        theme.rock,
        landing.x,
        landing.y - 1.3,
        landing.z,
        1.4,
        1.7,
      ).rotation.z = Math.PI;
  }
  return { group, animated };
}
