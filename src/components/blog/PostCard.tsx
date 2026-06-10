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
    <article className="group overflow-hidden rounded-2xl border border-border bg-surface transition-shadow hover:border-brand/30 hover:shadow-md">
      <Link href={`/blog/${post.slug.current}`} className="block">
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={post.title}
            className="aspect-[16/9] w-full object-cover"
            width={640}
            height={360}
          />
        )}
        <div className="space-y-3 p-6">
          {post.category && (
            <p className="font-mono text-xs font-semibold uppercase tracking-widest text-brand">
              {post.category}
            </p>
          )}
          <h2 className="text-xl font-semibold leading-snug text-foreground group-hover:text-brand">
            {post.title}
          </h2>
          {summary && (
            <p className="line-clamp-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              {summary}
            </p>
          )}
          <p className="text-xs text-neutral-500 dark:text-neutral-500">
            {post.author?.name && <span>{post.author.name} • </span>}
            <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
            {post.readTime ? <span> • {post.readTime} min read</span> : null}
          </p>
        </div>
      </Link>
    </article>
  );
}
