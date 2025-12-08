import { type ClassValue, clsx } from "clsx";

import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs));
}

export function getAllTags(posts: any[]): string[] {
  const tagSet = new Set<string>();
  posts.forEach((post) => {
    if (post.data?.tags && Array.isArray(post.data.tags)) {
      post.data.tags.forEach((tag: string) => tagSet.add(tag));
    }
  });
  return Array.from(tagSet).sort();
}
