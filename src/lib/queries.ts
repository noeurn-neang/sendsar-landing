export const REVALIDATE_OPTIONS = { next: { revalidate: 30 } } as const;

const POST_CARD_FIELDS = `{
  _id,
  title,
  slug,
  publishedAt,
  subtitle,
  excerpt,
  category,
  readTime,
  image,
  author
}`;

export function postsQuery(limit: number) {
  return `*[
    _type == "blog"
    && defined(slug.current)
  ]|order(publishedAt desc)[0...${limit}]${POST_CARD_FIELDS}`;
}

export const POST_SLUGS_QUERY = `*[_type == "blog" && defined(slug.current)]{
  "slug": slug.current,
  publishedAt
}`;

export const POST_QUERY = `*[_type == "blog" && slug.current == $slug][0]{
  _id,
  title,
  slug,
  publishedAt,
  subtitle,
  excerpt,
  category,
  readTime,
  image,
  author,
  body,
  seo
}`;
