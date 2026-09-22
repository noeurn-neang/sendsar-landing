"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import { normalizeSlugInput, slugify } from "@/lib/control-plane/slug";

const inputClass =
  "w-full rounded-xl border border-slate-200/90 bg-white/90 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#0096c8] focus:ring-2 focus:ring-[#0096c8]/20 dark:border-slate-700/80 dark:bg-slate-800/90 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-[#0096c8] dark:focus:ring-[#0096c8]/20";

export function OnboardingForm() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceSlug, setWorkspaceSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/start");
      return;
    }

    if (status === "authenticated" && session?.user.onboardingCompleted) {
      router.replace("/dashboard");
      return;
    }

    if (session?.user.tenantName && !workspaceName) {
      setWorkspaceName(session.user.tenantName);
      setWorkspaceSlug(session.user.tenantSlug ?? slugify(session.user.tenantName));
    }
  }, [status, session, router, workspaceName]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceName, workspaceSlug }),
      });

      const payload = (await response.json()) as {
        error?: string;
        tenantName?: string;
        tenantSlug?: string;
      };
      if (!response.ok) {
        throw new Error(payload.error ?? "Could not save workspace");
      }

      // Push flags into the JWT cookie before navigating — middleware reads the cookie.
      await update({
        onboardingCompleted: true,
        tenantName: payload.tenantName ?? workspaceName,
        tenantSlug: payload.tenantSlug ?? workspaceSlug,
      });

      // Hard navigation so middleware sees the updated session cookie.
      window.location.assign("/dashboard/keys?welcome=1");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  if (status === "loading") {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Preparing your workspace…</p>;
  }

  return (
    <div className="text-left">
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Set up workspace
      </h1>
      <h2 className="mt-2 text-sm font-normal text-slate-600 dark:text-slate-400">
        Name your project before opening the console
      </h2>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4 text-left">
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Workspace name
          </span>
          <input
            type="text"
            required
            value={workspaceName}
            onChange={(event) => {
              const value = event.target.value;
              setWorkspaceName(value);
              if (!slugTouched) {
                setWorkspaceSlug(slugify(value));
              }
            }}
            className={inputClass}
            placeholder="Acme Delivery"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Workspace slug
          </span>
          <input
            type="text"
            required
            value={workspaceSlug}
            onChange={(event) => {
              setSlugTouched(true);
              setWorkspaceSlug(normalizeSlugInput(event.target.value));
            }}
            className={`${inputClass} font-mono`}
            placeholder="acme-delivery"
          />
        </label>

        {error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="btn-bd-primary flex h-11 w-full items-center justify-center text-sm font-semibold text-white shadow-lg shadow-[#0096c8]/20 hover:bg-[#007ba4] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Saving…" : "Continue"}
        </button>
      </form>

      <p className="mt-8 text-xs text-slate-500 dark:text-slate-400">
        Signed in as <span className="font-medium text-slate-700 dark:text-slate-300">{session?.user.email}</span>
      </p>
    </div>
  );
}
