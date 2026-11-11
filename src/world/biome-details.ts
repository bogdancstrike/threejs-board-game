import * as THREE from "three";
import type { MapTheme } from "../game/maps";
import { groundHeight } from "../game/data";
import { box, cyl, cone, sphere, blossom, crystal, material } from "./assets";
export function biomeDetails(theme: MapTheme) {
  const group = new THREE.Group(),
    animated: ((t: number) => void)[] = [],
    id = theme.id;
  group.position.set(-8.7, groundHeight(-14.4, id), -14.4);
  const stone = theme.terrain[3],
    gold = theme.accent;
  if (id === "stormreach") {
    cyl(group, "#737e92", 0, 1.7, 0, 0.45, 3.4);
    for (const x of [-0.55, 0.55]) {
      const rod = cone(group, "#c4cfdf", x, 3.8, 0, 0.1, 1.5, 0.1);
      rod.rotation.z = x < 0 ? -0.25 : 0.25;
    }
    const orb = sphere(group, "#d9eaff", 0, 4, 0, 0.24, 0.24, 0.24, 1.4);
    animated.push((t) => orb.scale.setScalar(0.22 + Math.sin(t * 3) * 0.03));
  }
  if (id === "autumn") {
    const tree = blossom(1.8);
    tree.traverse((o) => {
      if (
        o instanceof THREE.Mesh &&
        o.material instanceof THREE.MeshStandardMaterial &&
        ["d59ca6", "d9a7bd"].includes(o.material.color.getHexString())
      )
        o.material = material("#d69c55");
    });
    group.add(tree);
    for (let i = 0; i < 8; i++)
      sphere(
        group,
        "#b87a42",
        Math.cos(i) * 1.2,
        0.2,
        Math.sin(i) * 1.1,
        0.18,
        0.16,
        0.18,
      );
  }
  if (id === "jade") {
    const dragon = new THREE.Mesh(
      new THREE.TorusKnotGeometry(0.7, 0.16, 48, 7, 2, 3),
      material("#83c3a5", 0.1, 0.2),
    );
    dragon.position.y = 1.9;
    group.add(dragon);
    cyl(group, stone, 0, 0.35, 0, 1.3, 0.7);
    for (const x of [-1, 1]) cyl(group, gold, x, 1.4, 0, 0.12, 2.2);
  }
  if (id === "necropolis") {
    box(group, stone, 0, 0.8, 0, 2.6, 1.6, 1.8);
    cone(group, "#747487", 0, 1.9, 0, 2, 0.8);
    box(group, "#293240", 0, 0.6, 1, 0.6, 1.2, 0.05);
    for (const x of [-1.1, 1.1]) {
      box(group, "#adb4c1", x, 0.75, 1.7, 0.13, 1.5, 0.13);
      box(group, "#adb4c1", x, 1.1, 1.7, 0.7, 0.13, 0.13);
    }
    sphere(group, gold, 0, 2.7, 0, 0.13, 0.25, 0.13, 1);
  }
  if (id === "skyharbor") {
    const ship = new THREE.Group();
    sphere(ship, "#b7a77f", 0, 2.8, 0, 1.45, 0.7, 0.6);
    box(ship, "#846b4a", 0, 1.6, 0, 1.8, 0.3, 0.7);
    for (const x of [-0.55, 0.55])
      for (const z of [-0.3, 0.3]) {
        const rope = cyl(ship, "#b69b6b", x, 2.1, z, 0.025, 1);
        rope.rotation.z = x * 0.2;
      }
    const fin = cone(ship, theme.roof, -1.35, 2.8, 0, 0.4, 0.7);
    fin.rotation.z = Math.PI / 2;
    group.add(ship);
    animated.push((t) => (ship.position.y = Math.sin(t * 0.6) * 0.25));
  }
  if (id === "coral") {
    for (let i = 0; i < 7; i++) {
      const a = i * 0.9,
        h = 0.8 + (i % 3) * 0.45;
      const branch = cyl(
        group,
        ["#d68f9e", "#e7b39f", "#c6a0c6"][i % 3],
        Math.cos(a) * 0.9,
        h / 2,
        Math.sin(a) * 0.8,
        0.12,
        h,
      );
      branch.rotation.z = Math.sin(a) * 0.4;
      for (const d of [-1, 1]) {
        const b = cone(
          group,
          "#e4b6ca",
          Math.cos(a) * 0.9 + d * 0.16,
          h * 0.85,
          Math.sin(a) * 0.8,
          0.12,
          0.55,
        );
        b.rotation.z = d * 0.5;
      }
    }
  }
  if (id === "amber") {
    for (let level = 0; level < 3; level++)
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        cyl(
          group,
          i % 2 ? "#c9a658" : "#e0bd70",
          Math.cos(a) * (0.9 - level * 0.16),
          0.3 + level * 0.55,
          Math.sin(a) * (0.9 - level * 0.16),
          0.45,
          0.55,
        );
      }
    sphere(group, "#f2db90", 0, 2, 0, 0.32, 0.42, 0.32, 0.6);
  }
  if (id === "obsidian") {
    box(group, "#514951", 0, 0.5, 0, 1.7, 1, 1);
    box(group, "#82757d", 0, 1.2, 0, 2.6, 0.45, 1.2);
    const horn = cone(group, "#82757d", 1.65, 1.25, 0, 0.57, 1);
    horn.rotation.z = -Math.PI / 2;
    cyl(group, "#ffb16a", 0, 0.1, 0, 1.65, 0.05, 1.1);
  }
  if (id === "crystal") {
    const c = crystal("#b7e7ee", 2.2);
    group.add(c);
    for (let i = 0; i < 6; i++) {
      const c = crystal(["#d0b9eb", "#a7dfda", "#dce6c2"][i % 3], 0.65);
      c.position.set(Math.cos(i) * 1.4, 0, Math.sin(i) * 1.4);
      group.add(c);
    }
  }
  if (id === "jungle") {
    for (let i = 0; i < 5; i++)
      box(
        group,
        stone,
        0,
        0.2 + i * 0.36,
        0,
        3 - i * 0.45,
        0.36,
        2.8 - i * 0.4,
      );
    for (const x of [-0.55, 0.55]) cyl(group, "#8a9c78", x, 2.2, 0, 0.15, 1);
    cone(group, gold, 0, 2.9, 0, 0.6, 0.7, 0.2);
  }
  if (id === "rose") {
    cyl(group, "#b8a5b0", 0, 0.28, 0, 1.35, 0.55);
    cyl(group, "#d6c2ca", 0, 0.8, 0, 0.3, 1.1);
    cyl(group, "#d8bbc9", 0, 1.35, 0, 0.95, 0.15);
    for (const x of [-0.22, 0.22])
      sphere(group, "#e8b0c9", x, 1.9, 0, 0.3, 0.3, 0.15, 0.2);
    cone(group, "#e8b0c9", 0, 1.64, 0, 0.43, 0.6, 0.2).rotation.z = Math.PI;
  }
  if (id === "lunar") {
    for (const x of [-0.75, 0.75]) {
      const moon = new THREE.Mesh(
        new THREE.TorusGeometry(0.55, 0.1, 8, 36, Math.PI * 1.55),
        material(x < 0 ? "#d9d5e9" : "#c1d6ed", 0.45),
      );
      moon.position.set(x, 2.1, 0);
      moon.rotation.z = x < 0 ? 0.6 : -0.6;
      group.add(moon);
    }
    cyl(group, stone, 0, 0.2, 0, 1.6, 0.4);
  }
  if (id === "brass") {
    for (const y of [0.2, 3.2]) cyl(group, "#b39966", 0, y, 0, 1, 0.2);
    for (const x of [-0.8, 0.8])
      for (const z of [-0.55, 0.55]) cyl(group, "#a68a55", x, 1.7, z, 0.055, 3);
    const a = cone(group, "#a6b6b1", 0, 2.4, 0, 0.8, 1.4);
    a.rotation.z = Math.PI;
    cone(group, "#d8be7a", 0, 1, 0, 0.8, 1.4);
    cyl(group, "#e5ce94", 0, 1.7, 0, 0.025, 0.7, 0.5);
  }
  if (id === "pearl") {
    const shell = new THREE.Mesh(
      new THREE.SphereGeometry(1.2, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      material("#d5b5bd"),
    );
    shell.rotation.x = Math.PI;
    shell.position.y = 0.6;
    group.add(shell);
    sphere(group, "#eae8da", 0, 0.8, 0, 0.5, 0.5, 0.5, 0.5);
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      const ridge = box(
        group,
        "#e2c8cf",
        Math.cos(a) * 0.6,
        0.6,
        Math.sin(a) * 0.6,
        0.06,
        0.07,
        1,
      );
      ridge.rotation.y = -a;
    }
  }
  if (id === "verdigris") {
    const wheel = new THREE.Group();
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.1, 0.15, 8, 48),
      material("#9bb9a8", 0.08, 0.45),
    );
    wheel.add(ring);
    for (let i = 0; i < 8; i++) {
      const spoke = box(wheel, "#b0a476", 0, 0, 0, 2.2, 0.06, 0.09);
      spoke.rotation.z = (i * Math.PI) / 4;
    }
    wheel.position.y = 1.8;
    group.add(wheel);
    animated.push((t) => (wheel.rotation.z = t * 0.2));
  }
  if (id === "snowspire") {
    for (const [x, z, h] of [
      [-0.7, 0, 2.6],
      [0.4, -0.4, 3.5],
      [1, 0.5, 1.8],
    ]) {
      cone(group, "#8aabba", x, h / 2, z, 0.7, h);
      cone(group, "#e0e8e7", x, h * 0.85, z, 0.31, h * 0.3);
    }
    cyl(group, gold, 0.4, 3.8, -0.4, 0.035, 0.6);
  }
  if (id === "sunken") {
    for (const x of [-1, 1]) cyl(group, "#94b0a5", x, 1.1, 0, 0.22, 2.2);
    const arch = new THREE.Mesh(
      new THREE.TorusGeometry(1, 0.22, 6, 20, Math.PI),
      material("#aec7b7"),
    );
    arch.position.y = 2.1;
    group.add(arch);
    for (let i = 0; i < 5; i++)
      cone(
        group,
        "#cf9d9e",
        Math.cos(i) * 1.2,
        0.45,
        Math.sin(i) * 0.9,
        0.13,
        0.9,
      );
  }
  if (id === "dream") {
    const book = new THREE.Group();
    for (const x of [-0.6, 0.6]) {
      const pages = box(book, "#e8d8b9", x, 1.5, 0, 1.2, 0.2, 1.6);
      pages.rotation.z = x < 0 ? 0.2 : -0.2;
      const cover = box(book, "#8d689e", x, 1.36, 0, 1.3, 0.08, 1.7);
      cover.rotation.z = x < 0 ? 0.2 : -0.2;
    }
    group.add(book);
    animated.push((t) => {
      book.position.y = Math.sin(t * 0.7) * 0.2;
      book.rotation.y = Math.sin(t * 0.2) * 0.15;
    });
  }
  if (id === "nightmarket") {
    for (const x of [-1.2, 1.2]) cyl(group, "#876f64", x, 1.7, 0, 0.08, 3.4);
    box(group, theme.roof, 0, 3.4, 0, 3, 0.2, 0.3);
    for (let i = 0; i < 5; i++) {
      const x = -1 + i * 0.5;
      cyl(group, "#b5a075", x, 3.05, 0, 0.015, 0.65);
      sphere(
        group,
        ["#e9b17c", "#d9959f", "#dfbf7b"][i % 3],
        x,
        2.7,
        0,
        0.18,
        0.28,
        0.18,
        0.6,
      );
    }
  }
  if (id === "aurora") {
    const curtain = new THREE.Mesh(
      new THREE.PlaneGeometry(3.4, 2.5, 12, 8),
      new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { time: { value: 0 } },
        vertexShader:
          "uniform float time;varying vec2 vUv;void main(){vUv=uv;vec3 p=position;p.z+=sin(p.x*2.+time)*.25;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}",
        fragmentShader:
          "uniform float time;varying vec2 vUv;void main(){float stripe=.5+.5*sin(vUv.x*24.+time);float alpha=sin(vUv.y*3.14159)*.23*stripe;gl_FragColor=vec4(mix(vec3(.4,.8,.7),vec3(.7,.5,.9),vUv.x)*1.5,alpha);}",
      }),
    );
    curtain.position.y = 3;
    group.add(curtain);
    animated.push((t) => (curtain.material.uniforms.time.value = t * 0.4));
  }
  if (id === "glacier") {
    for (let i = 0; i < 5; i++) {
      const c = crystal("#bfe6ff", 0.9 + (i % 3) * 0.35);
      c.position.set(Math.cos(i * 1.3) * 1.1, 0.6, Math.sin(i * 1.3) * 0.9);
      c.rotation.z = (i - 2) * 0.18;
      group.add(c);
    }
    const heart = sphere(group, "#e4f6ff", 0, 1.6, 0, 0.5, 0.5, 0.5, 1.2);
    animated.push((t) =>
      heart.scale.setScalar(0.48 + Math.sin(t * 1.4) * 0.05),
    );
  }
  if (id === "canyon") {
    for (const x of [-1.1, 1.1])
      box(group, "#a8623f", x, 1.1, 0, 0.6, 2.2, 0.8);
    box(group, "#b9704a", 0, 2.35, 0, 2.9, 0.45, 0.8);
    for (let i = 0; i < 3; i++)
      box(group, "#8d5134", -0.4 + i * 0.4, 0.25, 1, 0.3, 0.5, 0.3);
  }
  if (id === "mire") {
    cyl(group, stone, 0, 0.3, 0, 1.2, 0.6);
    box(group, "#8d7a4d", 0, 1.1, 0, 0.9, 1, 0.5);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const lantern = sphere(
        group,
        gold,
        Math.cos(a) * 1.5,
        0.8,
        Math.sin(a) * 1.5,
        0.22,
        0.28,
        0.22,
        1.5,
      );
      animated.push(
        (t) => (lantern.position.y = 0.8 + Math.sin(t * 1.5 + i) * 0.15),
      );
    }
  }
  if (id === "starforge") {
    box(group, "#3f3b58", 0, 0.5, 0, 1.8, 1, 1);
    box(group, "#5a5580", 0, 1.1, 0, 2.3, 0.25, 1.1);
    const star = crystal("#fff0c8", 0.8);
    star.position.y = 2.2;
    group.add(star);
    animated.push((t) => {
      star.rotation.y = t * 1.2;
      star.position.y = 2.2 + Math.sin(t * 2) * 0.12;
    });
  }
  if (id === "saltglass") {
    cyl(group, "#e8e2cf", 0, 1.5, 0, 0.6, 3);
    cyl(group, "#7fc6b0", 0, 3.25, 0, 0.5, 0.5);
    cone(group, "#c9524a", 0, 3.85, 0, 1.2, 0.7);
    const beam = sphere(group, "#fff2c1", 0, 3.25, 0, 0.3, 0.3, 0.3, 1.6);
    animated.push((t) =>
      beam.scale.setScalar(0.28 + Math.abs(Math.sin(t * 1.2)) * 0.1),
    );
  }
  if (id === "foundry") {
    cyl(group, "#4c3b33", 0, 0.9, 0, 1.4, 1.8);
    const melt = cyl(group, "#ff9a3c", 0, 1.85, 0, 1.1, 0.08);
    for (const x of [-1.2, 1.2]) cyl(group, "#3d302a", x, 2.1, -0.6, 0.35, 3);
    animated.push((t) => melt.scale.set(1, 1 + Math.sin(t * 3) * 0.3, 1));
  }
  if (id === "clouds") {
    cyl(group, "#f3e2b0", 0, 0.6, 0, 1.3, 1.2);
    box(group, "#fff4d0", 0, 1.6, 0, 1.2, 1.4, 0.4);
    const sun = sphere(group, "#ffe28a", 0, 3.1, 0, 0.6, 0.6, 0.6, 1.6);
    for (let i = 0; i < 7; i++)
      sphere(
        group,
        "#ffffff",
        Math.cos(i) * 1.8,
        0.25,
        Math.sin(i * 1.3) * 1.5,
        0.9,
        0.45,
        0.8,
      );
    animated.push((t) => (sun.position.y = 3.1 + Math.sin(t) * 0.12));
  }
  return { group, animated };
}
