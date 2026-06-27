import type { TocHeading } from "@/lib/blog";

type TableOfContentsProps = {
  headings: TocHeading[];
  className?: string;
};

export function TableOfContents({ headings, className = "" }: TableOfContentsProps) {
  if (headings.length === 0) return null;

  return (
    <nav aria-label="Table of contents" className={className}>
      <p className="mb-4 text-sm font-semibold text-foreground">Table of contents</p>
      <ul className="space-y-2 text-sm">
        {headings.map((heading) => (
          <li
            key={heading.id}
            className={heading.level === 3 ? "pl-3" : heading.level === 4 ? "pl-6" : ""}
          >
            <a
              href={`#${heading.id}`}
              className="text-neutral-600 transition-colors hover:text-brand dark:text-neutral-400"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
