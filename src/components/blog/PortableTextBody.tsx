import { PortableText, type PortableTextComponents } from "next-sanity";

import { Callout } from "@/components/blog/Callout";
import { slugify, type PortableTextBlock } from "@/lib/blog";
import { urlFor } from "@/lib/sanity-image";

function headingId(value: PortableTextBlock) {
  const text =
    value.children
      ?.map((child) => ("text" in child ? child.text : ""))
      .join("") ?? "";
  return slugify(text);
}

const components: PortableTextComponents = {
  block: {
    h2: ({ children, value }) => (
      <h2 id={headingId(value)} className="scroll-mt-24">
        {children}
      </h2>
    ),
    h3: ({ children, value }) => (
      <h3 id={headingId(value)} className="scroll-mt-24">
        {children}
      </h3>
    ),
    h4: ({ children, value }) => (
      <h4 id={headingId(value)} className="scroll-mt-24">
        {children}
      </h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-brand/40 pl-4 italic">
        {children}
      </blockquote>
    ),
  },
  marks: {
    link: ({ children, value }) => {
      const href = typeof value?.href === "string" ? value.href : "#";
      const blank = value?.blank === true;
      return (
        <a
          href={href}
          className="font-medium text-brand underline decoration-brand/30 underline-offset-2 hover:text-brand-strong"
          {...(blank ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {children}
        </a>
      );
    },
    code: ({ children }) => (
      <code className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-sm dark:bg-neutral-800">
        {children}
      </code>
    ),
  },
  types: {
    image: ({ value }) => {
      const imageUrl = value ? urlFor(value)?.width(960).url() : null;
      if (!imageUrl) return null;

      return (
        <figure className="my-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={value.alt || ""}
            className="w-full rounded-xl"
          />
          {value.caption && (
            <figcaption className="mt-2 text-center text-sm text-neutral-500">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
    codeBlock: ({ value }) => (
      <pre className="overflow-x-auto rounded-xl bg-neutral-950 p-4 text-sm text-neutral-100">
        <code className={`language-${value.language ?? "text"}`}>{value.code}</code>
      </pre>
    ),
    callout: ({ value }) => (
      <Callout tone={value.tone} text={value.text} />
    ),
  },
};

type PortableTextBodyProps = {
  value: PortableTextBlock[];
};

export function PortableTextBody({ value }: PortableTextBodyProps) {
  return (
    <div className="prose prose-neutral max-w-none dark:prose-invert prose-headings:font-semibold prose-h2:mt-12 prose-h2:text-2xl prose-h3:mt-8 prose-h3:text-xl prose-h4:mt-6 prose-h4:text-lg prose-p:leading-relaxed prose-a:no-underline">
      <PortableText value={value} components={components} />
    </div>
  );
}
