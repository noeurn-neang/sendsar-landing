"use client";

import { useEffect, useState } from "react";

export function KhqrImage({
  value,
  size = 220,
  showDollarBadge = false,
}: {
  value: string;
  size?: number;
  /** Center $ badge like ABA KHQR ticket screens */
  showDollarBadge?: boolean;
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setDataUrl(null);
    setError(null);

    void (async () => {
      try {
        const QRCode = (await import("qrcode")).default;
        const url = await QRCode.toDataURL(value, {
          width: size,
          margin: 1,
          errorCorrectionLevel: "M",
          color: { dark: "#111111", light: "#ffffff" },
        });
        if (!cancelled) setDataUrl(url);
      } catch {
        if (!cancelled) setError("Could not render QR code");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [value, size]);

  if (error) {
    return <p className="text-sm text-red-600 dark:text-red-300">{error}</p>;
  }
  if (!dataUrl) {
    return (
      <div
        className="animate-pulse rounded-md bg-slate-100"
        style={{ width: size, height: size }}
        aria-hidden
      />
    );
  }

  const badgeSize = Math.round(size * 0.18);

  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={dataUrl}
        alt="ABA KHQR payment code"
        width={size}
        height={size}
        className="block rounded-sm bg-white"
      />
      {showDollarBadge ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/billing/usd-badge.png"
          alt=""
          width={badgeSize}
          height={badgeSize}
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow-sm"
          aria-hidden
        />
      ) : null}
    </div>
  );
}
