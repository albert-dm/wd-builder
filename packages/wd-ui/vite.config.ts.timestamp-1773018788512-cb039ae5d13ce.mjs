// vite.config.ts
import { resolve } from "node:path";
import { defineConfig } from "file:///home/albert-dm/code/webdrops/wd-builder/node_modules/.pnpm/vite@4.5.14_@types+node@24.10.2/node_modules/vite/dist/node/index.js";
import dts from "file:///home/albert-dm/code/webdrops/wd-builder/node_modules/.pnpm/vite-plugin-dts@3.9.1_@types+node@24.10.2_rollup@4.53.3_typescript@5.9.3_vite@4.5.14_@types+node@24.10.2_/node_modules/vite-plugin-dts/dist/index.mjs";
var __vite_injected_original_dirname = "/home/albert-dm/code/webdrops/wd-builder/packages/wd-ui";
var vite_config_default = defineConfig({
  build: {
    outDir: "./dist",
    lib: {
      entry: resolve(__vite_injected_original_dirname, "./src/index.ts"),
      fileName: "index",
      formats: ["cjs", "es"]
    },
    rollupOptions: {
      external: ["react", "react-dom", "react-dom/client", "zod"]
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9hbGJlcnQtZG0vY29kZS93ZWJkcm9wcy93ZC1idWlsZGVyL3BhY2thZ2VzL3dkLXVpXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9hbGJlcnQtZG0vY29kZS93ZWJkcm9wcy93ZC1idWlsZGVyL3BhY2thZ2VzL3dkLXVpL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL2FsYmVydC1kbS9jb2RlL3dlYmRyb3BzL3dkLWJ1aWxkZXIvcGFja2FnZXMvd2QtdWkvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyByZXNvbHZlIH0gZnJvbSBcIm5vZGU6cGF0aFwiO1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCBkdHMgZnJvbSBcInZpdGUtcGx1Z2luLWR0c1wiO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBidWlsZDoge1xuICAgIG91dERpcjogXCIuL2Rpc3RcIixcbiAgICBsaWI6IHtcbiAgICAgIGVudHJ5OiByZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyYy9pbmRleC50c1wiKSxcbiAgICAgIGZpbGVOYW1lOiBcImluZGV4XCIsXG4gICAgICBmb3JtYXRzOiBbXCJjanNcIiwgXCJlc1wiXSxcbiAgICB9LFxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIGV4dGVybmFsOiBbXCJyZWFjdFwiLCBcInJlYWN0LWRvbVwiLCBcInJlYWN0LWRvbS9jbGllbnRcIiwgXCJ6b2RcIl0sXG4gICAgfSxcbiAgICBlbXB0eU91dERpcjogdHJ1ZSxcbiAgfSxcbiAgcGx1Z2luczogW1xuICAgIGR0cyh7XG4gICAgICBpbnNlcnRUeXBlc0VudHJ5OiB0cnVlLFxuICAgIH0pLFxuICBdLFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXVWLFNBQVMsZUFBZTtBQUMvVyxTQUFTLG9CQUFvQjtBQUM3QixPQUFPLFNBQVM7QUFGaEIsSUFBTSxtQ0FBbUM7QUFJekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsT0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLElBQ1IsS0FBSztBQUFBLE1BQ0gsT0FBTyxRQUFRLGtDQUFXLGdCQUFnQjtBQUFBLE1BQzFDLFVBQVU7QUFBQSxNQUNWLFNBQVMsQ0FBQyxPQUFPLElBQUk7QUFBQSxJQUN2QjtBQUFBLElBQ0EsZUFBZTtBQUFBLE1BQ2IsVUFBVSxDQUFDLFNBQVMsYUFBYSxvQkFBb0IsS0FBSztBQUFBLElBQzVEO0FBQUEsSUFDQSxhQUFhO0FBQUEsRUFDZjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsSUFBSTtBQUFBLE1BQ0Ysa0JBQWtCO0FBQUEsSUFDcEIsQ0FBQztBQUFBLEVBQ0g7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
