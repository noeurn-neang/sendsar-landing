import { JsonLd } from "@/components/seo/JsonLd";
import type { BlogPost } from "@/lib/blog";
import { postSummary } from "@/lib/blog";
import { absoluteUrl } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export function ArticleJsonLd({
  post,
  imageUrl,
}: {
  post: BlogPost;
  imageUrl?: string | null;
}) {
  const slug = post.slug.current;
  const url = absoluteUrl(`/blog/${slug}`);

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Article",
            headline: post.title,
            description: postSummary(post),
            datePublished: post.publishedAt,
            author: post.author?.name
              ? { "@type": "Person", name: post.author.name }
              : { "@type": "Organization", name: siteConfig.name },
            publisher: {
              "@type": "Organization",
              name: siteConfig.name,
              logo: {
                "@type": "ImageObject",
                url: absoluteUrl("/icon.svg"),
              },
            },
            mainEntityOfPage: { "@type": "WebPage", "@id": url },
            ...(imageUrl ? { image: [imageUrl] } : {}),
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: absoluteUrl("/"),
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Blog",
                item: absoluteUrl("/blog"),
              },
              {
                "@type": "ListItem",
                position: 3,
                name: post.title,
                item: url,
              },
            ],
          },
        ],
      }}
    />
  );
}
