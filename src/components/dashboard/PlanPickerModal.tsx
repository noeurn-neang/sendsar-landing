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
        className={
          step.kind === "aba"
            ? "relative z-[81] my-4 w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-[#eef2f6] shadow-2xl"
            : "relative z-[81] my-4 w-full max-w-5xl rounded-2xl border border-console-border bg-console-panel shadow-2xl"
        }
      >
        <div
          className={
            step.kind === "aba"
              ? "flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 sm:px-6"
              : "flex items-start justify-between gap-4 border-b border-console-border bg-console-panel px-5 py-4 sm:px-6"
          }
        >
          <div>
            <h2
              id="plan-picker-title"
              className={
                step.kind === "aba"
                  ? "text-xl font-extrabold tracking-tight text-slate-900"
                  : "text-xl font-extrabold tracking-tight text-console-fg"
              }
            >
              {title}
            </h2>
            <p
              className={
                step.kind === "aba"
                  ? "mt-1 text-sm font-medium text-slate-600"
                  : "mt-1 text-sm font-medium text-console-muted"
              }
            >
              {subtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={
              step.kind === "aba"
                ? "rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
                : "rounded-lg border border-console-border bg-console-canvas px-3 py-1.5 text-sm font-semibold text-console-fg transition hover:border-brand/40"
            }
          >
            Close
          </button>
        </div>

        <div className={step.kind === "aba" ? "px-4 pb-0 pt-4 sm:px-6" : "px-4 py-6 sm:px-6"}>
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

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.539.02.832-.15 1.949-.786 6.67-.786 6.67-.348 1.48-.986 1.74-1.588 1.78-.854.056-1.5-.566-2.328-1.11-1.294-.847-2.025-1.373-3.28-2.2-1.45-.956-.51-1.482.316-2.34.216-.224 3.968-3.635 4.043-3.944.009-.039.018-.18-.067-.254-.085-.074-.21-.049-.3-.029-.128.024-2.17 1.38-6.13 4.05-.58.4-1.106.594-1.56.572-.514-.024-1.504-.291-2.24-.53-.902-.292-1.62-.447-1.558-.942.032-.258.386-.523 1.063-.79 4.16-1.81 6.937-3.004 8.33-3.604 3.96-1.705 4.78-2.002 5.319-2.01z" />
    </svg>
  );
}

function EmailIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
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

  const optionClass =
    "group flex w-full items-center gap-3.5 rounded-2xl border border-console-border bg-console-panel px-3.5 py-3.5 text-left transition hover:border-brand/45 hover:bg-console-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40";

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
          <button type="button" onClick={onChooseAba} className={optionClass}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/billing/aba-khqr.webp"
              alt=""
              width={48}
              height={48}
              className="h-12 w-12 shrink-0 rounded-xl object-cover shadow-sm ring-1 ring-black/5"
            />
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-console-fg">ABA KHQR</span>
                <span className="rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                  Instant
                </span>
              </span>
              <span className="mt-0.5 block text-xs text-console-muted">
                Scan QR with any KHQR banking app
              </span>
            </span>
            <ChevronRightIcon className="h-5 w-5 shrink-0 text-console-muted transition group-hover:text-brand" />
          </button>
        ) : null}

        <a
          href={contactTelegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={optionClass}
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#229ED9] text-white shadow-sm">
            <TelegramIcon className="h-7 w-7" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-console-fg">Telegram</span>
            <span className="mt-0.5 block text-xs text-console-muted">
              Chat with us to upgrade manually
            </span>
          </span>
          <ChevronRightIcon className="h-5 w-5 shrink-0 text-console-muted transition group-hover:text-brand" />
        </a>

        <a href={contactMailtoUrl} className={optionClass}>
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-700 text-white shadow-sm dark:bg-slate-600">
            <EmailIcon className="h-6 w-6" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-console-fg">Email</span>
            <span className="mt-0.5 block text-xs text-console-muted">
              Send an upgrade request by email
            </span>
          </span>
          <ChevronRightIcon className="h-5 w-5 shrink-0 text-console-muted transition group-hover:text-brand" />
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
