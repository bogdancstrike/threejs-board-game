import { defineConfig } from "vite";
import istanbul from "vite-plugin-istanbul";
export default defineConfig({
  plugins:
    process.env.VITE_COVERAGE === "true"
      ? [
          istanbul({
            include: "src/**/*.ts",
            exclude: ["node_modules/**", "tests/**"],
            requireEnv: true,
            checkProd: true,
          }),
        ]
      : [],
  server: {
    host: "0.0.0.0",
    port: 7777,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        ws: true,
        changeOrigin: false,
      },
    },
  },
  build: {
    rollupOptions: {
      input: { main: "index.html", preview: "scripts/preview-stage.html" },
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
