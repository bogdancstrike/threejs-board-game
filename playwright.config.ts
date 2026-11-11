import { defineConfig } from "@playwright/test";
const coverage = process.env.COVERAGE === "true";
const baseURL =
  process.env.E2E_URL ||
  (coverage ? "http://localhost:7779" : "http://localhost:7777");
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 90000,
  workers: 1,
  use: {
    baseURL,
    viewport: { width: 1280, height: 900 },
    launchOptions: {
      args: [
        "--no-sandbox",
        "--enable-webgl",
        "--use-gl=angle",
        "--use-angle=swiftshader",
        "--enable-unsafe-swiftshader",
      ],
    },
  },
  webServer: {
    command: coverage
      ? "VITE_COVERAGE=true npm run dev -- --port 7779 --strictPort"
      : "npm run dev",
    url: baseURL,
    reuseExistingServer: !coverage,
  },
  reporter: "list",
});
