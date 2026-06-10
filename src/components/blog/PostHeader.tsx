import { formatPostDate } from "@/lib/blog";

type PostHeaderProps = {
  category?: string;
  title: string;
  subtitle?: string;
  authorName?: string;
  publishedAt: string;
  readTime?: number;
};

export function PostHeader({
  category,
  title,
  subtitle,
  authorName,
  publishedAt,
  readTime,
}: PostHeaderProps) {
  return (
    <header className="mb-10 space-y-5">
      {category && (
        <p className="font-mono text-xs font-semibold uppercase tracking-widest text-brand">
          {category}
        </p>
      )}
      <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
        {title}
      </h1>
      {subtitle && (
        <p className="max-w-3xl text-lg leading-relaxed text-neutral-600 dark:text-neutral-400 sm:text-xl">
          {subtitle}
        </p>
      )}
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        {authorName && <span>{authorName}</span>}
        {authorName && <span className="mx-2">•</span>}
        <time dateTime={publishedAt}>{formatPostDate(publishedAt)}</time>
        {readTime ? <span> • {readTime} min read</span> : null}
      </p>
    </header>
  );
}
