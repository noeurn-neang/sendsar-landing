import type { MetadataRoute } from "next";

import { fetchPostSlugs } from "@/lib/posts";
import { absoluteUrl } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await fetchPostSlugs();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: siteConfig.docsUrl.replace(/\/$/, ""), lastModified: now, changeFrequency: "weekly", priority: 0.95 },
    { url: siteConfig.quickstartUrl, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/pricing"), lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/blog"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
  ];

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: absoluteUrl(`/blog/${post.slug}`),
    lastModified: post.publishedAt ? new Date(post.publishedAt) : now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...postRoutes];
}
