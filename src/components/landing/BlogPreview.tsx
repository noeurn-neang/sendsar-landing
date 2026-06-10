import Link from "next/link";

import { PostCard } from "@/components/blog/PostCard";
import { fetchPosts } from "@/lib/posts";

export async function BlogPreview() {
  const posts = await fetchPosts(3);

  if (posts.length === 0) return null;

  return (
    <section className="border-t border-border py-20">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-brand">
              Blog
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              Notes for platform builders
            </h2>
          </div>
          <Link
            href="/blog"
            className="text-sm font-semibold text-brand hover:text-brand-strong"
          >
            All posts →
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
