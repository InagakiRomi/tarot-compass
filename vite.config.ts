import { copyFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

const docsDir = resolve("docs");

/**
 * Tailwind 預設把 img、svg 等設成 display:block，同時又寫 vertical-align:middle。
 * block 會讓 vertical-align 失效，編輯器因此對打包後的 CSS 報警告。
 */
function stripIgnoredVerticalAlign() {
  return {
    name: "strip-ignored-vertical-align",
    apply: "build" as const,
    generateBundle(_options: unknown, bundle: Record<string, { type: string; fileName?: string; source?: string | Uint8Array }>) {
      for (const item of Object.values(bundle)) {
        if (item.type !== "asset" || !item.fileName?.endsWith(".css") || typeof item.source !== "string") {
          continue;
        }

        item.source = item.source.replace(
          /img,svg,video,canvas,audio,iframe,embed,object\{([^}]*)\}/g,
          (_match, body: string) => {
            const next = body
              .replace(/vertical-align:middle;?/g, "")
              .replace(/^;+|;+$/g, "")
              .replace(/;;+/g, ";");

            return `img,svg,video,canvas,audio,iframe,embed,object{${next}}`;
          },
        );
      }
    },
  };
}

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
  plugins: [vue(), tailwindcss(), stripIgnoredVerticalAlign(), githubPagesSpaFallback()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
