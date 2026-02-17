// @ts-check

import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { ayezeeCms } from "./src/integrations/ayezee-cms.ts";

// https://astro.build/config
export default defineConfig({
  site: "https://aaronsoto.io",
  integrations: [ayezeeCms(), react(), mdx(), sitemap()],
  trailingSlash: "never",
  markdown: {
    shikiConfig: {
      theme: "github-dark",
      wrap: true,
    },
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks: {
            "react-vendor": ["react", "react-dom"],
            "motion-vendor": ["framer-motion"],
          },
        },
      },
    },
  },
});
