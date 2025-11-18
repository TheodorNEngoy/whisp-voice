import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    exclude: ["tests-e2e/**"],
    include: ["lib/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@whisp/types": path.resolve(__dirname, "../../packages/types/src"),
      "@whisp/ui": path.resolve(__dirname, "../../packages/ui/src"),
    },
  },
});
