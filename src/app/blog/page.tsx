import { PostCard } from "@/components/blog/PostCard";
import { fetchPosts } from "@/lib/posts";
import { createMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata = createMetadata({
  title: "Blog",
  description:
    "Product updates, tutorials, and headless chat API comparisons from the Flash Chat team.",
  path: "/blog",
  keywords: [
    "chat API blog",
    "headless chat tutorials",
    "CometChat comparison",
    "messaging API guides",
  ],
});

export default async function BlogIndexPage() {
  const posts = await fetchPosts();

  return (
    <main className="container mx-auto min-h-screen max-w-6xl px-6 py-10 sm:py-16">
      <header className="mb-12 max-w-2xl space-y-3">
        <p className="font-mono text-xs font-semibold uppercase tracking-widest text-brand">
          Blog
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Ideas, tips, and stories
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400">
          Product updates, tutorials, and announcements from the {siteConfig.name}{" "}
          team.
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="text-neutral-500">No posts yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </main>
  );
}
