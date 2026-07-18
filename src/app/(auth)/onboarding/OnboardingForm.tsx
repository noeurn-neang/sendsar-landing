"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import { normalizeSlugInput, slugify } from "@/lib/control-plane/slug";

const inputClass =
  "w-full rounded-md border border-[#2e2e2e] bg-[#1f1f1f] px-3 py-2 text-sm text-[#ededed] outline-none transition placeholder:text-[#525252] focus:border-[#404040] focus:ring-1 focus:ring-[#404040]";

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
    return <p className="text-sm text-[#a1a1a1]">Preparing your workspace…</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-normal tracking-tight text-white">Set up workspace</h1>
      <h2 className="mt-2 text-sm font-normal text-[#a1a1a1]">
        Name your project before opening the console
      </h2>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4 text-left">
        <label className="block text-sm">
          <span className="mb-1.5 block text-[#a1a1a1]">Workspace name</span>
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
          <span className="mb-1.5 block text-[#a1a1a1]">Workspace slug</span>
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
          <p className="rounded-md border border-red-900/50 bg-red-950/40 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="flex h-10 w-full items-center justify-center rounded-md bg-brand px-4 text-sm font-medium text-white transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Saving…" : "Continue"}
        </button>
      </form>

      <p className="mt-8 text-xs text-[#737373]">
        Signed in as <span className="text-[#a1a1a1]">{session?.user.email}</span>
      </p>
    </div>
  );
}
