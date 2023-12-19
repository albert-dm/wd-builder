import { resolve } from "path";
import { defineConfig } from "vite";
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    outDir: "./dist",
    lib: {
      entry: resolve(__dirname, "./src/index.ts"),
      fileName: "index",
      formats: ["cjs", "es"],
    },
    rollupOptions: {
      external: ["react", "react-dom", "react-dom/client"],
    },
    emptyOutDir: true,
  },
  plugins: [
    dts({
      insertTypesEntry: true,
      outputDir: 'dist/types'
    })
  ],
});