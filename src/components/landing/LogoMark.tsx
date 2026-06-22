type LogoMarkProps = {
  className?: string;
  colored?: boolean;
  tone?: "light" | "dark";
};

export function LogoMark({
  className = "",
  colored = true,
  tone = "light",
}: LogoMarkProps) {
  if (colored && tone === "light") {
    return (
      <img
        src="/logo.svg"
        alt=""
        className={`inline-block shrink-0 object-contain ${className}`}
        aria-hidden
      />
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
