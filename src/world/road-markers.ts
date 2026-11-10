import * as THREE from "three";
import { getTiles } from "../game/data";
import { ROAD_STOPS } from "../game/road";
import type { MapTheme } from "../game/maps";
import {
  box as makeBox,
  cone as makeCone,
  cyl as makeCylinder,
  sphere as makeSphere,
  crystal as makeCrystal,
} from "./assets";
const box = (w: number, h: number, d: number, color: string, g = 0) =>
  makeBox(new THREE.Group(), color, 0, 0, 0, w, h, d, g);
const sphere = (r: number, color: string, _detail = 1) =>
  makeSphere(new THREE.Group(), color, 0, 0, 0, r * 2);
const cone = (r: number, h: number, color: string, _segments = 6) =>
  makeCone(new THREE.Group(), color, 0, 0, 0, r * 2, h);
const cyl = (
  top: number,
  bottom: number,
  h: number,
  color: string,
  _segments = 8,
) =>
  makeCylinder(new THREE.Group(), color, 0, 0, 0, Math.max(top, bottom) * 2, h);
const crystal = (scale: number, color: string) => makeCrystal(color, scale);
/** Small roadside dioramas; the tile center stays open for the party. */
export function roadMarkers(theme: MapTheme) {
  const group = new THREE.Group(),
    animated: ((time: number) => void)[] = [];
  group.name = "Road encounters";
  const tiles = getTiles(theme.id);
  for (const stop of ROAD_STOPS) {
    const tile = tiles[stop.tile],
      marker = new THREE.Group();
    marker.position.set(
      tile.x + (stop.tile % 2 ? -0.83 : 0.83),
      tile.y + 0.12,
      tile.z + 0.08,
    );
    marker.userData.roadTile = stop.tile;
    const color = stop.kind === "dragon" ? "#b16856" : theme.accent;
    const base = cyl(0.43, 0.52, 0.12, theme.rock, 8);
    base.position.y = -0.03;
    marker.add(base);
    if (stop.kind === "dragon") {
      const dragon = new THREE.Group();
      dragon.scale.setScalar(0.55);
      const body = sphere(0.43, color, 1);
      body.scale.set(0.85, 1, 1.3);
      body.position.y = 0.5;
      dragon.add(body);
      const neck = cone(0.22, 0.7, color, 6);
      neck.position.set(0, 0.95, -0.27);
      neck.rotation.x = -0.2;
      dragon.add(neck);
      const head = box(0.42, 0.3, 0.55, color, 0.0);
      head.position.set(0, 1.25, -0.47);
      dragon.add(head);
      for (const x of [-0.13, 0.13]) {
        const eye = sphere(0.035, "#f8d983", 1);
        eye.position.set(x, 1.3, -0.74);
        dragon.add(eye);
        const horn = cone(0.06, 0.27, "#ead8a7", 4);
        horn.position.set(x, 1.5, -0.35);
        dragon.add(horn);
      }
      const wings: THREE.Group[] = [];
      for (const sign of [-1, 1]) {
        const wing = new THREE.Group();
        wing.position.set(sign * 0.3, 0.75, 0.05);
        const membrane = cone(0.6, 0.06, "#754c62", 3);
        membrane.rotation.z = Math.PI / 2;
        membrane.position.x = sign * 0.45;
        membrane.rotation.y = sign * 0.4;
        wing.add(membrane);
        dragon.add(wing);
        wings.push(wing);
      }
      for (let i = 0; i < 4; i++) {
        const tail = sphere(0.18 - i * 0.035, color, 1);
        tail.position.set(
          Math.sin(i * 0.55) * 0.18,
          0.25 - i * 0.025,
          0.5 + i * 0.23,
        );
        dragon.add(tail);
      }
      marker.add(dragon);
      animated.push((t) => {
        dragon.position.y = Math.sin(t * 1.3 + stop.tile) * 0.035;
        wings.forEach(
          (w, i) =>
            (w.rotation.z = (i ? 1 : -1) * (0.2 + Math.sin(t * 1.4) * 0.12)),
        );
      });
    } else if (stop.kind === "box") {
      const chest = box(0.62, 0.38, 0.45, "#805b42");
      chest.position.y = 0.25;
      marker.add(chest);
      const lid = new THREE.Group();
      lid.position.set(0, 0.45, 0.2);
      const top = box(0.65, 0.13, 0.48, "#b89653");
      top.position.set(0, 0.03, -0.2);
      lid.add(top);
      marker.add(lid);
      const lock = box(0.1, 0.15, 0.04, "#f2da8c");
      lock.position.set(0, 0.39, -0.245);
      marker.add(lock);
      const glow = crystal(0.1, theme.accent);
      glow.position.y = 0.82;
      marker.add(glow);
      animated.push((t) => {
        lid.rotation.x = -0.12 - Math.sin(t * 0.9 + stop.tile) * 0.07;
        glow.rotation.y = t * 0.7;
        glow.position.y = 0.8 + Math.sin(t * 1.5) * 0.06;
      });
    } else if (stop.kind === "hazard") {
      const stone = cone(0.31, 0.8, theme.rock, 5);
      stone.position.y = 0.4;
      marker.add(stone);
      const warning = crystal(0.16, "#de946b");
      warning.position.y = 0.98;
      marker.add(warning);
      animated.push((t) =>
        warning.scale.setScalar(0.9 + Math.sin(t * 2) * 0.12),
      );
    } else if (stop.kind === "camp") {
      const tent = cone(0.43, 0.65, "#ad9370", 3);
      tent.position.y = 0.35;
      tent.rotation.y = Math.PI / 2;
      marker.add(tent);
      const ember = sphere(0.12, "#f0b15d", 1);
      ember.position.set(0.32, 0.15, -0.35);
      marker.add(ember);
      animated.push((t) => ember.scale.setScalar(1 + Math.sin(t * 9) * 0.12));
    } else {
      const pedestal = cyl(0.2, 0.28, 0.5, theme.rock, 6);
      pedestal.position.y = 0.28;
      marker.add(pedestal);
      const jewel = crystal(
        0.21,
        stop.kind === "curse" ? "#b28acb" : theme.accent,
      );
      jewel.position.y = 0.85;
      marker.add(jewel);
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.31, 0.025, 4, 18),
        new THREE.MeshStandardMaterial({
          color: theme.accent,
          emissive: theme.accent,
          emissiveIntensity: 0.4,
        }),
      );
      ring.position.y = 0.9;
      marker.add(ring);
      animated.push((t) => {
        jewel.rotation.y = t * 0.7;
        ring.rotation.y = t * 0.5;
        ring.rotation.x = 0.5 + Math.sin(t * 0.8) * 0.15;
      });
    }
    group.add(marker);
  }
  group.visible = false;
  return { group, animated };
}
