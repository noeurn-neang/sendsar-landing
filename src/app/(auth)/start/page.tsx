import Link from "next/link";

import { OAuthStartButtons } from "@/components/auth/OAuthStartButtons";

export const metadata = {
  title: "Get started",
  robots: { index: false, follow: false },
};

export default function StartPage() {
  return (
    <div className="text-center">
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Welcome
      </h1>
      <h2 className="mt-2 text-sm font-normal text-slate-600 dark:text-slate-400">
        Continue to your Sendsar workspace
      </h2>

      <OAuthStartButtons className="mt-8" />

      <p className="mt-8 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
        By continuing, you agree to Sendsar&apos;s{" "}
        <Link
          href="/terms"
          className="font-medium text-[#0096c8] underline-offset-2 hover:underline dark:text-[#38bdf8]"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          href="/privacy"
          className="font-medium text-[#0096c8] underline-offset-2 hover:underline dark:text-[#38bdf8]"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
