export type ComparisonRow = {
  name: string;
  integration: string;
  twoParty: string;
  pricing: string;
  uiComponents: string;
  bestFor: string;
};

const FIELD_MAP: Record<string, keyof Omit<ComparisonRow, "name">> = {
  integration: "integration",
  "two-party": "twoParty",
  "startup pricing": "pricing",
  "ui components": "uiComponents",
  "best for": "bestFor",
};

function splitComparisonLines(text: string) {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length !== 1) return lines;

  const singleLine = lines[0];
  const splitOnPeriod = singleLine.split(/\.\s+(?=\S+\s+—\s+)/);

  if (splitOnPeriod.length > 1) {
    return splitOnPeriod.map((part, index) => {
      const trimmed = part.trim();
      return index < splitOnPeriod.length - 1 ? `${trimmed}.` : trimmed;
    });
  }

  const splitOnProvider = singleLine.split(/(?=\S+\s+—\s+)/);
  if (splitOnProvider.length > 1) {
    return splitOnProvider.map((part) => part.trim()).filter(Boolean);
  }

  return lines;
}

export function parseComparisonText(text: string): ComparisonRow[] | null {
  const lines = splitComparisonLines(text);

  if (lines.length === 0) return null;

  const rows = lines.map(parseComparisonLine).filter((row): row is ComparisonRow => row !== null);

  if (rows.length === 0 || rows.length < lines.length * 0.5) return null;

  return rows;
}

function parseComparisonLine(line: string): ComparisonRow | null {
  const separator = line.includes(" — ") ? " — " : " - ";
  const splitIndex = line.indexOf(separator);
  if (splitIndex === -1) return null;

  const name = line.slice(0, splitIndex).trim();
  const attributes = line.slice(splitIndex + separator.length).trim();
  const parts = attributes.split("|").map((part) => part.trim());

  const row: ComparisonRow = {
    name,
    integration: "",
    twoParty: "",
    pricing: "",
    uiComponents: "",
    bestFor: "",
  };

  for (const part of parts) {
    const colonIndex = part.indexOf(":");
    if (colonIndex === -1) continue;

    const key = part.slice(0, colonIndex).trim().toLowerCase();
    const value = part.slice(colonIndex + 1).trim();
    const field = FIELD_MAP[key];
    if (field) row[field] = value;
  }

  return row.name ? row : null;
}

const columns: { key: keyof Omit<ComparisonRow, "name">; label: string }[] = [
  { key: "integration", label: "Integration" },
  { key: "twoParty", label: "Two-party" },
  { key: "pricing", label: "Startup pricing" },
  { key: "uiComponents", label: "UI components" },
  { key: "bestFor", label: "Best for" },
];

export function ComparisonGlance({ rows }: { rows: ComparisonRow[] }) {
  return (
    <div className="not-prose my-8 space-y-4">
      <div className="hidden overflow-x-auto rounded-xl border border-neutral-200 md:block dark:border-neutral-800">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
              <th className="px-4 py-3 font-semibold text-foreground">Platform</th>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-4 py-3 font-semibold text-neutral-600 dark:text-neutral-400"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row.name}
                className={
                  index < rows.length - 1
                    ? "border-b border-neutral-100 dark:border-neutral-800"
                    : ""
                }
              >
                <td className="px-4 py-3 font-semibold text-foreground">{row.name}</td>
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="px-4 py-3 text-neutral-600 dark:text-neutral-400"
                  >
                    {row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 md:hidden">
        {rows.map((row) => (
          <article
            key={row.name}
            className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <h3 className="mb-3 text-base font-semibold text-foreground">{row.name}</h3>
            <dl className="space-y-2 text-sm">
              {columns.map((column) => (
                <div key={column.key} className="grid grid-cols-[7.5rem_1fr] gap-2">
                  <dt className="font-medium text-neutral-500 dark:text-neutral-500">
                    {column.label}
                  </dt>
                  <dd className="text-neutral-700 dark:text-neutral-300">
                    {row[column.key]}
                  </dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>
    </div>
  );
}
