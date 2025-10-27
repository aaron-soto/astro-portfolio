import { defineCollection, z } from "astro:content";

import { glob } from "astro/loaders";

const blogCollection = defineCollection({
  // Load Markdown and MDX files in the `src/content/blog/` directory.
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
  // Type-check frontmatter using a schema
  schema: z.object({
    title: z.string(),
    description: z.string(),
    // Transform string to Date object
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    heroAlt: z.string().optional(),
    tags: z.array(z.string()).optional().default([]),
    slug: z.string(),
  }),
});

const workCollection = defineCollection({
  // Load Markdown and MDX files in the `src/content/work/` directory.
  loader: glob({ base: "./src/content/work", pattern: "**/*.{md,mdx}" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      slug: z.string(),
      description: z.string(),
      tags: z.array(z.string()).optional(),
      logo: z.string(),
      url: z.string().optional(),
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
    }),
});

export const collections = {
  work: workCollection,
  blog: blogCollection,
};
