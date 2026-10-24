"use client";

import { useEffect, useState } from "react";

import { AbaQrCheckout } from "@/components/dashboard/AbaQrCheckout";
import {
  PricingCards,
  pricingCtaClassName,
  type PricingCtaContext,
} from "@/components/landing/PricingCards";
import {
  buildUpgradeMailto,
  buildUpgradeTelegramUrl,
} from "@/lib/billing/contact";
import {
  defaultBillingPeriod,
  getCheckoutAmountUsd,
  getPlanDisplayName,
  type BillingPeriod,
} from "@/lib/pricing";

type PlanPickerModalProps = {
  open: boolean;
  onClose: () => void;
  currentPlanId: string;
  tenantId: string;
  slug: string | null;
  planName: string;
  abaEnabled: boolean;
};

type PaidPlanId = "plus" | "pro";

type Step =
  | { kind: "plans" }
  | { kind: "pay"; planId: PaidPlanId; period: BillingPeriod }
  | { kind: "aba"; planId: PaidPlanId; period: BillingPeriod };

export function PlanPickerModal({
  open,
  onClose,
  currentPlanId,
  tenantId,
  slug,
  planName,
  abaEnabled,
}: PlanPickerModalProps) {
  const [period, setPeriod] = useState<BillingPeriod>(defaultBillingPeriod);
  const [step, setStep] = useState<Step>({ kind: "plans" });

  useEffect(() => {
    if (!open) {
      setStep({ kind: "plans" });
      setPeriod(defaultBillingPeriod);
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const contactFor = (desiredPlan?: string, desiredPeriod?: string) =>
    buildUpgradeTelegramUrl({
      tenantId,
      slug,
      currentPlan: planName,
      desiredPlan,
      period: desiredPeriod,
    });

  function renderCta({ tier, period: selectedPeriod, isCurrent }: PricingCtaContext) {
    if (isCurrent) {
      return (
        <span className={pricingCtaClassName(tier, true)} aria-disabled>
          Current plan
        </span>
      );
    }

    if (tier.id === "plus" || tier.id === "pro") {
      return (
        <button
          type="button"
          className={pricingCtaClassName(tier)}
          onClick={() =>
            setStep({
              kind: "pay",
              planId: tier.id as PaidPlanId,
              period: selectedPeriod,
            })
          }
        >
          Choose
        </button>
      );
    }

    if (tier.id === "enterprise") {
      return (
        <a
          href={contactFor("Enterprise")}
          target="_blank"
          rel="noopener noreferrer"
          className={pricingCtaClassName(tier)}
        >
          Contact sales
        </a>
      );
    }

    return (
      <span className={pricingCtaClassName(tier, true)} aria-disabled>
        Included
      </span>
    );
  }

  const title =
    step.kind === "aba"
      ? "Checkout"
      : step.kind === "pay"
        ? "Payment method"
        : "Choose a plan";

  const subtitle =
    step.kind === "aba"
      ? "Scan the KHQR to complete payment"
      : step.kind === "pay"
        ? "How would you like to pay?"
        : "Same plans as sendsar.com";

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto p-4 sm:p-6">
      <button
        type="button"
        className="fixed inset-0 bg-black/50 backdrop-blur-[2px]"
        aria-label="Close plan picker"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="plan-picker-title"
        className="relative z-[81] my-4 w-full max-w-5xl rounded-2xl border border-console-border bg-console-panel shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-console-border px-5 py-4 sm:px-6">
          <div>
            <h2 id="plan-picker-title" className="text-lg font-semibold text-console-fg">
              {title}
            </h2>
            <p className="mt-1 text-sm text-console-muted">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-console-border px-2.5 py-1 text-xs font-medium text-console-fg hover:border-brand/40"
          >
            Close
          </button>
        </div>

        <div className="px-4 py-6 sm:px-6">
          {step.kind === "plans" ? (
            <div className="space-y-6">
              <PricingCards
                compact
                showBillingToggle
                period={period}
                onPeriodChange={setPeriod}
                currentPlanId={currentPlanId}
                renderCta={renderCta}
              />
              <p className="text-center text-xs text-console-muted">
                Prefer not to pay online?{" "}
                <a
                  href={contactFor()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-brand hover:text-brand-strong"
                >
                  Message us on Telegram
                </a>
                {" or "}
                <a
                  href={buildUpgradeMailto({
                    tenantId,
                    slug,
                    currentPlan: planName,
                  })}
                  className="font-medium text-brand hover:text-brand-strong"
                >
                  email
                </a>
                .
              </p>
            </div>
          ) : null}

          {step.kind === "pay" ? (
            <PaymentMethodStep
              planId={step.planId}
              period={step.period}
              abaEnabled={abaEnabled}
              contactTelegramUrl={contactFor(
                getPlanDisplayName(step.planId),
                step.period,
              )}
              contactMailtoUrl={buildUpgradeMailto({
                tenantId,
                slug,
                currentPlan: planName,
                desiredPlan: getPlanDisplayName(step.planId),
                period: step.period,
              })}
              onBack={() => setStep({ kind: "plans" })}
              onChooseAba={() =>
                setStep({ kind: "aba", planId: step.planId, period: step.period })
              }
            />
          ) : null}

          {step.kind === "aba" ? (
            <AbaQrCheckout
              planId={step.planId}
              period={step.period}
              contactTelegramUrl={contactFor(
                getPlanDisplayName(step.planId),
                step.period,
              )}
              onClose={onClose}
              onBack={() =>
                setStep({ kind: "pay", planId: step.planId, period: step.period })
              }
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function PaymentMethodStep({
  planId,
  period,
  abaEnabled,
  contactTelegramUrl,
  contactMailtoUrl,
  onBack,
  onChooseAba,
}: {
  planId: PaidPlanId;
  period: BillingPeriod;
  abaEnabled: boolean;
  contactTelegramUrl: string;
  contactMailtoUrl: string;
  onBack: () => void;
  onChooseAba: () => void;
}) {
  const amount = getCheckoutAmountUsd(planId, period);
  const planLabel = getPlanDisplayName(planId);
  const periodLabel = period === "annual" ? "Annual" : "Monthly";

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <div className="rounded-xl border border-console-border bg-console-canvas px-4 py-3 text-sm">
        <p className="font-medium text-console-fg">
          {planLabel} · {periodLabel}
        </p>
        {amount != null ? (
          <p className="mt-1 text-console-muted">
            Total{" "}
            <span className="font-semibold tabular-nums text-console-fg">
              ${amount.toFixed(2)} USD
            </span>
          </p>
        ) : null}
      </div>

      <div className="space-y-3">
        {abaEnabled ? (
          <button
            type="button"
            onClick={onChooseAba}
            className="flex w-full flex-col items-start gap-1 rounded-xl border border-console-border bg-console-panel px-4 py-3.5 text-left transition hover:border-brand/50"
          >
            <span className="text-sm font-semibold text-console-fg">ABA KHQR</span>
            <span className="text-xs text-console-muted">
              Pay instantly by scanning a QR with your banking app
            </span>
          </button>
        ) : null}

        <a
          href={contactTelegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full flex-col items-start gap-1 rounded-xl border border-console-border bg-console-panel px-4 py-3.5 text-left transition hover:border-brand/50"
        >
          <span className="text-sm font-semibold text-console-fg">Contact on Telegram</span>
          <span className="text-xs text-console-muted">
            Message us to upgrade manually — useful if you can&apos;t use ABA
          </span>
        </a>

        <a
          href={contactMailtoUrl}
          className="flex w-full flex-col items-start gap-1 rounded-xl border border-console-border bg-console-panel px-4 py-3.5 text-left transition hover:border-brand/50"
        >
          <span className="text-sm font-semibold text-console-fg">Email support</span>
          <span className="text-xs text-console-muted">Send an upgrade request by email</span>
        </a>
      </div>

      <div className="flex justify-center">
        <button type="button" className="console-btn-secondary" onClick={onBack}>
          Back to plans
        </button>
      </div>
    </div>
  );
}
