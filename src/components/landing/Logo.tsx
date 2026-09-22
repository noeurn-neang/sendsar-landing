import Link from "next/link";

import { LogoMark } from "@/components/landing/LogoMark";

const sizes = {
  sm: { mark: "h-9 w-9", text: "text-[15px]", gap: "gap-2.5" },
  md: { mark: "h-10 w-10", text: "text-base", gap: "gap-3" },
  lg: { mark: "h-12 w-12", text: "text-lg", gap: "gap-3" },
  xl: { mark: "h-11 w-11 sm:h-12 sm:w-12", text: "text-xl", gap: "gap-3.5" },
} as const;

export function Logo({
  className = "",
  variant = "default",
  size = "md",
  showText = true,
  tone,
  href = "/",
}: {
  className?: string;
  variant?: "default" | "inverse" | "white";
  size?: keyof typeof sizes;
  showText?: boolean;
  tone?: "light" | "dark" | "white" | "auto" | "original";
  href?: string;
}) {
  const { mark, text, gap } = sizes[size];
  const isInverse = variant === "inverse";
  const markTone =
    tone ?? (variant === "white" ? "white" : isInverse ? "dark" : "auto");

  return (
    <Link
      href={href}
      className={`group inline-flex items-center ${showText ? gap : ""} ${className}`}
      aria-label="Sendsar Home"
    >
      <div className="shrink-0 transition-transform duration-200 ease-in-out group-hover:scale-110 group-hover:-rotate-6">
        <LogoMark className={mark} tone={markTone} />
      </div>
      {showText && (
        <span
          className={`font-brand font-extrabold tracking-[-0.04em] ${text} ${
            isInverse ? "text-white" : "text-foreground"
          }`}
        >
          Send<span className={isInverse ? "text-white/90" : "text-brand"}>sar</span>
        </span>
      )}
    </Link>
  );
}
