import { ComparisonGlance, parseComparisonText } from "@/components/blog/ComparisonGlance";

const calloutStyles = {
  info: "border-brand/25 bg-brand-light text-brand-strong dark:border-brand/30 dark:bg-brand-light dark:text-brand",
  warning:
    "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100",
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100",
  tip: "border-brand/20 bg-brand/5 text-brand-strong dark:border-brand/30 dark:bg-brand/10 dark:text-brand",
} as const;

type CalloutProps = {
  tone?: string;
  text?: string;
};

export function Callout({ tone = "info", text = "" }: CalloutProps) {
  const comparisonRows = parseComparisonText(text);
  if (comparisonRows) {
    return <ComparisonGlance rows={comparisonRows} />;
  }

  const paragraphs = text
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  const style = calloutStyles[tone as keyof typeof calloutStyles] ?? calloutStyles.info;

  return (
    <aside
      className={`not-prose my-6 rounded-xl border px-4 py-3 text-sm leading-relaxed ${style}`}
    >
      {paragraphs.length > 1 ? (
        paragraphs.map((paragraph, index) => (
          <p key={index} className={index > 0 ? "mt-3" : ""}>
            {paragraph}
          </p>
        ))
      ) : (
        <p className="whitespace-pre-line">{text}</p>
      )}
    </aside>
  );
}
