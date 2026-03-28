// vite.config.ts
import { resolve } from "node:path";
import { defineConfig } from "file:///home/albert-dm/code/webdrops/wd-builder/node_modules/.pnpm/vite@4.5.14_@types+node@24.10.2/node_modules/vite/dist/node/index.js";
import dts from "file:///home/albert-dm/code/webdrops/wd-builder/node_modules/.pnpm/vite-plugin-dts@3.9.1_@types+node@24.10.2_rollup@4.53.3_typescript@5.9.3_vite@4.5.14_@types+node@24.10.2_/node_modules/vite-plugin-dts/dist/index.mjs";
var __vite_injected_original_dirname = "/home/albert-dm/code/webdrops/wd-builder/packages/wd-builder";
var vite_config_default = defineConfig({
  build: {
    outDir: "./dist",
    lib: {
      entry: resolve(__vite_injected_original_dirname, "./src/index.ts"),
      fileName: "index",
      formats: ["cjs", "es"]
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react-dom/client",
        "zod",
        "@webdrops/wd-ui"
      ]
    },
    emptyOutDir: true
  },
  plugins: [
    dts({
      insertTypesEntry: true
    })
  ]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9hbGJlcnQtZG0vY29kZS93ZWJkcm9wcy93ZC1idWlsZGVyL3BhY2thZ2VzL3dkLWJ1aWxkZXJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL2FsYmVydC1kbS9jb2RlL3dlYmRyb3BzL3dkLWJ1aWxkZXIvcGFja2FnZXMvd2QtYnVpbGRlci92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9hbGJlcnQtZG0vY29kZS93ZWJkcm9wcy93ZC1idWlsZGVyL3BhY2thZ2VzL3dkLWJ1aWxkZXIvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyByZXNvbHZlIH0gZnJvbSBcIm5vZGU6cGF0aFwiO1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCBkdHMgZnJvbSBcInZpdGUtcGx1Z2luLWR0c1wiO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBidWlsZDoge1xuICAgIG91dERpcjogXCIuL2Rpc3RcIixcbiAgICBsaWI6IHtcbiAgICAgIGVudHJ5OiByZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyYy9pbmRleC50c1wiKSxcbiAgICAgIGZpbGVOYW1lOiBcImluZGV4XCIsXG4gICAgICBmb3JtYXRzOiBbXCJjanNcIiwgXCJlc1wiXSxcbiAgICB9LFxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIGV4dGVybmFsOiBbXG4gICAgICAgIFwicmVhY3RcIixcbiAgICAgICAgXCJyZWFjdC1kb21cIixcbiAgICAgICAgXCJyZWFjdC1kb20vY2xpZW50XCIsXG4gICAgICAgIFwiem9kXCIsXG4gICAgICAgIFwiQHdlYmRyb3BzL3dkLXVpXCIsXG4gICAgICBdLFxuICAgIH0sXG4gICAgZW1wdHlPdXREaXI6IHRydWUsXG4gIH0sXG4gIHBsdWdpbnM6IFtcbiAgICBkdHMoe1xuICAgICAgaW5zZXJ0VHlwZXNFbnRyeTogdHJ1ZSxcbiAgICB9KSxcbiAgXSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFzVyxTQUFTLGVBQWU7QUFDOVgsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxTQUFTO0FBRmhCLElBQU0sbUNBQW1DO0FBSXpDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLE9BQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxJQUNSLEtBQUs7QUFBQSxNQUNILE9BQU8sUUFBUSxrQ0FBVyxnQkFBZ0I7QUFBQSxNQUMxQyxVQUFVO0FBQUEsTUFDVixTQUFTLENBQUMsT0FBTyxJQUFJO0FBQUEsSUFDdkI7QUFBQSxJQUNBLGVBQWU7QUFBQSxNQUNiLFVBQVU7QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxhQUFhO0FBQUEsRUFDZjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsSUFBSTtBQUFBLE1BQ0Ysa0JBQWtCO0FBQUEsSUFDcEIsQ0FBQztBQUFBLEVBQ0g7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
