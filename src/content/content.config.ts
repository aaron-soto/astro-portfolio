import { defineCollection, z } from "astro:content";

const workCollection = defineCollection({
  type: "content",
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
};
