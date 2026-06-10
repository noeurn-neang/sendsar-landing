import { urlFor } from "@/lib/sanity-image";
import type { BlogAuthor } from "@/lib/blog";

type AuthorCardProps = {
  author?: BlogAuthor;
};

export function AuthorCard({ author }: AuthorCardProps) {
  if (!author?.name) return null;

  const avatarUrl = author.avatar
    ? urlFor(author.avatar)?.width(80).height(80).url()
    : null;

  return (
    <section className="mt-16 border-t border-neutral-200 pt-10 dark:border-neutral-800">
      <div className="flex items-start gap-4">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={author.name}
            className="h-14 w-14 rounded-full object-cover"
            width={56}
            height={56}
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 text-lg font-semibold text-brand">
            {author.name.charAt(0)}
          </div>
        )}
        <div className="space-y-2">
          <div>
            <p className="font-semibold text-foreground">{author.name}</p>
            {author.role && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {author.role}
              </p>
            )}
          </div>
          {author.bio && (
            <p className="max-w-2xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              {author.bio}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
