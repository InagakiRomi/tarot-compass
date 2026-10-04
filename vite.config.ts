import { copyFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

const docsDir = resolve("docs");

/** GitHub Pages 沒有實體路由檔時會回 404.html，複製首頁讓重新整理仍能啟動應用。 */
function githubPagesSpaFallback() {
  return {
    name: "github-pages-spa-fallback",
    apply: "build" as const,
    closeBundle() {
      copyFileSync(resolve(docsDir, "index.html"), resolve(docsDir, "404.html"));
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  base: "/tarot-compass/",
  build: {
    outDir: "docs",
    emptyOutDir: true,
  },
  plugins: [vue(), tailwindcss(), githubPagesSpaFallback()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
