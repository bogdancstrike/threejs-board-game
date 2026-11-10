import * as THREE from "three";
/** PBR water with a shared time uniform: flow, foam and normal perturbation run on the GPU. */
export function waterMaterial(color: string, waterfall = false, lava = false) {
  const uniforms = { time: { value: 0 } };
  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness: lava ? 0.55 : 0.27,
    metalness: lava ? 0 : 0.25,
    emissive: color,
    emissiveIntensity: lava ? 1.25 : waterfall ? 0.32 : 0.12,
    side: THREE.DoubleSide,
    transparent: waterfall,
    opacity: waterfall ? 0.86 : 1,
  });
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.waterTime = uniforms.time;
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\nvarying vec3 vFlowPosition;",
      )
      .replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\nvFlowPosition=position;",
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>\nuniform float waterTime;varying vec3 vFlowPosition;`,
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
 float f=sin(vFlowPosition.${waterfall ? "y" : "z"}*${waterfall ? "8." : "5."}-waterTime*${waterfall ? "6." : "1.8"}+sin(vFlowPosition.x*8.+waterTime)*.7);
 float fine=sin(vFlowPosition.x*34.+vFlowPosition.${waterfall ? "y" : "z"}*13.-waterTime*4.);
 float foam=smoothstep(.83,1.,f)*(.35+.3*fine);
 diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*1.2+vec3(${lava ? ".2,.07,0." : ".3,.48,.5"}),foam*.55);
 `,
      )
      .replace(
        "#include <normal_fragment_maps>",
        `#include <normal_fragment_maps>\nnormal=normalize(normal+vec3(sin(vFlowPosition.x*10.+waterTime)*.13,0.,cos(vFlowPosition.z*7.-waterTime)*.1));`,
      );
  };
  mat.customProgramCacheKey = () => `flow-${waterfall}-${lava}`;
  return {
    material: mat,
    update: (t: number) => {
      uniforms.time.value = t;
    },
  };
}
