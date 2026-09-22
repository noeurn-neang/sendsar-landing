type LogoMarkProps = {
  className?: string;
  colored?: boolean;
  tone?: "light" | "dark" | "white" | "auto" | "original";
};

export function LogoMark({
  className = "",
  colored = true,
  tone = "auto",
}: LogoMarkProps) {
  if (tone === "white") {
    return (
      <img
        src="/logo-white.svg"
        alt=""
        className={`inline-block shrink-0 object-contain ${className}`}
        aria-hidden
      />
    );
  }
  if (tone === "original" || (colored && tone === "light")) {
    return (
      <img
        src="/logo.svg"
        alt=""
        className={`inline-block shrink-0 object-contain ${className}`}
        aria-hidden
      />
    );
  }
  if (tone === "auto") {
    return (
      <>
        {/* Original logo in light mode */}
        <img
          src="/logo.svg"
          alt=""
          className={`inline-block shrink-0 object-contain dark:hidden ${className}`}
          aria-hidden
        />
        {/* White logo in dark mode */}
        <img
          src="/logo-white.svg"
          alt=""
          className={`hidden shrink-0 object-contain dark:inline-block ${className}`}
          aria-hidden
        />
      </>
    );
  }

  const colorClass = !colored ? "bg-current" : "bg-white";

  return (
    <span
      className={`inline-block shrink-0 ${colorClass} ${className}`}
      style={{
        aspectRatio: "724 / 774",
        maskImage: "url(/logo.svg)",
        WebkitMaskImage: "url(/logo.svg)",
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
      aria-hidden
    />
  );
}
