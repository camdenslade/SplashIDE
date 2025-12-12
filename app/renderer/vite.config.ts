import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],

  resolve: {
    dedupe: ["react", "react-dom"],
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@src": path.resolve(__dirname, "../src"),
    },
  },

  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "monaco-editor/esm/vs/editor/editor.api"
    ]
  },

  server: {
    fs: {
      allow: [".."]
    }
  },

  build: {
    outDir: "../dist-ts/renderer",
    emptyOutDir: true,
    sourcemap: process.env.NODE_ENV === "development",
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
      },
    },
  },
});
