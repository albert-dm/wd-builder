import { resolve } from "node:path";
import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

export default defineConfig({
  server: {
    port: 3010,
  },
  resolve: {
    alias: {
      "@webdrops/auth-core": resolve(__dirname, "../../packages/auth-core/src/index.ts"),
      "@webdrops/payments-core": resolve(__dirname, "../../packages/payments-core/src/index.ts"),
      "@webdrops/tarot-ai": resolve(__dirname, "../../packages/tarot-ai/src/index.ts"),
      "@webdrops/tarot-core": resolve(__dirname, "../../packages/tarot-core/src/index.ts"),
      "@webdrops/tarot-db": resolve(__dirname, "../../packages/tarot-db/src/index.ts")
    }
  },
  plugins: [tanstackStart(), viteReact()],
});