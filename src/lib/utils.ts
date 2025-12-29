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

export function getAllCategories(posts: any[]): string[] {
  const categorySet = new Set<string>();
  posts.forEach((post) => {
    if (post.data?.category) {
      categorySet.add(post.data.category);
    }
  });
  return Array.from(categorySet).sort();
}

// Helper function to safely create a date
export function safeDate(dateValue: any, fallback: string = new Date().toISOString()): Date {
  if (!dateValue) return new Date(fallback);
  const date = new Date(dateValue);
  return isNaN(date.getTime()) ? new Date(fallback) : date;
}
