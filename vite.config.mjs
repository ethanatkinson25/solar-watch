import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  root: resolve(import.meta.dirname, "src"),
  publicDir: resolve(import.meta.dirname, "public"),
  base: "./",
  build: {
    outDir: resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "src/index.html"),
        store: resolve(import.meta.dirname, "src/store/index.html"),
        tours: resolve(import.meta.dirname, "src/tours/index.html"),
        news: resolve(import.meta.dirname, "src/news/index.html"),
        mars: resolve(import.meta.dirname, "src/mars/index.html"),
        gallery: resolve(import.meta.dirname, "src/gallery/index.html")
      },
    },
  },
  server: {
    host: "localhost",
    port: 5173,
  },
  preview: {
    host: "localhost",
    port: 4173,
  },
});