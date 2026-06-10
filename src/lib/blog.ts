export type PortableTextBlock = {
  _type: string;
  style?: string;
  children?: { _type: string; text?: string }[];
};

export type BlogAuthor = {
  name?: string;
  role?: string;
  bio?: string;
  avatar?: { asset?: { _ref: string } };
};

export type BlogPost = {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  subtitle?: string;
  excerpt?: string;
  category?: string;
  readTime?: number;
  image?: { asset?: { _ref: string } };
  author?: BlogAuthor;
  body?: PortableTextBlock[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
};

export type TocHeading = {
  id: string;
  text: string;
  level: 2 | 3 | 4;
};

export function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

function blockText(block: PortableTextBlock) {
  return (
    block.children
      ?.map((child) => ("text" in child ? child.text : ""))
      .join("") ?? ""
  );
}

export function extractHeadings(body: PortableTextBlock[] = []): TocHeading[] {
  return body
    .filter(
      (block): block is PortableTextBlock =>
        block._type === "block" &&
        ["h2", "h3", "h4"].includes(block.style ?? ""),
    )
    .map((block) => {
      const text = blockText(block);
      const level = Number(block.style?.replace("h", "")) as 2 | 3 | 4;
      return { id: slugify(text), text, level };
    })
    .filter((heading) => heading.text.length > 0);
}

export function formatPostDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function postSummary(post: Pick<BlogPost, "excerpt" | "subtitle">) {
  return post.excerpt || post.subtitle || "";
}
