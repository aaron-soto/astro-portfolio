/**
 * AyeZee CMS Astro Integration (Bootstrap)
 *
 * Fetches all CMS data and utility files from the dashboard's /sdk endpoint.
 * Replaces the ayezee-astro-cms npm package — no more version bumps or publishes.
 *
 * Files written to src/data/:
 *   cms-cache.json, cms-types.ts, cms.ts, cms-helper.ts,
 *   form-handler.ts, cloudinary-utils.ts, business-hours-utils.ts,
 *   AyezeeForm.astro
 */

import fs from "fs";
import path from "path";
import type { AstroIntegration } from "astro";

export interface AyezeeCmsOptions {
  cmsDomain?: string;
  projectSlug?: string;
  apiKey?: string;
  outputDir?: string;
  skipOnError?: boolean;
  enableAnalytics?: boolean;
}

/**
 * Load environment variables from .env file
 */
function loadEnvFile(): void {
  const envPath = path.join(process.cwd(), ".env");

  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    const lines = envContent.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, "");
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }
}

export function ayezeeCms(options: AyezeeCmsOptions = {}): AstroIntegration {
  return {
    name: "ayezee-cms",
    hooks: {
      "astro:config:setup": async ({ logger, injectScript }) => {
        logger.info("🚀 AyeZee CMS: Fetching SDK...");

        // Load environment variables from .env
        loadEnvFile();

        // Get configuration
        const cmsDomain = options.cmsDomain || process.env.PUBLIC_CMS_DOMAIN;
        const projectSlug =
          options.projectSlug || process.env.PUBLIC_PROJECT_SLUG;
        const apiKey = options.apiKey || process.env.PUBLIC_AYEZEE_API_KEY;
        const outputDir = options.outputDir || "src/data";
        const skipOnError = options.skipOnError || false;
        const enableAnalytics = options.enableAnalytics !== false;

        // Validate config
        if (!cmsDomain || !projectSlug) {
          logger.error("❌ Missing PUBLIC_CMS_DOMAIN or PUBLIC_PROJECT_SLUG");
          if (skipOnError) {
            logger.warn("⚠️  Skipping CMS fetch (skipOnError: true)");
            return;
          }
          throw new Error(
            "AyeZee CMS requires PUBLIC_CMS_DOMAIN and PUBLIC_PROJECT_SLUG"
          );
        }

        logger.info(`   Domain: ${cmsDomain}`);
        logger.info(`   Project: ${projectSlug}`);

        const dataDir = path.join(process.cwd(), outputDir);
        const cachePath = path.join(dataDir, "cms-cache.json");

        // Dev mode: skip fetch if cache exists (use CMS_FRESH=true to force)
        const isDev =
          process.env.NODE_ENV === "development" ||
          (process.env.NODE_ENV as string) !== "production";
        const forceFresh = process.env.CMS_FRESH === "true";
        const cacheExists = fs.existsSync(cachePath);

        if (isDev && cacheExists && !forceFresh) {
          logger.info("");
          logger.info("📦 Using cached CMS data (dev mode)");
          logger.info("   Run with CMS_FRESH=true to fetch fresh data");
          logger.info("");

          // Still inject analytics from cached data
          if (enableAnalytics) {
            try {
              const existingCache = JSON.parse(
                fs.readFileSync(cachePath, "utf-8")
              );
              if (existingCache.analytics) {
                injectScript(
                  "head-inline",
                  `
                  (function() {
                    var script = document.createElement('script');
                    script.defer = true;
                    script.src = '${existingCache.analytics.baseUrl}/script.js';
                    script.setAttribute('data-website-id', '${existingCache.analytics.websiteId}');
                    document.head.appendChild(script);
                  })();
                  `
                );
                logger.info("📊 Umami analytics script injected from cache");
              }
            } catch {
              // Ignore errors reading cache for analytics
            }
          }

          return;
        }

        try {
          // Build API URL
          let domain = cmsDomain;
          if (
            !domain.startsWith("http://") &&
            !domain.startsWith("https://")
          ) {
            const protocol = domain.includes("localhost") ? "http" : "https";
            domain = `${protocol}://${domain}`;
          }

          const sdkUrl = `${domain}/api/v1/projects/${projectSlug}/sdk`;
          logger.info(`📡 Fetching SDK from ${sdkUrl}...`);

          const response = await fetch(sdkUrl, {
            headers: {
              ...(apiKey && { Authorization: `Bearer ${apiKey}` }),
            },
          });

          if (!response.ok) {
            throw new Error(
              `SDK fetch failed: ${response.status} ${response.statusText}`
            );
          }

          const result: any = await response.json();
          if (!result.success) {
            throw new Error(result.message || "Failed to fetch SDK");
          }

          const { files, analytics } = result.data;

          // Ensure output directory exists
          if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
          }

          // Write all files
          let fileCount = 0;
          for (const [fileName, content] of Object.entries(files)) {
            const filePath = path.join(dataDir, fileName);
            fs.writeFileSync(filePath, content as string, "utf-8");
            fileCount++;
          }

          logger.info(`✅ Wrote ${fileCount} files to ${outputDir}/`);

          // Inject Umami analytics if configured
          if (enableAnalytics && analytics) {
            injectScript(
              "head-inline",
              `
              (function() {
                var script = document.createElement('script');
                script.defer = true;
                script.src = '${analytics.baseUrl}/script.js';
                script.setAttribute('data-website-id', '${analytics.websiteId}');
                document.head.appendChild(script);
              })();
              `
            );
            logger.info("📊 Umami analytics script injected");
          }

          logger.info("");
          logger.info("🎉 AyeZee CMS SDK fetched successfully!");
          logger.info("");
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";

          logger.error("");
          logger.error("❌ Failed to fetch CMS SDK");
          logger.error(`   Error: ${errorMessage}`);
          logger.error("");

          if (skipOnError) {
            logger.warn(
              "⚠️  Continuing with cached data (skipOnError: true)"
            );
            return;
          }

          throw error;
        }
      },
    },
  };
}

export default ayezeeCms;
