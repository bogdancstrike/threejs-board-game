import * as THREE from "three";
import type { MapTheme } from "../game/maps";
import { box, castle, cone, cyl, sphere, material, crystal } from "./assets";
export function destination(theme: MapTheme) {
  const g = new THREE.Group();
  const base = "#b2b5a0";
  if (["forest", "dragon", "ice", "volcano"].includes(theme.theme)) {
    const keep = castle();
    keep.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        const mat = o.material as THREE.MeshStandardMaterial;
        const color = "#" + mat.color.getHexString();
        if (color === "#b86d52" || color === "#af634c")
          o.material = material(theme.roof);
        if (
          theme.theme === "ice" &&
          ["#9aaca4", "#b8c4b1", "#b7c1b2"].includes(color)
        )
          o.material = material("#bad2da");
        if (
          theme.theme === "volcano" &&
          ["#9aaca4", "#b8c4b1", "#b7c1b2"].includes(color)
        )
          o.material = material("#6e6870");
      }
    });
    g.add(keep);
    if (theme.theme === "dragon") {
      for (const x of [-3.5, 3.5]) {
        box(g, "#7e8282", x, 1.1, -0.6, 1.7, 2.2, 2.5);
        cone(g, theme.roof, x, 2.7, -0.6, 1.4, 1.4);
        cyl(g, "#ac9970", x, 3.65, -0.6, 0.04, 0.7);
        box(g, "#b99762", x + 0.25, 3.8, -0.6, 0.5, 0.4, 0.03);
      }
    }
    if (theme.theme === "ice") {
      for (const x of [-3, 3]) {
        const c = crystal("#b9e3ec", 1.4);
        c.position.set(x, 0, 0);
        g.add(c);
      }
    }
    if (theme.theme === "volcano") {
      for (const x of [-3, 3]) {
        cone(g, "#4d4851", x, 0.65, 1, 1.3, 1.3);
        cyl(g, "#f4a567", x, 1.25, 1, 0.45, 0.035, 1.3);
      }
    }
    return g;
  }
  box(g, base, 0, 0.12, 0, 5, 0.24, 3.8);
  if (theme.theme === "desert") {
    for (let i = 0; i < 6; i++)
      box(
        g,
        i % 2 ? "#c9aa75" : "#d8bd86",
        0,
        0.3 + i * 0.37,
        0,
        4.5 - i * 0.52,
        0.37,
        3.6 - i * 0.42,
      );
    box(g, "#e4cb93", 0, 2.8, 0, 1.8, 0.9, 1.45);
    for (const x of [-0.6, 0.6]) cyl(g, "#ab8c5f", x, 2.8, 0.8, 0.12, 0.9);
    box(g, "#665b52", 0, 2.7, 0.75, 0.65, 0.75, 0.04);
    for (const x of [-2.5, 2.5]) {
      box(g, "#cbb17e", x, 1.5, 0.7, 0.35, 3, 0.35);
      cone(g, "#e6ca8c", x, 3.2, 0.7, 0.32, 0.6);
    }
    const sun = new THREE.Mesh(
      new THREE.TorusGeometry(0.6, 0.06, 6, 32),
      material("#eed088", 0.7),
    );
    sun.position.set(0, 3.7, 0);
    g.add(sun);
  }
  if (theme.theme === "sakura") {
    for (let i = 0; i < 4; i++) {
      const width = 3.5 - i * 0.65;
      box(g, "#d4c7ad", 0, 0.7 + i * 1.1, 0, width, 0.9, width * 0.65);
      const roof = cone(g, theme.roof, 0, 1.35 + i * 1.1, 0, width * 0.9, 0.75);
      roof.geometry = roof.geometry.clone();
      roof.rotation.y = Math.PI / 4;
      roof.scale.z = 0.8;
      box(g, "#64554d", 0, 0.8 + i * 1.1, width * 0.33, 0.28, 0.75, 0.03);
      for (const x of [-width * 0.4, width * 0.4])
        box(g, "#9b625b", x, 0.8 + i * 1.1, width * 0.34, 0.09, 0.9, 0.06);
    }
    for (const x of [-1.4, 1.4]) cyl(g, "#b67060", x, 0.9, 2, 0.08, 1.8);
    box(g, "#b67060", 0, 1.8, 2, 3.3, 0.15, 0.18);
    box(g, "#605a56", 0, 2, 2, 3.7, 0.12, 0.22);
  }
  if (theme.theme === "ocean") {
    cyl(g, "#d0d1b7", 0, 2.1, 0, 0.88, 4.2);
    for (const h of [1, 2.3, 3.6]) cyl(g, theme.roof, 0, h, 0, 0.9, 0.32);
    cyl(g, "#7b9a99", 0, 4.4, 0, 1.1, 0.3);
    cyl(g, "#ffe0a4", 0, 4.9, 0, 0.62, 0.7, 1.3);
    for (let i = 0; i < 6; i++)
      cyl(
        g,
        "#637e7c",
        Math.cos((i * Math.PI) / 3) * 0.66,
        4.9,
        Math.sin((i * Math.PI) / 3) * 0.66,
        0.035,
        0.75,
      );
    cone(g, theme.roof, 0, 5.55, 0, 1.2, 0.8);
    for (const x of [-1.8, 1.8]) {
      box(g, "#c7c8ab", x, 0.5, 0, 1.5, 1, 1.4);
      const roof = cone(g, theme.roof, x, 1.3, 0, 1.2, 0.8);
      roof.rotation.y = Math.PI / 4;
    }
  }
  if (theme.theme === "mushroom") {
    for (const [x, z, h, r] of [
      [0, 0, 3.5, 1.8],
      [-1.9, 0.4, 2.2, 1.1],
      [1.8, -0.4, 2.7, 1.2],
    ]) {
      cyl(g, "#bdb0bb", x, h / 2, z, 0.38, h);
      const cap = new THREE.Mesh(
        new THREE.SphereGeometry(r, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2),
        material(theme.roof, 0.15),
      );
      cap.position.set(x, h, z);
      cap.scale.y = 0.5;
      g.add(cap);
      sphere(g, "#b4dbd7", x, h * 0.65, z + 0.37, 0.16, 0.23, 0.04, 1);
      for (let j = 0; j < 4; j++) {
        const a = (j * Math.PI) / 2;
        sphere(
          g,
          "#e0c5dc",
          x + Math.cos(a) * r * 0.5,
          h + r * 0.34,
          z + Math.sin(a) * r * 0.5,
          0.17,
          0.05,
          0.12,
          0.3,
        );
      }
    }
    box(g, "#665566", 0, 0.55, 0.4, 0.55, 1.1, 0.05);
  }
  if (theme.theme === "astral") {
    cyl(g, "#a5a4b6", 0, 1.3, 0, 1.5, 2.6);
    cyl(g, "#c9c2bd", 0, 2.6, 0, 1.7, 0.2);
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(1.6, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2),
      material(theme.roof, 0.1, 0.3),
    );
    dome.position.y = 2.7;
    g.add(dome);
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      box(
        g,
        "#ffe3ae",
        Math.sin(a) * 1.45,
        1.8,
        Math.cos(a) * 1.45,
        0.15,
        0.6,
        0.15,
        1,
      );
    }
    const orrery = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.8, 0.035, 6, 48),
        material("#dbc99e", 0.3),
      );
      ring.rotation.set(i * 0.8, 0.5 * i, 0.3);
      orrery.add(ring);
    }
    sphere(orrery, theme.accent, 0, 0, 0, 0.2, 0.2, 0.2, 1);
    orrery.position.y = 4.8;
    g.add(orrery);
  }
  if (theme.theme === "clockwork") {
    box(g, "#aaa18a", 0, 2, 0, 2.1, 4, 1.9);
    box(g, "#c2b38e", 0, 4.15, 0, 2.7, 0.3, 2.5);
    cone(g, theme.roof, 0, 5, 0, 2, 1.4);
    const clock = cyl(g, "#e5d9b0", 0, 3.1, 1.01, 0.69, 0.05);
    clock.rotation.x = Math.PI / 2;
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6;
      box(
        g,
        "#746f58",
        Math.sin(a) * 0.55,
        3.1 + Math.cos(a) * 0.55,
        1.045,
        0.04,
        0.1,
        0.03,
      );
    }
    box(g, "#6c6956", 0, 3.28, 1.08, 0.045, 0.4, 0.04);
    const hand = box(g, "#6c6956", 0.17, 3.1, 1.09, 0.4, 0.04, 0.04);
    hand.rotation.z = 0.3;
    for (const x of [-1.75, 1.75]) {
      box(g, "#8b9c8b", x, 0.75, 0, 1.3, 1.5, 1.6);
      cone(g, theme.roof, x, 1.9, 0, 1.1, 0.8);
    }
  }
  return g;
}
