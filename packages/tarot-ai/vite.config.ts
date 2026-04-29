import { resolve } from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    outDir: "./dist",
    lib: {
      entry: resolve(__dirname, "./src/index.ts"),
      fileName: "index",
      formats: ["cjs", "es"],
    },
    rollupOptions: {
      external: ["zod", "@webdrops/tarot-core"],
    },
    emptyOutDir: true,
  },
  plugins: [dts({ insertTypesEntry: true })],
});