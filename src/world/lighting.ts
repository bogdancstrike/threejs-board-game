import * as THREE from "three";
import type { LightingStyle } from "./graphics";
import type { MapTheme } from "../game/maps";
export const LIGHTING = {
  exposure: 1.12,
  key: "#a7b9ff",
  fill: "#91a4d4",
  ground: "#7d7469",
  rim: "#e7a6bc",
  keyIntensity: 2.35,
  fillIntensity: 1.1,
  rimIntensity: 1.25,
  shadowBias: -0.00012,
  normalBias: 0.045,
  bloom: { strength: 0.42, radius: 0.35, threshold: 1.05 },
};
export interface LightingRig {
  key: THREE.DirectionalLight;
  update: (time: number) => void;
  setStyle: (style: LightingStyle) => void;
  dispose: () => void;
}
export function createLighting(
  scene: THREE.Scene,
  theme: MapTheme,
): LightingRig {
  const warm = ["desert", "volcano", "clockwork"].includes(theme.theme);
  const key = new THREE.DirectionalLight(
    warm ? "#ddd0bf" : LIGHTING.key,
    LIGHTING.keyIntensity,
  );
  key.position.set(-8, 27, -13);
  key.castShadow = true;
  key.shadow.mapSize.set(1536, 1536);
  Object.assign(key.shadow.camera, {
    left: -23,
    right: 23,
    top: 25,
    bottom: -25,
    near: 1,
    far: 80,
  });
  key.shadow.normalBias = LIGHTING.normalBias;
  key.shadow.bias = LIGHTING.shadowBias;
  key.shadow.radius = 3;
  scene.add(key);
  const fill = new THREE.HemisphereLight(
    warm ? "#b5b6cb" : LIGHTING.fill,
    LIGHTING.ground,
    LIGHTING.fillIntensity,
  );
  scene.add(fill);
  const rim = new THREE.DirectionalLight(LIGHTING.rim, LIGHTING.rimIntensity);
  rim.position.set(12, 10, 10);
  scene.add(rim);
  const portal = new THREE.PointLight("#b58bff", 24, 9, 2);
  portal.position.set(-8.5, 5, -5.75);
  scene.add(portal);
  const forge = new THREE.PointLight("#ffad55", 12, 6, 2);
  forge.position.set(-6.9, 1.8, 12.8);
  scene.add(forge);
  const castle = new THREE.PointLight("#ffd393", 10, 7, 2);
  castle.position.set(4.2, 5, -13.8);
  scene.add(castle);
  return {
    key,
    setStyle(style) {
      const presets = {
        cinematic: {
          key: warm ? "#f4d7b0" : "#b7c9ff",
          fill: "#99b3d1",
          rim: "#ffd5ac",
          intensity: 2.6,
          ambient: 1.1,
          rimPower: 1.6,
          position: [-12, 25, -12],
        },
        daylight: {
          key: "#fff0d4",
          fill: "#c3dcf2",
          rim: "#fff6e3",
          intensity: 3.1,
          ambient: 1.6,
          rimPower: 0.8,
          position: [-8, 32, 10],
        },
        sunset: {
          key: "#ffbf83",
          fill: "#899cc8",
          rim: "#ffdab4",
          intensity: 2.9,
          ambient: 0.9,
          rimPower: 1.9,
          position: [-20, 13, -9],
        },
        moonlight: {
          key: "#91b6ff",
          fill: "#7189b8",
          rim: "#a8c4ff",
          intensity: 1.65,
          ambient: 0.7,
          rimPower: 1.4,
          position: [-12, 26, -15],
        },
      }[style];
      key.color.set(presets.key);
      key.intensity = presets.intensity;
      key.position.fromArray(presets.position);
      fill.color.set(presets.fill);
      fill.intensity = presets.ambient;
      rim.color.set(presets.rim);
      rim.intensity = presets.rimPower;
    },
    update(t) {
      forge.intensity = 11 + Math.sin(t * 6.3) * 2 + Math.sin(t * 13.7) * 1.1;
      portal.intensity = 23 + Math.sin(t * 1.3) * 3;
      castle.intensity = 10 + Math.sin(t * 0.8 + 2);
    },
    dispose() {
      for (const light of [key, fill, rim, portal, forge, castle]) {
        light.removeFromParent();
        light.dispose();
      }
    },
  };
}
