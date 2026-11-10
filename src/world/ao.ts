import * as THREE from "three";
import { GTAOPass } from "three/addons/postprocessing/GTAOPass.js";
/** Keep transparent atmospheric sprites and the sky out of the geometry buffer. */
export class TerrainAOPass extends GTAOPass {
  override render(
    renderer: THREE.WebGLRenderer,
    write: THREE.WebGLRenderTarget,
    read: THREE.WebGLRenderTarget,
    dt: number,
    mask: boolean,
  ) {
    const hidden: THREE.Object3D[] = [];
    this.scene.traverse((o) => {
      if (!o.visible) return;
      const transparent =
        o instanceof THREE.Mesh &&
        (Array.isArray(o.material)
          ? o.material.some((m) => m.transparent)
          : o.material.transparent);
      if (o instanceof THREE.Sprite || o.userData.excludeAO || transparent) {
        hidden.push(o);
        o.visible = false;
      }
    });
    try {
      super.render(renderer, write, read, dt, mask);
    } finally {
      hidden.forEach((o) => (o.visible = true));
    }
  }
}
