import Link from "next/link";

import { OAuthStartButtons } from "@/components/auth/OAuthStartButtons";

export const metadata = {
  title: "Get started",
  robots: { index: false, follow: false },
};

export default function StartPage() {
  return (
    <div>
      <h1 className="text-2xl font-normal tracking-tight text-white">Welcome</h1>
      <h2 className="mt-2 text-sm font-normal text-[#a1a1a1]">
        Continue to your Sendsar workspace
      </h2>

      <OAuthStartButtons className="mt-8" />

      <p className="mt-10 text-xs leading-relaxed text-[#737373]">
        By continuing, you agree to Sendsar&apos;s{" "}
        <Link href="/terms" className="text-[#a1a1a1] underline-offset-2 hover:text-white hover:underline">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-[#a1a1a1] underline-offset-2 hover:text-white hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
