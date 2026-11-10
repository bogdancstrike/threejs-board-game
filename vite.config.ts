import { defineConfig } from "vite";
export default defineConfig({
  server: { host: "0.0.0.0", port: 7777, strictPort: true },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three"],
          rendering: [
            "three/addons/controls/OrbitControls.js",
            "three/addons/postprocessing/EffectComposer.js",
            "three/addons/postprocessing/UnrealBloomPass.js",
            "three/addons/loaders/GLTFLoader.js",
          ],
        },
      },
    },
  },
});
