import * as THREE from "three";
import { seededRandom } from "../game/data";
import { waterMaterial } from "./water";
/** Curved waterfall curtains with gravity-driven droplets and expanding impact foam. */
export function createWaterfall(color: string, height: number, lava = false) {
  const group = new THREE.Group();
  group.name = "waterfall";
  const flow = waterMaterial(color, true, lava),
    rng = seededRandom(Math.round(height * 1000) + 31);
  let speed = 1,
    foamAmount = 1;
  for (let layer = 0; layer < 2; layer++) {
    const geometry = new THREE.PlaneGeometry(
        1.25 - layer * 0.12,
        height,
        16,
        32,
      ),
      position = geometry.getAttribute("position");
    for (let i = 0; i < position.count; i++) {
      const down = (height / 2 - position.getY(i)) / height;
      position.setZ(
        i,
        0.06 +
          down * down * 0.32 +
          Math.sin(position.getX(i) * 8) * 0.025 +
          layer * 0.05,
      );
      position.setX(i, position.getX(i) * (1 + down * 0.14));
    }
    geometry.computeVertexNormals();
    const mesh = new THREE.Mesh(geometry, flow.material);
    mesh.position.y = -height / 2;
    group.add(mesh);
  }
  const spray = new THREE.Group();
  spray.name = "waterfall-spray";
  group.add(spray);
  const count = lava ? 20 : 90,
    positions = new Float32Array(count * 3),
    seeds = Array.from({ length: count }, () => [rng(), rng(), rng(), rng()]);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      tint: { value: new THREE.Color(lava ? "#ffb14b" : "#deeff2") },
      opacity: { value: lava ? 0.45 : 0.48 },
    },
    vertexShader:
      "void main(){vec4 p=modelViewMatrix*vec4(position,1.);gl_PointSize=clamp(65./-p.z,1.,10.);gl_Position=projectionMatrix*p;}",
    fragmentShader:
      "uniform vec3 tint;uniform float opacity;void main(){float d=length(gl_PointCoord-.5)*2.;if(d>1.)discard;gl_FragColor=vec4(tint,(1.-smoothstep(.1,1.,d))*opacity);#include <tonemapping_fragment>\n#include <colorspace_fragment>}",
  });
  material.fragmentShader = material.fragmentShader
    .replace(";#include", ";\n#include")
    .replace("fragment>}", "fragment>\n}");
  const drops = new THREE.Points(geometry, material);
  drops.frustumCulled = false;
  spray.add(drops);
  const rings: Array<THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>> =
    [];
  for (let i = 0; i < 5; i++) {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.45, 0.61, 48),
      new THREE.MeshBasicMaterial({
        color: lava ? "#ffcb73" : "#d4edef",
        transparent: true,
        opacity: 0.3,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(0, -height + 0.035 + i * 0.004, 0.4);
    group.add(ring);
    rings.push(ring);
  }
  return {
    group,
    configure(waterSpeed: number, foam: number, showSpray: boolean) {
      speed = waterSpeed;
      foamAmount = foam;
      flow.configure(speed, foam);
      spray.visible = showSpray;
    },
    update(time: number) {
      flow.update(time);
      const t = time * speed;
      seeds.forEach(([phase, x, z, velocity], i) => {
        const age = (t * 0.7 + phase) % 1;
        if (i < count * 0.45) {
          positions[i * 3] = (x - 0.5) * 1.25;
          positions[i * 3 + 1] = -Math.min(height, age * age * height * 1.6);
          positions[i * 3 + 2] = 0.15 + age * 0.3;
        } else {
          positions[i * 3] = (x - 0.5) * (1 + age * 2.2);
          positions[i * 3 + 1] =
            -height + Math.max(0, age * (2.4 + velocity) - age * age * 3.8);
          positions[i * 3 + 2] = 0.3 + z * age * 1.4;
        }
      });
      geometry.attributes.position.needsUpdate = true;
      rings.forEach((ring, i) => {
        const phase = (t * 0.55 + i / 5) % 1;
        ring.scale.setScalar(0.4 + phase * 1.9);
        ring.material.opacity = (1 - phase) * 0.38 * foamAmount;
        ring.visible = foamAmount > 0;
      });
    },
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}
