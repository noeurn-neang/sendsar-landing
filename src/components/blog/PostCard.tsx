import Link from "next/link";

import { formatPostDate, postSummary, type BlogPost } from "@/lib/blog";
import { urlFor } from "@/lib/sanity-image";

type PostCardProps = {
  post: BlogPost;
};

export function PostCard({ post }: PostCardProps) {
  const imageUrl = post.image
    ? urlFor(post.image)?.width(640).height(360).url()
    : null;
  const summary = postSummary(post);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white/70 shadow-sm backdrop-blur transition-all duration-300 hover:border-[#0096c8]/50 hover:shadow-xl hover:shadow-[#0096c8]/5 hover:-translate-y-1 dark:border-slate-800/80 dark:bg-slate-900/50 dark:hover:border-[#0096c8]/30">
      <Link href={`/blog/${post.slug.current}`} className="flex flex-col h-full">
        {imageUrl ? (
          <div className="aspect-[16/9] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={post.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              width={640}
              height={360}
            />
          </div>
        ) : (
          <div className="aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-[#0096c8]/10 via-slate-100 to-slate-200 dark:from-[#0096c8]/20 dark:via-slate-900 dark:to-slate-850 flex items-center justify-center">
            <svg
              className="h-10 w-10 text-slate-400/60 dark:text-slate-600 transition-transform duration-500 group-hover:scale-110"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
        )}

        <div className="flex flex-col flex-1 justify-between p-6 sm:p-7">
          <div className="space-y-3">
            {post.category ? (
              <span className="inline-block rounded-full border border-[#0096c8]/20 bg-[#0096c8]/10 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-[#0096c8] dark:text-[#38bdf8]">
                {post.category}
              </span>
            ) : null}

            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-[#0096c8] dark:group-hover:text-[#38bdf8] leading-snug">
              {post.title}
            </h2>

            {summary ? (
              <p className="line-clamp-3 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {summary}
              </p>
            ) : null}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5 flex-wrap">
              {post.author?.name ? <span>{post.author.name} · </span> : null}
              <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
              {post.readTime ? <span> · {post.readTime} min read</span> : null}
            </div>

            <span className="font-semibold text-[#0096c8] dark:text-[#38bdf8] group-hover:translate-x-0.5 transition-transform">
              →
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
