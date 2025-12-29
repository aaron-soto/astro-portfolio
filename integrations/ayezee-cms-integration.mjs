/**
 * AyeZee CMS Astro Integration
 *
 * This integration automatically fetches CMS data during the Astro build process.
 * No need for separate scripts or commands - just add to astro.config.mjs
 *
 * Usage in astro.config.mjs:
 *
 * import ayezeeCms from './integrations/ayezee-cms-integration.mjs';
 *
 * export default defineConfig({
 *   integrations: [ayezeeCms()]
 * });
 */

import fs from "fs";
import path from "path";

// Load .env file manually
function loadEnvFile() {
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

export default function ayezeeCmsIntegration() {
  return {
    name: "ayezee-cms",
    hooks: {
      "astro:config:setup": async ({ config, logger }) => {
        logger.info("🚀 AyeZee CMS: Fetching data...");

        // Load environment variables from .env
        loadEnvFile();

        // Get environment variables
        const cmsDomain = process.env.PUBLIC_CMS_DOMAIN;
        const projectSlug = process.env.PUBLIC_PROJECT_SLUG;

        // Validate config
        if (!cmsDomain || !projectSlug) {
          logger.error("❌ Missing environment variables:");
          if (!cmsDomain) logger.error("   - PUBLIC_CMS_DOMAIN");
          if (!projectSlug) logger.error("   - PUBLIC_PROJECT_SLUG");
          throw new Error(
            "AyeZee CMS integration requires PUBLIC_CMS_DOMAIN and PUBLIC_PROJECT_SLUG"
          );
        }

        logger.info(`   Domain: ${cmsDomain}`);
        logger.info(`   Project: ${projectSlug}`);

        try {
          // Build API URL
          let domain = cmsDomain;
          if (!domain.startsWith("http://") && !domain.startsWith("https://")) {
            const protocol = domain.includes("localhost") ? "http" : "https";
            domain = `${protocol}://${domain}`;
          }
          const baseUrl = `${domain}/api/v1/projects/${projectSlug}`;

          // Fetch modules
          logger.info("📡 Fetching modules...");
          const modulesResponse = await fetch(`${baseUrl}/modules`);

          if (!modulesResponse.ok) {
            throw new Error(
              `API error: ${modulesResponse.status} ${modulesResponse.statusText}`
            );
          }

          const modulesResult = await modulesResponse.json();
          if (!modulesResult.success) {
            throw new Error(modulesResult.message || "Failed to fetch modules");
          }

          const modules = modulesResult.data.modules;
          logger.info(`✅ Found ${modules.length} modules`);

          // Fetch data for each module
          const modulesWithData = [];
          for (const module of modules) {
            try {
              const dataResponse = await fetch(
                `${baseUrl}/modules/${module.instanceKey}/data`
              );
              const dataResult = await dataResponse.json();

              const itemCount = dataResult.data?.pagination?.total || 0;
              logger.info(`   📦 ${module.label}: ${itemCount} items`);

              modulesWithData.push({
                id: module.id,
                instanceKey: module.instanceKey,
                label: module.label,
                slug: slugify(module.label),
                dataType: module.dataType,
                category: module.category,
                description: module.description,
                icon: module.icon,
                fields: module.fields,
                isActive: module.isActive,
                sortOrder: module.sortOrder,
                data: dataResult.data?.data || [],
                pagination: dataResult.data?.pagination || {
                  total: 0,
                  count: 0,
                },
                parameters: dataResult.data?.module?.parameters || {},
                createdAt: module.createdAt,
                updatedAt: module.updatedAt,
              });
            } catch (error) {
              logger.warn(
                `   ⚠️  Failed to fetch ${module.label}: ${error.message}`
              );
              modulesWithData.push({
                ...module,
                slug: slugify(module.label),
                data: [],
                pagination: { total: 0, count: 0 },
                parameters: {},
              });
            }
          }

          // Create cache data
          const cacheData = {
            project: modulesResult.data.project,
            modules: modulesWithData,
            fetchedAt: new Date().toISOString(),
            version: "1.0",
          };

          // Get the data directory path - handle Windows paths correctly
          const dataDir = path.join(process.cwd(), "src", "data");

          // Ensure directory exists
          if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
          }

          // Write cache file
          const cachePath = path.join(dataDir, "cms-cache.json");
          fs.writeFileSync(
            cachePath,
            JSON.stringify(cacheData, null, 2),
            "utf-8"
          );

          logger.info(
            `✅ Cached data to: ${path.relative(process.cwd(), cachePath)}`
          );
          logger.info(`📅 Fetched at: ${cacheData.fetchedAt}`);
        } catch (error) {
          logger.error("❌ Failed to fetch CMS data:");
          logger.error(`   ${error.message}`);
          throw error;
        }
      },
    },
  };
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
