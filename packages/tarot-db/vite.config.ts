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
      external: [
        "drizzle-orm",
        "drizzle-orm/pg-core",
        "@webdrops/auth-core",
        "@webdrops/payments-core",
        "@webdrops/tarot-core",
        "zod"
      ],
    },
    emptyOutDir: true,
  },
  plugins: [dts({ insertTypesEntry: true })],
});