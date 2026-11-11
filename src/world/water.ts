import * as THREE from "three";
/** Layered flowing noise, broken foam and Fresnel highlights on lit PBR water. */
export function waterMaterial(color: string, waterfall = false, lava = false) {
  const uniforms = {
    time: { value: 0 },
    speed: { value: 1 },
    foam: { value: 1 },
  };
  const mat = new THREE.MeshPhysicalMaterial({
    color,
    roughness: lava ? 0.5 : 0.19,
    metalness: 0,
    clearcoat: lava ? 0.15 : 1,
    clearcoatRoughness: 0.14,
    ior: 1.333,
    emissive: color,
    emissiveIntensity: lava ? 1.2 : 0.035,
    side: THREE.DoubleSide,
    transparent: waterfall,
    opacity: waterfall ? 0.82 : 1,
    depthWrite: !waterfall,
  });
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.waterTime = uniforms.time;
    shader.uniforms.waterSpeed = uniforms.speed;
    shader.uniforms.waterFoam = uniforms.foam;
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
      uniform float waterTime;uniform float waterSpeed;varying vec3 vFlowPosition;varying vec2 vWaterUv;`,
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        vFlowPosition=position;vWaterUv=uv;
        ${waterfall ? "transformed.z+=sin(position.y*5.+waterTime*waterSpeed*4.+position.x*11.)*.025;" : "transformed.y+=sin(position.x*5.+position.z*3.-waterTime*waterSpeed*1.7)*.016;"}
      `,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
      uniform float waterTime;uniform float waterSpeed;uniform float waterFoam;
      varying vec3 vFlowPosition;varying vec2 vWaterUv;
      float waterHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float waterNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(waterHash(i),waterHash(i+vec2(1,0)),f.x),mix(waterHash(i+vec2(0,1)),waterHash(i+vec2(1,1)),f.x),f.y);}
      float waterFbm(vec2 p){return waterNoise(p)*.57+waterNoise(p*2.13)*.28+waterNoise(p*4.37)*.15;}
    `,
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
      float flowTime=waterTime*waterSpeed;
      vec2 flowUv=${waterfall ? "vec2(vWaterUv.x*6.,vFlowPosition.y*.85+flowTime*1.8)" : "vFlowPosition.xz*.75-vec2(0.,flowTime*.22)"};
      float turbulence=waterFbm(flowUv);
      float fineFlow=waterFbm(flowUv*vec2(3.7,.55)+vec2(.2,flowTime*.5));
      float foamLine=smoothstep(.58,.83,turbulence*.65+fineFlow*.55)*waterFoam;
      ${
        waterfall
          ? `float edge=smoothstep(0.,.09,vWaterUv.x)*smoothstep(0.,.09,1.-vWaterUv.x);
        float impact=pow(1.-vWaterUv.y,3.);
        foamLine=clamp(foamLine+impact*.5*waterFoam,0.,.95);
        diffuseColor.a*=edge*(.5+.5*turbulence);
        diffuseColor.rgb*=.8+fineFlow*.45;`
          : "diffuseColor.rgb*=.86+turbulence*.25;"
      }
      diffuseColor.rgb=mix(diffuseColor.rgb,vec3(${lava ? "1.,.4,.04" : ".85,.96,1."}),foamLine*.8);
    `,
      )
      .replace(
        "#include <normal_fragment_maps>",
        `#include <normal_fragment_maps>
      normal=normalize(normal+vec3(sin(flowUv.x*8.+turbulence*5.)*.12,0.,cos(flowUv.y*11.+fineFlow*4.)*.13));
    `,
      );
  };
  mat.customProgramCacheKey = () => `cinematic-water-${waterfall}-${lava}`;
  return {
    material: mat,
    update: (t: number) => {
      uniforms.time.value = t;
    },
    configure: (speed: number, foam: number) => {
      uniforms.speed.value = speed;
      uniforms.foam.value = foam;
    },
  };
}
