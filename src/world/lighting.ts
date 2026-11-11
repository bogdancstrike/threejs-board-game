import * as THREE from "three";
import { dayPhase, type LightingStyle } from "./graphics";
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
interface Preset {
  key: string;
  fill: string;
  rim: string;
  sky: string | null;
  intensity: number;
  ambient: number;
  rimPower: number;
  /** Elevation angle of the key light in degrees. */
  elevation: number;
  /** Base azimuth in degrees before the user's sun-angle offset. */
  azimuth: number;
  /** Multiplier for practical lights (windows, forge, portal). */
  practical: number;
  aurora: number;
  flashes: boolean;
}
export const LIGHTING_PRESETS: Record<
  Exclude<LightingStyle, "dynamic">,
  Preset
> = {
  cinematic: {
    key: "#b7c9ff",
    fill: "#99b3d1",
    rim: "#ffd5ac",
    sky: null,
    intensity: 2.6,
    ambient: 1.1,
    rimPower: 1.6,
    elevation: 56,
    azimuth: 225,
    practical: 1,
    aurora: 0,
    flashes: false,
  },
  daylight: {
    key: "#fff0d4",
    fill: "#c3dcf2",
    rim: "#fff6e3",
    sky: "#7fa9cf",
    intensity: 3.1,
    ambient: 1.6,
    rimPower: 0.8,
    elevation: 70,
    azimuth: 320,
    practical: 0.45,
    aurora: 0,
    flashes: false,
  },
  dawn: {
    key: "#ffd6c0",
    fill: "#a9b9d8",
    rim: "#f7c3d6",
    sky: "#8796b8",
    intensity: 2.4,
    ambient: 1.3,
    rimPower: 1.5,
    elevation: 22,
    azimuth: 120,
    practical: 0.75,
    aurora: 0,
    flashes: false,
  },
  sunset: {
    key: "#ffbf83",
    fill: "#899cc8",
    rim: "#ffdab4",
    sky: "#5c4a6b",
    intensity: 2.9,
    ambient: 0.9,
    rimPower: 1.9,
    elevation: 28,
    azimuth: 245,
    practical: 1.1,
    aurora: 0,
    flashes: false,
  },
  storm: {
    key: "#b4bfd0",
    fill: "#68768c",
    rim: "#9fb3d6",
    sky: "#2b3542",
    intensity: 1.55,
    ambient: 0.95,
    rimPower: 0.9,
    elevation: 48,
    azimuth: 200,
    practical: 1.2,
    aurora: 0,
    flashes: true,
  },
  moonlight: {
    key: "#91b6ff",
    fill: "#7189b8",
    rim: "#a8c4ff",
    sky: "#101a2c",
    intensity: 1.65,
    ambient: 0.7,
    rimPower: 1.4,
    elevation: 50,
    azimuth: 215,
    practical: 1.45,
    aurora: 0,
    flashes: false,
  },
  aurora: {
    key: "#9fd8ff",
    fill: "#6c8fbf",
    rim: "#8ff0c8",
    sky: "#0c1726",
    intensity: 1.5,
    ambient: 0.8,
    rimPower: 1.8,
    elevation: 46,
    azimuth: 200,
    practical: 1.5,
    aurora: 1,
    flashes: false,
  },
};
export interface LightingRig {
  key: THREE.DirectionalLight;
  update: (time: number) => void;
  setStyle: (
    style: LightingStyle,
    options?: { sunAngle?: number; cycleMinutes?: number },
  ) => void;
  /** 0 by day, 1 at full night — drives emissive windows and fireflies. */
  readonly nightness: number;
  /** Current horizon colour, shared with the sky dome. */
  readonly skyColor: THREE.Color;
  dispose: () => void;
}
function auroraCurtain() {
  const geometry = new THREE.PlaneGeometry(150, 40, 96, 1);
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    uniforms: { time: { value: 0 }, strength: { value: 0 } },
    vertexShader: `uniform float time;varying vec2 vUv;void main(){vUv=uv;vec3 p=position;p.z+=sin(p.x*.08+time*.35)*7.+sin(p.x*.21-time*.2)*2.5;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
    fragmentShader: `uniform float time;uniform float strength;varying vec2 vUv;void main(){float bands=.55+.45*sin(vUv.x*38.+time*.9+sin(vUv.x*9.+time*.3)*3.);float fade=smoothstep(0.,.35,vUv.y)*(1.-smoothstep(.55,1.,vUv.y));vec3 c=mix(vec3(.15,.95,.62),vec3(.55,.35,1.),vUv.y);gl_FragColor=vec4(c*bands*fade*strength*.55,1.);}`,
  });
  const mesh = new THREE.Mesh(geometry, material);
  // Behind the island, opposite the default camera, low enough to frame it.
  mesh.position.set(-42, 4, -52);
  mesh.rotation.y = 0.62;
  mesh.frustumCulled = false;
  mesh.userData.excludeAO = true;
  mesh.renderOrder = -1;
  return { mesh, material };
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
    far: 90,
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
  const aurora = auroraCurtain();
  scene.add(aurora.mesh);
  const baseSky = new THREE.Color(theme.sky);
  const sky = new THREE.Color(theme.sky);
  let style: LightingStyle = "cinematic",
    sunAngle = 0,
    cycleMinutes = 4,
    practical = 1,
    flashes = false,
    flashUntil = 0,
    nextFlash = 6,
    auroraStrength = 0,
    nightness = 0.5,
    baseKey = 2.6;
  const tmpA = new THREE.Color(),
    tmpB = new THREE.Color();
  const place = (elevationDeg: number, azimuthDeg: number) => {
    const e = THREE.MathUtils.degToRad(elevationDeg),
      a = THREE.MathUtils.degToRad(azimuthDeg + sunAngle);
    key.position.set(
      Math.cos(e) * Math.sin(a) * 34,
      Math.max(4, Math.sin(e) * 34),
      Math.cos(e) * Math.cos(a) * 34,
    );
    rim.position.set(-key.position.x * 0.6, 10, -key.position.z * 0.6);
  };
  const applySky = (color: THREE.Color) => {
    if (scene.background instanceof THREE.Color) scene.background.copy(color);
    if (scene.fog) (scene.fog as THREE.FogExp2).color.copy(color);
  };
  const applyPreset = (p: Preset) => {
    key.color.set(warm && p === LIGHTING_PRESETS.cinematic ? "#f4d7b0" : p.key);
    baseKey = p.intensity;
    key.intensity = p.intensity;
    fill.color.set(p.fill);
    fill.intensity = p.ambient;
    rim.color.set(p.rim);
    rim.intensity = p.rimPower;
    practical = p.practical;
    flashes = p.flashes;
    auroraStrength = p.aurora;
    nightness = p.practical > 1.3 ? 1 : p.practical < 0.6 ? 0 : 0.5;
    sky.copy(p.sky ? tmpA.set(p.sky).lerp(baseSky, 0.35) : baseSky);
    applySky(sky);
    place(p.elevation, p.azimuth);
  };
  const night = LIGHTING_PRESETS.moonlight,
    day = LIGHTING_PRESETS.daylight,
    golden = LIGHTING_PRESETS.sunset;
  const dayNight = (t: number) => {
    const phase = dayPhase(t / (cycleMinutes * 60) + 0.3);
    // Sun colours: blend night→day, then tint with golden hour.
    tmpA.set(night.key).lerp(tmpB.set(day.key), phase.daylight);
    tmpA.lerp(tmpB.set(golden.key), phase.golden * 0.7);
    key.color.copy(tmpA);
    key.intensity =
      night.intensity +
      (day.intensity - night.intensity) * phase.daylight +
      phase.golden * 0.3;
    fill.color
      .set(night.fill)
      .lerp(tmpB.set(day.fill), phase.daylight)
      .lerp(tmpA.set(golden.fill), phase.golden * 0.5);
    fill.intensity =
      night.ambient + (day.ambient - night.ambient) * phase.daylight;
    rim.color.set(night.rim).lerp(tmpB.set(golden.rim), phase.golden);
    rim.intensity = 0.8 + phase.golden * 1.1;
    // The visible light follows the sun by day and the moon by night.
    const elevation = 18 + Math.abs(phase.elevation) * 55;
    place(elevation, THREE.MathUtils.radToDeg(phase.azimuth));
    nightness = phase.night > 0 ? Math.min(1, phase.night * 2.2) : 0;
    practical = 0.45 + nightness * 1.05;
    auroraStrength = nightness * 0.65;
    sky
      .copy(tmpA.set(night.sky!).lerp(baseSky, 0.35))
      .lerp(tmpB.set(day.sky!).lerp(baseSky, 0.35), phase.daylight)
      .lerp(tmpB.set(golden.sky!).lerp(baseSky, 0.4), phase.golden * 0.6);
    applySky(sky);
  };
  applyPreset(LIGHTING_PRESETS.cinematic);
  return {
    key,
    get nightness() {
      return nightness;
    },
    skyColor: sky,
    setStyle(next, options = {}) {
      style = next;
      sunAngle = options.sunAngle ?? sunAngle;
      cycleMinutes = options.cycleMinutes ?? cycleMinutes;
      if (style === "dynamic") dayNight(0);
      else applyPreset(LIGHTING_PRESETS[style]);
    },
    update(t) {
      if (style === "dynamic") dayNight(t);
      forge.intensity =
        (11 + Math.sin(t * 6.3) * 2 + Math.sin(t * 13.7) * 1.1) * practical;
      portal.intensity = (23 + Math.sin(t * 1.3) * 3) * practical;
      castle.intensity = (10 + Math.sin(t * 0.8 + 2)) * practical;
      aurora.material.uniforms.time.value = t;
      aurora.material.uniforms.strength.value = auroraStrength;
      aurora.mesh.visible = auroraStrength > 0.01;
      if (flashes) {
        if (t > nextFlash) {
          flashUntil = t + 0.12 + Math.random() * 0.18;
          nextFlash = t + 5 + Math.random() * 9;
        }
        key.intensity =
          t < flashUntil ? baseKey * (3.2 + Math.random() * 1.5) : baseKey;
      }
    },
    dispose() {
      for (const light of [key, fill, rim, portal, forge, castle]) {
        light.removeFromParent();
        light.dispose();
      }
      aurora.mesh.removeFromParent();
      aurora.mesh.geometry.dispose();
      aurora.material.dispose();
    },
  };
}
