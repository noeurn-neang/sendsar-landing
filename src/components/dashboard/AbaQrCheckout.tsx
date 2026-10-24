"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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

export function AbaQrCheckout({
  planId,
  period,
  contactTelegramUrl,
  onClose,
  onBack,
}: AbaQrCheckoutProps) {
  const router = useRouter();
  const { update } = useSession();
  const [checkout, setCheckout] = useState<CheckoutPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusText, setStatusText] = useState("Waiting for payment…");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [done, setDone] = useState(false);
  const stopRef = useRef(false);

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
      setSecondsLeft(payload.expiresIn);
      setStatusText("Scan with a banking app that supports KHQR");
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
          await update();
          router.replace(payload.redirect ?? "/dashboard/billing?upgraded=1");
          router.refresh();
          onClose();
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
        setStatusText("Waiting for payment…");
      } catch {
        setStatusText("Unable to verify — keep this page open");
      }
    };

    void poll();
    const id = window.setInterval(() => void poll(), intervalMs);
    return () => window.clearInterval(id);
  }, [checkout, done, error, onClose, router, update]);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="mx-auto max-w-md space-y-5">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-console-fg">Pay with ABA KHQR</h3>
        <p className="mt-1 text-sm text-console-muted">
          {planId === "pro" ? "Pro" : "Plus"} · {period === "annual" ? "Annual" : "Monthly"}
        </p>
      </div>

      {loading ? (
        <p className="text-center text-sm text-console-muted">Creating QR…</p>
      ) : null}

      {error ? (
        <div className="space-y-3 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          <p>{error}</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="console-btn-secondary" onClick={onBack}>
              Back to plans
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

      {checkout && !error ? (
        <>
          <div className="flex flex-col items-center gap-3">
            <KhqrImage value={checkout.qrString} size={200} />
            <p className="text-2xl font-semibold tabular-nums text-console-fg">
              ${checkout.amount}{" "}
              <span className="text-sm font-medium text-console-muted">{checkout.currency}</span>
            </p>
            <p className="text-xs text-console-muted">{checkout.merchantName}</p>
            <p className="font-mono text-sm text-console-fg">
              Expires in {mm}:{ss}
            </p>
            <p className="text-center text-sm text-console-muted">{statusText}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <button type="button" className="console-btn-secondary" onClick={onBack}>
              Back
            </button>
          </div>
          <p className="text-center text-xs text-console-muted">
            Having trouble?{" "}
            <a
              href={contactTelegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-brand hover:text-brand-strong"
            >
              Contact support
            </a>
          </p>
        </>
      ) : null}
    </div>
  );
}
