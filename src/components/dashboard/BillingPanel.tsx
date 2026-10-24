"use client";

import { useState } from "react";

import { PlanPickerModal } from "@/components/dashboard/PlanPickerModal";
import { Panel, StatusPill } from "@/components/dashboard/ui";

type BillingPanelProps = {
  planId: string;
  planName: string;
  tenantId: string;
  slug: string | null;
  abaEnabled: boolean;
  upgraded?: boolean;
};

export function BillingPanel({
  planId,
  planName,
  tenantId,
  slug,
  abaEnabled,
  upgraded,
}: BillingPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4">
      {upgraded ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-5 py-4 text-sm text-console-fg">
          Plan updated successfully. Limits now follow your{" "}
          <span className="font-medium">{planName}</span> allowance.
        </div>
      ) : null}

      <Panel title="Current plan" description="Synced with your tenant record">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-2xl font-semibold tracking-tight text-console-fg">{planName}</p>
            <p className="mt-1 text-sm text-console-muted">
              {planId === "free"
                ? "Choose a plan when you need higher limits."
                : "Change plan anytime from the plan picker."}
            </p>
          </div>
          <StatusPill tone="success">Active</StatusPill>
        </div>
        <div className="mt-5">
          <button type="button" className="console-btn-primary" onClick={() => setOpen(true)}>
            {planId === "free" ? "Upgrade" : "Change plan"}
          </button>
        </div>
      </Panel>

      <PlanPickerModal
        open={open}
        onClose={() => setOpen(false)}
        currentPlanId={planId}
        tenantId={tenantId}
        slug={slug}
        planName={planName}
        abaEnabled={abaEnabled}
      />
    </div>
  );
}
