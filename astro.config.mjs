// @ts-check

import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import ayezeeCMS from "./integrations/ayezee-cms-integration.mjs";

// https://astro.build/config
export default defineConfig({
  site: "https://aaronsoto.io",
  integrations: [ayezeeCMS(), react(), mdx(), sitemap()],
  trailingSlash: "never",
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
