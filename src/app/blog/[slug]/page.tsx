import Link from "next/link";

import { AuthorCard } from "@/components/blog/AuthorCard";
import { PortableTextBody } from "@/components/blog/PortableTextBody";
import { PostHeader } from "@/components/blog/PostHeader";
import { PostHeroImage } from "@/components/blog/PostHeroImage";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { ArticleJsonLd } from "@/components/seo/ArticleJsonLd";
import { extractHeadings, postSummary } from "@/lib/blog";
import { fetchPost, fetchPostSlugs } from "@/lib/posts";
import { createMetadata } from "@/lib/seo";
import { ogImageUrl } from "@/lib/sanity-image";

export async function generateStaticParams() {
  const posts = await fetchPostSlugs();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await fetchPost(slug);

  if (!post) {
    return createMetadata({
      title: "Post not found",
      path: `/blog/${slug}`,
      noIndex: true,
    });
  }

  const title = post.seo?.metaTitle || post.title;
  const description = post.seo?.metaDescription || postSummary(post);
  const image = post.image ? ogImageUrl(post.image) : null;

  return createMetadata({
    title,
    description,
    path: `/blog/${post.slug.current}`,
    image,
    keywords: post.seo?.keywords,
    openGraphType: "article",
    publishedTime: post.publishedAt,
    authors: post.author?.name ? [post.author.name] : undefined,
  });
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await fetchPost(slug);

  if (!post) {
    return (
      <main className="container mx-auto min-h-screen max-w-4xl px-6 py-16">
        <p>Post not found.</p>
        <Link
          href="/blog"
          className="mt-4 inline-block text-brand hover:underline"
        >
          ← Back to blog
        </Link>
      </main>
    );
  }

  const headings = extractHeadings(post.body);
  const imageUrl = post.image ? ogImageUrl(post.image) : null;

  return (
    <main className="container mx-auto min-h-screen max-w-6xl px-6 py-10 sm:py-16">
      <ArticleJsonLd post={post} imageUrl={imageUrl} />

      <Link
        href="/blog"
        className="mb-8 inline-flex text-sm text-neutral-500 transition-colors hover:text-brand"
      >
        ← Back to blog
      </Link>

      <PostHeader
        category={post.category}
        title={post.title}
        subtitle={post.subtitle}
        authorName={post.author?.name}
        publishedAt={post.publishedAt}
        readTime={post.readTime}
      />

      {post.image && <PostHeroImage image={post.image} alt={post.title} />}

      {headings.length > 0 && (
        <div className="mb-10 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 lg:hidden dark:border-neutral-800 dark:bg-neutral-900">
          <TableOfContents headings={headings} />
        </div>
      )}

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_220px]">
        <article>
          {Array.isArray(post.body) && post.body.length > 0 ? (
            <PortableTextBody value={post.body} />
          ) : (
            <p className="text-neutral-500">No content yet.</p>
          )}
          <AuthorCard author={post.author} />
        </article>

        {headings.length > 0 && (
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <TableOfContents headings={headings} />
            </div>
          </aside>
        )}
      </div>
    </main>
  );
}
