import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["src/**/*.{spec,test}.{ts,tsx}"],
    setupFiles: [resolve(__dirname, "vitest.setup.ts")],
    reporters: ["default"],
    coverage: {
      enabled: true,
      provider: "v8",
      reportsDirectory: "coverage",
      include: [
        "src/lib/**/*.{ts,tsx}",
        "src/schema/**/*.{ts,tsx}",
        "src/store/**/*.{ts,tsx}"
      ],
      thresholds: {
        lines: 65,
        statements: 65,
        functions: 55,
        branches: 45
      }
    }
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src")
    }
  }
});
