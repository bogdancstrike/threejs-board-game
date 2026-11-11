import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "istanbul",
      include: ["src/**/*.ts"],
      reportsDirectory: "coverage/unit",
      reporter: ["text", "json"],
      exclude: ["src/**/*.d.ts"],
    },
  },
});
