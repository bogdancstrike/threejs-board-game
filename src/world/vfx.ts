import * as THREE from "three";
import { seededRandom } from "../game/data";
export type WorldEffect =
  | "landing"
  | "mystery"
  | "treasure"
  | "portal"
  | "victory";
export class WorldVFX {
  group = new THREE.Group();
  private time = { value: 0 };
  private cursor = 0;
  private rng = seededRandom(73);
  private geometry = new THREE.BufferGeometry();
  private material: THREE.ShaderMaterial;
  private rings: {
    mesh: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>;
    born: number;
    origin: THREE.Vector3;
    duration: number;
  }[] = [];
  constructor() {
    const count = 256;
    this.geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(count * 3), 3),
    );
    this.geometry.setAttribute(
      "velocity",
      new THREE.BufferAttribute(new Float32Array(count * 3), 3),
    );
    this.geometry.setAttribute(
      "birth",
      new THREE.BufferAttribute(new Float32Array(count).fill(-100), 1),
    );
    this.geometry.setAttribute(
      "life",
      new THREE.BufferAttribute(new Float32Array(count).fill(1), 1),
    );
    this.geometry.setAttribute(
      "tint",
      new THREE.BufferAttribute(new Float32Array(count * 3), 3),
    );
    this.material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { time: this.time },
      vertexShader:
        "uniform float time;attribute vec3 velocity;attribute float birth;attribute float life;attribute vec3 tint;varying vec3 vTint;varying float vAlpha;void main(){float age=time-birth;float p=clamp(age/life,0.,1.);vAlpha=(1.-p)*step(0.,age);vTint=tint;vec3 pos=position+velocity*age;pos.y-=age*age*.6;vec4 mv=modelViewMatrix*vec4(pos,1.);gl_Position=projectionMatrix*mv;gl_PointSize=(1.-p)*130./max(1.,-mv.z);}",
      fragmentShader:
        "varying vec3 vTint;varying float vAlpha;void main(){float d=length(gl_PointCoord-.5)*2.;float alpha=(1.-smoothstep(.1,1.,d))*vAlpha;if(alpha<.01)discard;gl_FragColor=vec4(vTint*2.,alpha);}",
    });
    const points = new THREE.Points(this.geometry, this.material);
    points.frustumCulled = false;
    this.group.add(points);
    for (let i = 0; i < 6; i++) {
      const geometry = new THREE.RingGeometry(0.95, 1, 48);
      geometry.rotateX(-Math.PI / 2);
      const material = new THREE.MeshBasicMaterial({
        color: "#d8b874",
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.visible = false;
      this.group.add(mesh);
      this.rings.push({
        mesh,
        born: -100,
        origin: new THREE.Vector3(),
        duration: 1,
      });
    }
  }
  burst(position: THREE.Vector3, type: WorldEffect, time: number) {
    const color = new THREE.Color(
      type === "treasure"
        ? "#f8c775"
        : type === "portal"
          ? "#8bdcf0"
          : type === "victory"
            ? "#ffe2a5"
            : type === "mystery"
              ? "#c4a3f1"
              : "#b9cba3",
    );
    const count = type === "landing" ? 12 : type === "victory" ? 90 : 42;
    for (let i = 0; i < count; i++) {
      const index = this.cursor++ % 256,
        a = this.rng() * Math.PI * 2,
        speed = (type === "landing" ? 0.4 : 1.3) * (0.5 + this.rng());
      this.geometry
        .getAttribute("position")
        .setXYZ(index, position.x, position.y + 0.2, position.z);
      this.geometry
        .getAttribute("velocity")
        .setXYZ(
          index,
          Math.cos(a) * speed,
          type === "landing" ? 0.3 : 1 + this.rng() * 1.5,
          Math.sin(a) * speed,
        );
      this.geometry.getAttribute("birth").setX(index, time);
      this.geometry
        .getAttribute("life")
        .setX(index, type === "victory" ? 2.6 : type === "landing" ? 0.5 : 1.4);
      this.geometry
        .getAttribute("tint")
        .setXYZ(index, color.r, color.g, color.b);
    }
    for (const name of ["position", "velocity", "birth", "life", "tint"])
      this.geometry.getAttribute(name).needsUpdate = true;
    if (type !== "landing") {
      const ring = this.rings.find((r) => !r.mesh.visible) || this.rings[0];
      ring.born = time;
      ring.duration = type === "portal" ? 1.8 : 1.2;
      ring.mesh.position.copy(position);
      ring.mesh.position.y += 0.13;
      ring.mesh.material.color.copy(color);
      ring.mesh.visible = true;
    }
  }
  update(time: number) {
    this.time.value = time;
    for (const ring of this.rings) {
      if (!ring.mesh.visible) continue;
      const p = (time - ring.born) / ring.duration;
      ring.mesh.scale.setScalar(0.3 + p * 1.7);
      ring.mesh.material.opacity = Math.max(0, (1 - p) * 0.65);
      if (p >= 1) ring.mesh.visible = false;
    }
  }
  dispose() {
    this.geometry.dispose();
    this.material.dispose();
    for (const r of this.rings) {
      r.mesh.geometry.dispose();
      r.mesh.material.dispose();
    }
    this.group.removeFromParent();
  }
}
