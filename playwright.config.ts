import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 90000,
  workers: 1,
  use: {
    baseURL: "http://localhost:7777",
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
    command: "npm run dev",
    url: "http://localhost:7777",
    reuseExistingServer: true,
  },
  reporter: "list",
});
