import { defineConfig } from "vite";
import * as path from "path";
import { externalCjsToEsmPlugin } from "./plugin";
import { externals } from "./config";

export default defineConfig({
  optimizeDeps: {
    exclude: externals,
    esbuildOptions: {
      plugins: [externalCjsToEsmPlugin(externals)],
    },
  },
  resolve: {
    alias: {
      path: "path-browserify",
    },
  },
  build: {
    minify: false,
    lib: {
      entry: path.resolve(__dirname, "../src/volar.worker.ts"),
      formats: ["es"],
      name: "volar.worker.js",
    },
    sourcemap: false,
    outDir: path.resolve(__dirname, "../dist/worker"),
    rollupOptions: {
      output: {
        format: "es",
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
      },
      external: externals,
    },
  },
});
