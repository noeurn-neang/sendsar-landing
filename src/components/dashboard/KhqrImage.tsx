"use client";

import { useEffect, useState } from "react";

export function KhqrImage({
  value,
  size = 200,
}: {
  value: string;
  size?: number;
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
        className="animate-pulse rounded-lg bg-console-track"
        style={{ width: size, height: size }}
        aria-hidden
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={dataUrl}
      alt="ABA KHQR payment code"
      width={size}
      height={size}
      className="rounded-lg bg-white p-2"
    />
  );
}
