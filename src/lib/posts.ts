import type { BlogPost } from "@/lib/blog";
import {
  POST_QUERY,
  POST_SLUGS_QUERY,
  postsQuery,
  REVALIDATE_OPTIONS,
} from "@/lib/queries";
import { client } from "@/sanity/client";

export type PostSlug = {
  slug: string;
  publishedAt?: string;
};

export async function fetchPosts(limit = 12) {
  return client.fetch<BlogPost[]>(
    postsQuery(limit),
    {},
    REVALIDATE_OPTIONS,
  );
}

export async function fetchPost(slug: string) {
  return client.fetch<BlogPost | null>(
    POST_QUERY,
    { slug },
    REVALIDATE_OPTIONS,
  );
}

export async function fetchPostSlugs() {
  try {
    return await client.fetch<PostSlug[]>(
      POST_SLUGS_QUERY,
      {},
      REVALIDATE_OPTIONS,
    );
  } catch {
    return [];
  }
}
