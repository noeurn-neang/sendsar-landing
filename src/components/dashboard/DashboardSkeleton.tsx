function Shimmer({ className = "" }: { className?: string }) {
  return <div className={`console-placeholder ${className}`} />;
}

/** Content placeholders shown while a dashboard route streams (loading.tsx). */
export function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-8" aria-busy="true" aria-live="polite">
      <div className="space-y-2">
        <Shimmer className="h-8 w-52" />
        <Shimmer className="h-4 w-full max-w-md" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="console-card space-y-3 p-4">
            <Shimmer className="h-3 w-24" />
            <Shimmer className="h-8 w-16" />
            <Shimmer className="h-1.5 w-full rounded-full" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="console-card overflow-hidden">
            <div className="space-y-2 border-b border-console-border px-5 py-4">
              <Shimmer className="h-4 w-36" />
              <Shimmer className="h-3 w-48" />
            </div>
            <div className="space-y-4 p-5">
              <div className="flex items-center justify-between gap-6">
                <div className="min-w-0 flex-1 space-y-2">
                  <Shimmer className="h-3.5 w-28" />
                  <Shimmer className="h-3 w-40" />
                </div>
                <Shimmer className="h-9 w-40 shrink-0 rounded-md" />
              </div>
              <div className="h-px bg-console-border" />
              <div className="flex items-center justify-between gap-6">
                <div className="min-w-0 flex-1 space-y-2">
                  <Shimmer className="h-3.5 w-24" />
                  <Shimmer className="h-3 w-36" />
                </div>
                <Shimmer className="h-9 w-40 shrink-0 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="console-card overflow-hidden">
        <div className="space-y-2 border-b border-console-border px-5 py-4">
          <Shimmer className="h-4 w-32" />
          <Shimmer className="h-3 w-56" />
        </div>
        <div className="grid gap-3 p-5 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2 rounded-lg border border-console-border p-4">
              <Shimmer className="h-3 w-14" />
              <Shimmer className="h-4 w-28" />
              <Shimmer className="h-3 w-full" />
            </div>
          ))}
        </div>
      </div>

      <span className="sr-only">Loading dashboard…</span>
    </div>
  );
}
