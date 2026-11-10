import * as THREE from "three";
import { WorldVFX, type WorldEffect } from "./vfx";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { TerrainAOPass as GTAOPass } from "./ao";
import { createLighting, LIGHTING, type LightingRig } from "./lighting";
import { atmosphere, type Atmosphere } from "./atmosphere";
import { addEnvironmentAssets, type EnvironmentAssets } from "./environment";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import {
  groundHeight,
  getTiles,
  CHARACTERS,
  seededRandom,
  type Character,
} from "../game/data";
import { SKY_ROUTES } from "../game/layers";
import { geography } from "../game/geography";
import type { Player } from "../game/engine";
import type { MapTheme } from "../game/maps";
import { buildWorld, type World } from "./world";
import {
  characterModel,
  prototypeCharacter,
  updateWorldMaterials,
} from "./assets";
import { animateCharacter, setAction, type Action } from "./animation";
export type Quality = "low" | "medium" | "ultra";
export class GameScene {
  scene = new THREE.Scene();
  tiles: ReturnType<typeof getTiles>;
  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  composer: EffectComposer;
  bloom: UnrealBloomPass;
  ao: GTAOPass;
  atmosphere: Atmosphere;
  environment: EnvironmentAssets;
  lighting: LightingRig;
  ready: Promise<void>;
  vfx = new WorldVFX();
  world: World;
  pawns: THREE.Group[] = [];
  frame = 0;
  clock = new THREE.Clock();
  quality: Quality = "medium";
  active = 0;
  moving = false;
  paused = false;
  onTile: (id: number | null) => void = () => {};
  onReady: () => void = () => {};
  onStep: () => void = () => {};
  onLand: () => void = () => {};
  private observer: ResizeObserver;
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private ring: THREE.Mesh;
  private generation = 0;
  private homePosition = new THREE.Vector3(28, 36, 39);
  private homeTarget = new THREE.Vector3();
  private light: THREE.DirectionalLight;
  private focusTween: {
    from: THREE.Vector3;
    to: THREE.Vector3;
    start: number;
  } | null = null;
  constructor(
    public container: HTMLElement,
    public theme: MapTheme,
    initialQuality: Quality = "medium",
  ) {
    this.tiles = getTiles(theme.id);
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = LIGHTING.exposure;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.setClearColor(theme.sky, 0);
    container.append(this.renderer.domElement);
    this.renderer.domElement.setAttribute(
      "aria-label",
      "Interactive 3D game board. Drag to orbit, scroll to zoom.",
    );
    this.camera = new THREE.PerspectiveCamera(36, 1, 0.1, 160);
    const profile = geography(theme.id),
      factor = Math.max(1, Math.max(profile.width, profile.depth) / 21),
      rise = (profile.floors - 1) * profile.rise;
    const skyRise = Math.max(
      0,
      ...(SKY_ROUTES[theme.id] || []).map((layer) => layer.height),
    );
    this.homePosition.set(
      28 * factor,
      36 * factor + rise * 0.25 + skyRise * 0.55,
      39 * factor,
    );
    this.homeTarget.set(0, rise * 0.25 + skyRise * 0.2, 0);
    this.camera.position.copy(this.homePosition);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.copy(this.homeTarget);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.07;
    this.controls.minDistance = 13;
    this.controls.maxDistance = 110;
    this.controls.minPolarAngle = 0.18;
    this.controls.maxPolarAngle = Math.PI * 0.46;
    this.controls.maxTargetRadius = 20;
    this.scene.background = new THREE.Color(theme.sky);
    this.scene.fog = new THREE.FogExp2(theme.sky, 0.007);
    this.lighting = createLighting(this.scene, theme);
    this.light = this.lighting.key;
    this.world = buildWorld(theme);
    this.scene.add(this.world.group, this.vfx.group);
    this.atmosphere = atmosphere(theme);
    this.scene.add(this.atmosphere.group);
    this.environment = addEnvironmentAssets(theme);
    this.scene.add(this.environment.group);
    this.ready = this.environment.ready;

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.ao = new GTAOPass(this.scene, this.camera, 640, 400);
    this.ao.blendIntensity = 0.38;
    this.ao.updateGtaoMaterial({
      radius: 0.55,
      thickness: 0.4,
      distanceFallOff: 1,
      samples: 8,
    });
    this.ao.updatePdMaterial({ samples: 8, radius: 3, rings: 2 });
    this.ao.setSceneClipBox(
      new THREE.Box3(
        new THREE.Vector3(-24, -10, -25),
        new THREE.Vector3(24, 17, 25),
      ),
    );
    this.composer.addPass(this.ao);

    this.bloom = new UnrealBloomPass(
      new THREE.Vector2(800, 600),
      LIGHTING.bloom.strength,
      LIGHTING.bloom.radius,
      LIGHTING.bloom.threshold,
    );
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());
    const ringGeo = new THREE.RingGeometry(0.64, 0.71, 48);
    ringGeo.rotateX(-Math.PI / 2);
    this.ring = new THREE.Mesh(
      ringGeo,
      new THREE.MeshBasicMaterial({
        color: "#f4dba0",
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    );
    this.scene.add(this.ring);
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(container);
    this.renderer.domElement.addEventListener("pointermove", this.hover);
    this.renderer.domElement.addEventListener("pointerleave", () =>
      this.onTile(null),
    );
    this.setQuality(initialQuality);
    this.resize();
    this.animate();
  }
  resize() {
    const w = this.container.clientWidth,
      h = this.container.clientHeight;
    if (!w || !h) return;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.composer.setSize(w, h);
    const aoScale = this.quality === "ultra" ? 0.7 : 0.5;
    this.ao.setSize(
      Math.max(1, Math.floor(w * this.renderer.getPixelRatio() * aoScale)),
      Math.max(1, Math.floor(h * this.renderer.getPixelRatio() * aoScale)),
    );
  }
  private hover = (event: PointerEvent) => {
    const r = this.container.getBoundingClientRect();
    this.pointer.set(
      ((event.clientX - r.left) / r.width) * 2 - 1,
      (-(event.clientY - r.top) / r.height) * 2 + 1,
    );
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hit = this.raycaster.intersectObject(this.world.tiles)[0];
    this.onTile(hit?.instanceId ?? null);
  };
  private animate = () => {
    this.frame = requestAnimationFrame(this.animate);
    const dt = Math.min(this.clock.getDelta(), 0.05),
      t = this.clock.elapsedTime;
    if (document.hidden || this.paused) return;
    this.controls.update();
    this.world.animated.forEach((f) => f(t));
    updateWorldMaterials(t);
    this.lighting.update(t);
    this.atmosphere.update(t);
    this.environment.update(t, dt);
    this.vfx.update(t);
    this.pawns.forEach((p, i) => {
      if (!this.moving && !(p.userData.reactionUntil > t)) {
        const cycle = (t + i * 3) % 19;
        const action: Action =
          cycle > 14 ? "rest" : cycle > 10 ? "magic" : "idle";
        if (p.userData.action !== action) setAction(p, action);
      }
      animateCharacter(p, t, dt);
    });
    if (this.pawns[this.active]) {
      this.ring.position.copy(this.pawns[this.active].position);
      this.ring.position.y += 0.15;
      this.ring.scale.setScalar(1 + Math.sin(t * 2) * 0.05);
    }
    if (this.focusTween) {
      const f = this.focusTween,
        u = Math.min(1, (performance.now() - f.start) / 700);
      this.controls.target.lerpVectors(f.from, f.to, u * u * (3 - 2 * u));
      if (u === 1) this.focusTween = null;
    }
    if (this.quality === "low") this.renderer.render(this.scene, this.camera);
    else this.composer.render();
  };
  async setPlayers(players: Player[], active: number) {
    const gen = ++this.generation;
    this.pawns.forEach((p) => p.removeFromParent());
    this.pawns = [];
    this.active = active;
    for (let i = 0; i < players.length; i++) {
      const c = CHARACTERS.find((c) => c.id === players[i].character)!;
      const fallback = prototypeCharacter(c, players[i].tint);
      fallback.scale.setScalar(0.87);
      fallback.userData.phase = i * 2;
      this.pawns.push(fallback);
      this.scene.add(fallback);
    }
    this.positionPlayers(players);
    await Promise.all(
      players.map(async (p, i) => {
        const c = CHARACTERS.find((c) => c.id === p.character)!;
        const model = await characterModel(c, p.tint);
        if (gen !== this.generation) return;
        const old = this.pawns[i];
        model.scale.copy(old.scale);
        model.position.copy(old.position);
        model.rotation.copy(old.rotation);
        model.userData.phase = i * 2;
        old.removeFromParent();
        this.pawns[i] = model;
        this.scene.add(model);
      }),
    );
    await this.ready;
    this.onReady();
  }
  positionPlayers(players: Player[]) {
    players.forEach((p, i) => {
      const tile = this.tiles[p.position],
        sharing = players
          .map((v, j) => (v.position === p.position ? j : -1))
          .filter((v) => v >= 0),
        slot = sharing.indexOf(i);
      const angle = (slot / sharing.length) * Math.PI * 2,
        offset = sharing.length > 1 ? 0.3 : 0;
      this.pawns[i]?.position.set(
        tile.x + Math.cos(angle) * offset,
        tile.y + 0.095,
        tile.z + Math.sin(angle) * offset,
      );
      this.pawns[i]?.scale.setScalar(sharing.length > 1 ? 0.68 : 0.87);
    });
  }
  async move(player: number, route: number[], running = false) {
    const pawn = this.pawns[player];
    if (!pawn) return;
    this.active = player;
    this.moving = true;
    setAction(pawn, running ? "run" : "walk");
    for (const id of route) {
      this.onStep();
      const from = pawn.position.clone(),
        tile = this.tiles[id],
        to = new THREE.Vector3(tile.x, tile.y + 0.095, tile.z);
      const angle = Math.atan2(to.x - from.x, to.z - from.z);
      pawn.rotation.y = angle;
      await new Promise<void>((resolve) => {
        const start = performance.now(),
          duration = running ? 170 : 300;
        const tick = () => {
          const t = Math.min(1, (performance.now() - start) / duration),
            e = t * t * (3 - 2 * t);
          pawn.position.lerpVectors(from, to, e);
          pawn.position.y = Math.max(
            pawn.position.y,
            groundHeight(pawn.position.z, this.theme.id) + 0.135,
          );
          pawn.position.y += Math.sin(t * Math.PI) * 0.09;
          if (t < 1) requestAnimationFrame(tick);
          else resolve();
        };
        tick();
      });
    }
    setAction(pawn, "idle");
    this.vfx.burst(pawn.position, "landing", this.clock.elapsedTime);
    this.onLand();
    this.moving = false;
  }
  impact(player: number, effect: WorldEffect) {
    const pawn = this.pawns[player];
    if (pawn) this.vfx.burst(pawn.position, effect, this.clock.elapsedTime);
  }
  react(player: number, action: Action) {
    const pawn = this.pawns[player];
    if (!pawn) return;
    pawn.userData.reactionUntil = this.clock.elapsedTime + 2.1;
    setAction(pawn, action);
  }
  focusPlayer() {
    const p = this.pawns[this.active];
    if (p)
      this.focusTween = {
        from: this.controls.target.clone(),
        to: p.position.clone(),
        start: performance.now(),
      };
  }
  resetCamera() {
    this.camera.position.copy(this.homePosition);
    this.controls.target.copy(this.homeTarget);
    this.focusTween = null;
    this.controls.update();
  }
  zoom(delta: number) {
    const v = this.camera.position.clone().sub(this.controls.target);
    v.multiplyScalar(delta);
    const distance = THREE.MathUtils.clamp(v.length(), 13, 110);
    v.setLength(distance);
    this.camera.position.copy(this.controls.target).add(v);
  }
  setQuality(q: Quality) {
    this.quality = q;
    this.renderer.setPixelRatio(
      Math.min(devicePixelRatio, q === "ultra" ? 2 : q === "medium" ? 1.5 : 1),
    );
    this.renderer.shadowMap.enabled = q !== "low";
    this.light.shadow.mapSize.setScalar(q === "ultra" ? 2048 : 1024);
    this.light.shadow.map?.dispose();
    this.light.shadow.map = null;
    this.atmosphere.setQuality(q);
    this.environment.setQuality(q);
    this.ao.enabled = q !== "low";
    this.ao.blendIntensity = q === "ultra" ? 0.48 : 0.38;
    this.ao.updateGtaoMaterial({ samples: q === "ultra" ? 16 : 8 });
    this.resize();
  }
  dispose() {
    cancelAnimationFrame(this.frame);
    this.generation++;
    this.observer.disconnect();
    this.controls.dispose();
    this.world.dispose();
    this.ao.dispose();
    this.bloom.dispose();
    this.composer.dispose();
    this.vfx.dispose();
    this.atmosphere.dispose();
    this.environment.dispose();
    this.lighting.dispose();
    this.ring.geometry.dispose();
    (this.ring.material as THREE.Material).dispose();
    this.light.shadow.map?.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.renderer.domElement.remove();
  }
}
export class CharacterPreview {
  renderer: THREE.WebGLRenderer;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(34, 1, 0.01, 30);
  controls: OrbitControls;
  model: THREE.Group | null = null;
  frame = 0;
  generation = 0;
  clock = new THREE.Clock();
  observer: ResizeObserver;
  action: Action = "idle";
  private viewTween: {
    position: THREE.Vector3;
    target: THREE.Vector3;
    from: THREE.Vector3;
    fromTarget: THREE.Vector3;
    start: number;
  } | null = null;
  constructor(public container: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.append(this.renderer.domElement);
    this.camera.position.set(0, 1, 3.8);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 0.8, 0);
    this.controls.enableDamping = true;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.65;
    this.controls.minDistance = 0.8;
    this.controls.maxDistance = 5;
    this.scene.add(new THREE.HemisphereLight("#d9dfed", "#53615f", 3));
    const key = new THREE.DirectionalLight("#ffe0bb", 3);
    key.position.set(2, 3, 4);
    this.scene.add(key);
    const rim = new THREE.DirectionalLight("#b5b2ff", 2);
    rim.position.set(-3, 2, -1);
    this.scene.add(rim);
    this.observer = new ResizeObserver(() => {
      const w = container.clientWidth,
        h = container.clientHeight;
      if (!w || !h) return;
      this.renderer.setSize(w, h);
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
    });
    this.observer.observe(container);
    this.animate();
  }
  async show(c: Character, tint?: string) {
    const gen = ++this.generation;
    this.model?.removeFromParent();
    this.model = prototypeCharacter(c, tint);
    this.scene.add(this.model);
    const loaded = await characterModel(c, tint);
    if (gen !== this.generation) return;
    this.model.removeFromParent();
    this.model = loaded;
    this.scene.add(loaded);
    setAction(loaded, this.action);
  }
  setAction(action: Action) {
    this.action = action;
    if (this.model) setAction(this.model, action);
  }
  setView(view: string) {
    const distance =
      view === "face"
        ? 1.1
        : view === "upper"
          ? 2.1
          : view === "equipment"
            ? 2.2
            : 3.8;
    const target = new THREE.Vector3(
      view === "equipment" ? 0.25 : 0,
      view === "face" ? 1.35 : view === "upper" ? 1 : 0.8,
      0,
    );
    const position = new THREE.Vector3(
      view === "equipment" ? 0.6 : 0,
      view === "face" ? 1.3 : 1,
      distance,
    );
    this.controls.autoRotate = view === "full";
    this.viewTween = {
      position,
      target,
      from: this.camera.position.clone(),
      fromTarget: this.controls.target.clone(),
      start: performance.now(),
    };
  }
  private animate = () => {
    this.frame = requestAnimationFrame(this.animate);
    const dt = Math.min(this.clock.getDelta(), 0.05);
    if (this.model) animateCharacter(this.model, this.clock.elapsedTime, dt);
    if (this.viewTween) {
      const f = this.viewTween,
        u = Math.min(1, (performance.now() - f.start) / 600),
        ease = u * u * (3 - 2 * u);
      this.camera.position.lerpVectors(f.from, f.position, ease);
      this.controls.target.lerpVectors(f.fromTarget, f.target, ease);
      if (u === 1) this.viewTween = null;
    }
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };
  dispose() {
    cancelAnimationFrame(this.frame);
    this.generation++;
    this.controls.dispose();
    this.observer.disconnect();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.renderer.domElement.remove();
  }
}
