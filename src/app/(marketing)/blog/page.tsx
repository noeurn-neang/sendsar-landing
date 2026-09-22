import { PostCard } from "@/components/blog/PostCard";
import { fetchPosts } from "@/lib/posts";
import { createMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata = createMetadata({
  title: "Blog",
  description:
    "Product updates, tutorials, and headless chat API comparisons from the Sendsar team.",
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
    <div
      style={{
        backgroundColor: "rgb(var(--bs-body-bg-rgb))",
      }}
    >
      {/* Blog Hero Masthead */}
      <section
        className="relative overflow-hidden pt-32 sm:pt-36 lg:pt-40 pb-16 lg:pb-20"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(var(--bs-body-bg-rgb), .01), rgba(var(--bs-body-bg-rgb), 1) 85%), radial-gradient(ellipse at top left, rgba(var(--bs-primary-rgb), .35), transparent 50%), radial-gradient(ellipse at top right, rgba(var(--bd-accent-rgb), .35), transparent 50%), radial-gradient(ellipse at center right, rgba(var(--bd-violet-rgb), .35), transparent 50%), radial-gradient(ellipse at center left, rgba(var(--bd-pink-rgb), .35), transparent 50%)",
        }}
      >
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#0096c8]/20 bg-[#0096c8]/10 px-3.5 py-1 text-xs font-semibold text-[#0096c8] dark:text-[#38bdf8]">
            <span>Engineering & Product Blog</span>
          </div>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Ideas, tips, and stories
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 dark:text-slate-300 sm:text-lg">
            Product updates, tutorials, and announcements from the {siteConfig.name} team.
          </p>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          {posts.length === 0 ? (
            <div className="mx-auto max-w-md rounded-2xl border border-slate-200/80 bg-white/70 p-12 text-center backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/50">
              <p className="text-base font-semibold text-foreground">No posts published yet</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Check back soon for tutorials, architecture deep dives, and announcements.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Community / Telegram Callout */}
      <section className="py-16 sm:py-20 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200/80 bg-white/80 p-8 sm:p-12 shadow-xl shadow-black/5 backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/60">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Stay in the loop
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm text-slate-600 dark:text-slate-400">
              Join engineers on Telegram for real-time release notes, developer discussion, and support.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <a
                href={siteConfig.contactTelegram}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-bd-primary inline-flex items-center justify-center gap-2 w-full sm:w-auto px-7 py-2.5 text-center text-xs font-semibold text-white shadow-lg shadow-[#0096c8]/20 hover:bg-[#007ba4]"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .37z" />
                </svg>
                <span>Telegram Community</span>
              </a>

              <a
                href={siteConfig.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-slate-300/80 bg-white/80 px-6 py-2.5 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur transition hover:border-slate-400 hover:bg-white hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <span>Read Documentation</span>
                <span>→</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
