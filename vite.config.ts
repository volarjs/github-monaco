import { defineConfig } from "vite";
import * as path from "path";
import pluginRewriteAll from "vite-plugin-rewrite-all";

export default defineConfig({
  optimizeDeps: {
    include: ["path-browserify"],
  },
  resolve: {
    alias: {
      path: "path-browserify",
      "vscode-uri": "vscode-uri/lib/umd",
    },
  },
  build: {
    minify: false,
    outDir: path.resolve(__dirname, "./out"),
  },
  plugins: [pluginRewriteAll()],
});
