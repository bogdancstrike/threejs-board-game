/** Display-space colour grade: saturation, contrast and a soft vignette. */
export const GradeShader = {
  name: "WilderGradeShader",
  uniforms: {
    tDiffuse: { value: null },
    saturation: { value: 1 },
    contrast: { value: 1 },
    vignette: { value: 0 },
  },
  vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader: `uniform sampler2D tDiffuse;uniform float saturation;uniform float contrast;uniform float vignette;varying vec2 vUv;
void main(){vec4 c=texture2D(tDiffuse,vUv);float l=dot(c.rgb,vec3(.2126,.7152,.0722));vec3 g=mix(vec3(l),c.rgb,saturation);g=(g-.5)*contrast+.5;vec2 d=vUv-.5;float v=1.-smoothstep(.35,.9,length(d*vec2(1.15,1.)))*vignette;gl_FragColor=vec4(clamp(g*v,0.,1.),c.a);}`,
};
