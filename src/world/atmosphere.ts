import * as THREE from "three";
import { groundHeight, seededRandom, getTiles, TILE_INFO } from "../game/data";
import type { MapTheme } from "../game/maps";
export interface Atmosphere {
  group: THREE.Group;
  update: (t: number) => void;
  setQuality: (quality: string) => void;
  dispose: () => void;
}
export function atmosphere(theme: MapTheme): Atmosphere {
  const group = new THREE.Group(),
    rng = seededRandom(918),
    disposables: { dispose: () => void }[] = [],
    updates: ((t: number) => void)[] = [];
  const glowCanvas = document.createElement("canvas");
  glowCanvas.width = 64;
  glowCanvas.height = 64;
  const ctx = glowCanvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.2, "rgba(255,255,255,.65)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  const glow = new THREE.CanvasTexture(glowCanvas);
  disposables.push(glow);
  // Local low-lying mist follows the river and portal, leaving the route clear.
  const mistMat = new THREE.SpriteMaterial({
    map: glow,
    color: theme.theme === "volcano" ? "#d1a08e" : "#b4d2e2",
    transparent: true,
    opacity: 0.11,
    depthWrite: false,
  });
  disposables.push(mistMat);
  for (let i = 0; i < 9; i++) {
    const z = -11 + i * 3.1,
      x = -3.5 + Math.sin(z * 0.3) * 1.8;
    const sprite = new THREE.Sprite(mistMat);
    sprite.position.set(x, groundHeight(z) + 0.25, z);
    sprite.scale.set(3.2, 1, 1);
    group.add(sprite);
    updates.push(
      (t) => (sprite.position.x = x + Math.sin(t * 0.17 + i) * 0.45),
    );
  }
  // Sparse particles are theme-specific: petals, snow, sparks, spores or fireflies.
  const count = 180,
    positions = new Float32Array(count * 3),
    origins = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    origins[i * 3] = (rng() - 0.5) * 29;
    origins[i * 3 + 1] = rng() * 8 + 1;
    origins[i * 3 + 2] = (rng() - 0.5) * 32;
  }
  positions.set(origins);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const particleColor =
    theme.theme === "sakura"
      ? "#f4bed9"
      : theme.theme === "ice"
        ? "#e6f5ff"
        : theme.theme === "volcano"
          ? "#ffb079"
          : theme.theme === "mushroom"
            ? "#b8e1fc"
            : "#e9d5a0";
  const pm = new THREE.PointsMaterial({
    map: glow,
    color: particleColor,
    size: theme.theme === "ice" ? 0.13 : theme.theme === "sakura" ? 0.2 : 0.095,
    transparent: true,
    opacity: 0.75,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geo, pm);
  group.add(points);
  disposables.push(geo, pm);
  updates.push((t) => {
    const a = geo.getAttribute("position");
    for (let i = 0; i < count; i++) {
      const fall = theme.theme === "ice" || theme.theme === "sakura";
      a.setXYZ(
        i,
        origins[i * 3] + Math.sin(t * 0.3 + i) * 0.45,
        fall
          ? 1 +
              ((((origins[i * 3 + 1] -
                t * (theme.theme === "ice" ? 0.35 : 0.17)) %
                8) +
                8) %
                8)
          : origins[i * 3 + 1] + Math.sin(t * 0.5 + i) * 0.3,
        origins[i * 3 + 2] + Math.cos(t * 0.25 + i) * 0.25,
      );
    }
    a.needsUpdate = true;
    pm.opacity = 0.65 + Math.sin(t * 0.8) * 0.1;
  });
  // Runes sit just above special stones. All use emissive-looking additive rings.
  const ringGeo = new THREE.RingGeometry(0.49, 0.515, 32);
  ringGeo.rotateX(-Math.PI / 2);
  disposables.push(ringGeo);
  const runeMats = new Map<string, THREE.MeshBasicMaterial>();
  for (const tile of getTiles(theme.id)) {
    if (["path", "start"].includes(tile.kind)) continue;
    const color = TILE_INFO[tile.kind].color;
    let mat = runeMats.get(color);
    if (!mat) {
      mat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.3,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      });
      runeMats.set(color, mat);
      disposables.push(mat);
    }
    const ring = new THREE.Mesh(ringGeo, mat);
    ring.position.set(tile.x, tile.y + 0.105, tile.z);
    group.add(ring);
  }
  updates.push((t) => {
    let i = 0;
    for (const mat of runeMats.values())
      mat.opacity = 0.22 + Math.sin(t * 1.4 + i++ * 1.7) * 0.1;
  });
  // Lantern and shrine glows stay local rather than flooding the scene with lights.
  for (const [x, z] of [
    [-9.9, 9],
    [-6, 11.9],
    [10, 5.4],
    [-8, -5],
    [4, -12.1],
    [-6.9, 12.82],
  ]) {
    const sm = new THREE.SpriteMaterial({
      map: glow,
      color: "#ffbf70",
      transparent: true,
      opacity: 0.38,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    disposables.push(sm);
    const s = new THREE.Sprite(sm);
    s.position.set(x, groundHeight(z) + 0.95, z);
    s.scale.set(0.85, 0.85, 1);
    group.add(s);
    updates.push(
      (t) =>
        (sm.opacity =
          0.3 + Math.sin(t * 5.3 + x) * 0.06 + Math.sin(t * 9.1 + z) * 0.03),
    );
  }
  // Lightweight light shafts above the magical highland, visible only on Ultra.
  const shafts = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const m = new THREE.Mesh(
      new THREE.ConeGeometry(0.65, 5, 16, 1, true),
      new THREE.MeshBasicMaterial({
        color: theme.accent,
        transparent: true,
        opacity: 0.028,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      }),
    );
    m.position.set(-8.5 + (i - 1) * 0.4, 6, -5.75);
    m.rotation.z = 0.15 + (i - 1) * 0.08;
    shafts.add(m);
    disposables.push(m.geometry, m.material);
  }
  shafts.visible = false;
  group.add(shafts);
  // A large, unlit background sphere provides a true gradient within the renderer.
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      top: { value: new THREE.Color(theme.sky).multiplyScalar(0.55) },
      bottom: { value: new THREE.Color(theme.sky).multiplyScalar(1.7) },
    },
    vertexShader:
      "varying vec3 vDirection;void main(){vDirection=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader:
      "uniform vec3 top;uniform vec3 bottom;varying vec3 vDirection;void main(){float h=normalize(vDirection).y;gl_FragColor=vec4(mix(bottom,top,smoothstep(-.2,.8,h)),1.);#include <tonemapping_fragment>\n#include <colorspace_fragment>}",
  });
  skyMat.fragmentShader = skyMat.fragmentShader
    .replace(";#include", ";\n#include")
    .replace("fragment>}", "fragment>\n}");
  const sky = new THREE.Mesh(new THREE.SphereGeometry(95, 24, 16), skyMat);
  sky.frustumCulled = false;
  sky.userData.excludeAO = true;
  group.add(sky);
  disposables.push(sky.geometry, skyMat);
  return {
    group,
    update(t) {
      updates.forEach((f) => f(t));
    },
    setQuality(q) {
      geo.setDrawRange(0, q === "low" ? 40 : q === "ultra" ? 180 : 100);
      shafts.visible = q === "ultra";
      mistMat.opacity = q === "low" ? 0.05 : 0.11;
    },
    dispose() {
      disposables.forEach((d) => d.dispose());
      group.removeFromParent();
    },
  };
}
