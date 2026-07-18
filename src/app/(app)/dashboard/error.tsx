"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[dashboard]", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg space-y-4 py-16 text-center">
      <h2 className="text-lg font-semibold text-console-fg">Something went wrong</h2>
      <p className="text-sm text-console-muted">
        This page failed to load. Your session is fine — try again. If it keeps happening, check
        database connectivity.
      </p>
      {error.digest ? (
        <p className="font-mono text-xs text-console-muted">Digest: {error.digest}</p>
      ) : null}
      <button type="button" className="console-btn-primary" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
