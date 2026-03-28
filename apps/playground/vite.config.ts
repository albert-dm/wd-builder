import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 3000,
    open: true,
  },
  resolve: {
    alias: {
      "@webdrops/wd-builder": resolve(__dirname, "../../packages/wd-builder/src/index.ts"),
      "@webdrops/wd-ui": resolve(__dirname, "../../packages/wd-ui/src/index.ts"),
    },
  },
});
