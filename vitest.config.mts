import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@tpmforge/core": path.resolve(__dirname, "packages/core/src/index.ts"),
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "node",
    include: ["packages/core/test/**/*.test.ts", "src/**/*.test.ts"],
  },
});
