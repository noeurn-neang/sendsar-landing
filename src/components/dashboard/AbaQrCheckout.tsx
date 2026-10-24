"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";

import { KhqrImage } from "@/components/dashboard/KhqrImage";
import type { BillingPeriod } from "@/lib/pricing";

type CheckoutPayload = {
  paymentId: string;
  qrString: string;
  clientId: string;
  amount: string;
  currency: string;
  expiresIn: number;
  merchantName: string;
  pollInterval: number;
  planId: string;
  period: BillingPeriod;
};

type AbaQrCheckoutProps = {
  planId: "plus" | "pro";
  period: BillingPeriod;
  contactTelegramUrl: string;
  onClose: () => void;
  onBack: () => void;
};

function CountdownRing({
  secondsLeft,
  totalSeconds,
}: {
  secondsLeft: number;
  totalSeconds: number;
}) {
  const size = 40;
  const stroke = 3.5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = totalSeconds > 0 ? Math.max(0, Math.min(1, secondsLeft / totalSeconds)) : 0;
  const offset = circumference * (1 - progress);
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="flex items-center gap-2.5 rounded-full bg-white px-2.5 py-1.5 shadow-sm ring-1 ring-slate-200">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#0096c8"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="pr-1 font-mono text-base font-bold tabular-nums tracking-tight text-slate-900">
        {mm}:{ss}
      </span>
    </div>
  );
}

export function AbaQrCheckout({
  planId,
  period,
  contactTelegramUrl,
  onClose,
  onBack,
}: AbaQrCheckoutProps) {
  const { update } = useSession();
  const [checkout, setCheckout] = useState<CheckoutPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusText, setStatusText] = useState("Waiting for payment…");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [done, setDone] = useState(false);
  const stopRef = useRef(false);
  const totalExpiresRef = useRef(180);

  const startCheckout = useCallback(async () => {
    setLoading(true);
    setError(null);
    setDone(false);
    setCheckout(null);
    try {
      const response = await fetch("/api/billing/aba/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ planId, period }),
      });
      const payload = (await response.json()) as CheckoutPayload & {
        error?: string;
        detail?: string;
      };
      if (!response.ok) {
        if (payload.detail) {
          console.error("[aba/create]", payload.detail);
        }
        throw new Error(payload.error ?? "Failed to create ABA QR");
      }
      setCheckout(payload);
      totalExpiresRef.current = payload.expiresIn;
      setSecondsLeft(payload.expiresIn);
      setStatusText("Scan with mobile banking app that supports KHQR");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create ABA QR");
    } finally {
      setLoading(false);
    }
  }, [planId, period]);

  useEffect(() => {
    stopRef.current = false;
    void startCheckout();
    return () => {
      stopRef.current = true;
    };
  }, [startCheckout]);

  useEffect(() => {
    if (!checkout || done || error) return;

    const tick = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          window.clearInterval(tick);
          setError("QR expired — go back and try again.");
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => window.clearInterval(tick);
  }, [checkout, done, error]);

  useEffect(() => {
    if (!checkout || done || error) return;

    const intervalMs = Math.max(2, checkout.pollInterval) * 1000;

    const poll = async () => {
      if (stopRef.current) return;
      try {
        const response = await fetch("/api/billing/aba/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            paymentId: checkout.paymentId,
            clientId: checkout.clientId,
          }),
        });
        const payload = (await response.json()) as {
          status?: number;
          pending?: boolean;
          terminal?: boolean;
          expired?: boolean;
          verification_error?: boolean;
          message?: string;
          redirect?: string;
          plan?: string;
          error?: string;
        };

        if (!response.ok) {
          setStatusText(payload.error ?? "Verification error — keep this page open");
          return;
        }

        if (payload.status === 1) {
          stopRef.current = true;
          setDone(true);
          setStatusText("Payment received — activating your plan…");
          try {
            await update();
          } catch (err) {
            console.error("[aba] session update failed", err);
          }
          onClose();
          window.location.assign(payload.redirect ?? "/dashboard/billing?upgraded=1");
          return;
        }
        if (payload.expired) {
          stopRef.current = true;
          setError("QR expired — go back and try again.");
          return;
        }
        if (payload.terminal) {
          stopRef.current = true;
          setError(payload.message ?? "Payment failed or was declined.");
          return;
        }
        if (payload.verification_error) {
          setStatusText(payload.message ?? "Unable to verify — keep this page open");
          return;
        }
        setStatusText("Scan with mobile banking app that supports KHQR");
      } catch {
        setStatusText("Unable to verify — keep this page open");
      }
    };

    void poll();
    const id = window.setInterval(() => void poll(), intervalMs);
    return () => window.clearInterval(id);
  }, [checkout, done, error, onClose, update]);

  const amountLabel = useMemo(() => {
    if (!checkout) return "";
    return `${checkout.amount} ${checkout.currency}`;
  }, [checkout]);

  return (
    <div className="mx-auto w-full max-w-md space-y-5 pb-6">
      <div className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2.5 shadow-sm ring-1 ring-slate-200">
        <div className="flex min-w-0 items-center gap-2.5">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-800 transition hover:bg-slate-200"
            aria-label="Back"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h3 className="truncate text-lg font-extrabold tracking-tight text-slate-900">
            ABA KHQR
          </h3>
        </div>
        {checkout && !error && !done ? (
          <CountdownRing secondsLeft={secondsLeft} totalSeconds={totalExpiresRef.current} />
        ) : null}
      </div>

        {loading ? (
          <p className="py-10 text-center text-sm font-medium text-slate-600">Creating QR…</p>
        ) : null}

        {error ? (
          <div className="space-y-3 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm text-red-700 shadow-sm">
            <p>{error}</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="console-btn-secondary" onClick={onBack}>
                Back
              </button>
              <a
                href={contactTelegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="console-btn-secondary"
              >
                Contact support
              </a>
            </div>
          </div>
        ) : null}

        {done ? (
          <p className="py-10 text-center text-sm font-semibold text-emerald-700">{statusText}</p>
        ) : null}

        {checkout && !error && !done ? (
          <>
            <div className="overflow-hidden rounded-2xl bg-white shadow-[0_12px_40px_rgba(15,23,42,0.12)] ring-1 ring-slate-200/80">
              <div className="flex items-center bg-[#e11d2e] px-5 py-3.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/billing/khqr-logo.png"
                  alt="KHQR"
                  className="h-7 w-auto object-contain"
                />
              </div>

              <div className="px-5 pb-2 pt-5 text-center">
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                  {checkout.merchantName}
                </p>
                <p className="mt-2 text-2xl font-extrabold tabular-nums tracking-tight text-slate-900">
                  {amountLabel}
                </p>
              </div>

              <div className="relative mx-4 my-3 border-t border-dashed border-slate-300">
                <span className="absolute -left-4 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-[#eef2f6]" />
                <span className="absolute -right-4 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-[#eef2f6]" />
              </div>

              <div className="flex justify-center px-5 pb-6 pt-2">
                <KhqrImage value={checkout.qrString} size={220} showDollarBadge />
              </div>
            </div>

            <p className="text-center text-sm font-medium text-slate-600">{statusText}</p>

            <p className="text-center text-xs text-slate-500">
              Having trouble?{" "}
              <a
                href={contactTelegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#0096c8] hover:underline"
              >
                Contact support
              </a>
            </p>
          </>
        ) : null}
    </div>
  );
}
