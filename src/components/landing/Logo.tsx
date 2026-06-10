import Link from "next/link";

import { LogoMark } from "@/components/landing/LogoMark";

const sizes = {
  sm: { mark: "h-9 w-9", text: "text-[15px]", gap: "gap-2.5" },
  md: { mark: "h-10 w-10", text: "text-base", gap: "gap-3" },
  lg: { mark: "h-12 w-12", text: "text-lg", gap: "gap-3" },
} as const;

export function Logo({
  className = "",
  variant = "default",
  size = "md",
}: {
  className?: string;
  variant?: "default" | "inverse";
  size?: keyof typeof sizes;
}) {
  const { mark, text, gap } = sizes[size];
  const isInverse = variant === "inverse";

  return (
    <Link href="/" className={`inline-flex items-center ${gap} ${className}`}>
      <LogoMark
        className={`shrink-0 ${mark}`}
        tone={isInverse ? "dark" : "light"}
      />
      <span
        className={`font-brand font-extrabold tracking-[-0.04em] ${text} ${
          isInverse ? "text-white" : "text-foreground"
        }`}
      >
        Flash <span className="text-brand">Chat</span>
      </span>
    </Link>
  );
}
