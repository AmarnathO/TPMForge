import type { ComponentType } from "react";
import { roadmapPost, resumeMappingPost, firstTpmRolePost } from "@/content/posts";

export type PostMeta = {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  readingMinutes: number;
};

export type Post = {
  meta: PostMeta;
  Component: ComponentType;
};

const posts: Post[] = [
  { meta: firstTpmRolePost.meta, Component: firstTpmRolePost.default },
  { meta: resumeMappingPost.meta, Component: resumeMappingPost.default },
  { meta: roadmapPost.meta, Component: roadmapPost.default },
];

export function getAllPosts(): Post[] {
  return [...posts].sort(
    (a, b) => new Date(b.meta.date).getTime() - new Date(a.meta.date).getTime()
  );
}

export function getPostBySlug(slug: string): Post | undefined {
  return posts.find((p) => p.meta.slug === slug);
}
