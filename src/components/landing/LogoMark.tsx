type LogoMarkProps = {
  className?: string;
  colored?: boolean;
  /** Icon card tone — matches brand light vs dark lockups */
  tone?: "light" | "dark";
};

const VIEW = "0 0 96 96";

const FLASH = "54,14 40,38 50,38 36,64 62,36 49,36";
const TEAL_TAIL = "10,42 -2,58 24,50";
const WHITE_TAIL = "82,80 96,96 68,88";

export function LogoMark({
  className = "",
  colored = true,
  tone = "light",
}: LogoMarkProps) {
  const cardFill = tone === "dark" ? "#1e293b" : "#0f172a";
  const whiteBubble = tone === "dark" ? "#ffffff" : "#ffffff";
  const whiteTail = tone === "dark" ? 0.9 : 1;
  const whiteRect = tone === "dark" ? 0.9 : 1;

  if (!colored) {
    return (
      <svg viewBox={VIEW} className={className} aria-hidden>
        <rect width="96" height="96" rx="24" fill="currentColor" opacity="0.12" />
        <rect x="10" y="10" width="54" height="40" rx="12" fill="currentColor" opacity="0.9" />
        <polygon points={TEAL_TAIL} fill="currentColor" opacity="0.9" />
        <rect x="28" y="48" width="54" height="40" rx="12" fill="currentColor" opacity="0.35" />
        <polygon points={WHITE_TAIL} fill="currentColor" opacity="0.35" />
        <polygon points={FLASH} fill="currentColor" opacity="0.65" />
      </svg>
    );
  }

  return (
    <svg viewBox={VIEW} className={className} aria-hidden>
      <rect width="96" height="96" rx="24" fill={cardFill} />
      <rect x="10" y="10" width="54" height="40" rx="12" fill="#14b8a6" />
      <polygon points={TEAL_TAIL} fill="#14b8a6" />
      <rect
        x="28"
        y="48"
        width="54"
        height="40"
        rx="12"
        fill={whiteBubble}
        opacity={whiteRect}
      />
      <polygon points={WHITE_TAIL} fill={whiteBubble} opacity={whiteTail} />
      <circle cx="40" cy="68" r="2.8" fill="#0f172a" />
      <circle cx="51" cy="68" r="2.8" fill="#0f172a" />
      <circle cx="62" cy="68" r="2.8" fill="#0f172a" />
      <polygon points={FLASH} fill="#fb923c" />
    </svg>
  );
}
