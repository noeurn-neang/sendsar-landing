"use client";

import { useState } from "react";

export function InstallSnippet({
  command = "npm i @sendsar/chat",
}: {
  command?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative inline-flex items-center justify-between gap-3 rounded-lg border border-slate-300/80 bg-white/95 px-4 py-2.5 shadow-sm backdrop-blur-md transition hover:border-slate-400 dark:border-slate-700/80 dark:bg-slate-900/90 dark:hover:border-slate-600">
      <div className="flex items-center gap-2 font-mono text-sm sm:text-base text-slate-800 dark:text-slate-100">
        <span className="text-[#0096c8] font-bold select-none">$</span>
        <span className="font-medium">{command}</span>
      </div>

      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:text-[#0096c8] hover:bg-sky-50 transition dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-[#38bdf8]"
        title={copied ? "Copied!" : "Copy to clipboard"}
        aria-label={copied ? "Copied!" : "Copy to clipboard"}
      >
        {copied ? (
          <svg
            className="h-4 w-4 text-emerald-600 dark:text-emerald-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        )}
      </button>

      {copied && (
        <span className="absolute -top-8 right-2 rounded bg-slate-900 px-2 py-0.5 text-xs text-white shadow-md animate-fade-in dark:bg-slate-100 dark:text-slate-900">
          Copied!
        </span>
      )}
    </div>
  );
}
