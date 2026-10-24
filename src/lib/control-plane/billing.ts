import "server-only";

import { consoleFetch } from "@/lib/console-api";

export type BillingPaymentRow = {
  id: string;
  tenantId: string;
  accountId: string;
  plan: string;
  period: string;
  amountUsd: number;
  currency: string;
  status: string;
  clientId: string;
  deviceId: string;
  abaToken?: string | null;
  abaTransactionRef?: string | null;
  paidThrough?: string | null;
  expiresAt: string;
  createdAt: string;
};

export type CompleteBillingPaymentResult = {
  payment: BillingPaymentRow;
  plan: string;
};

export async function createBillingPayment(input: {
  accountId: string;
  tenantId: string;
  plan: string;
  period: string;
  amountUsd: number;
  currency?: string;
  clientId: string;
  deviceId: string;
  abaToken: string;
  expiresIn: number;
}): Promise<BillingPaymentRow> {
  return consoleFetch<BillingPaymentRow>(
    `/v1/console/tenants/${input.tenantId}/billing/payments`,
    {
      method: "POST",
      body: {
        accountId: input.accountId,
        plan: input.plan,
        period: input.period,
        amountUsd: input.amountUsd,
        currency: input.currency ?? "USD",
        clientId: input.clientId,
        deviceId: input.deviceId,
        abaToken: input.abaToken,
        expiresIn: input.expiresIn,
      },
    },
  );
}

export async function getBillingPayment(
  accountId: string,
  tenantId: string,
  paymentId: string,
): Promise<BillingPaymentRow | null> {
  return consoleFetch<BillingPaymentRow | null>(
    `/v1/console/tenants/${tenantId}/billing/payments/${paymentId}`,
    {
      allowEmpty: true,
      query: { accountId },
    },
  );
}

export async function completeBillingPayment(input: {
  accountId: string;
  tenantId: string;
  paymentId: string;
  transactionRef?: string;
}): Promise<CompleteBillingPaymentResult> {
  return consoleFetch<CompleteBillingPaymentResult>(
    `/v1/console/tenants/${input.tenantId}/billing/payments/${input.paymentId}/complete`,
    {
      method: "POST",
      body: {
        accountId: input.accountId,
        transactionRef: input.transactionRef,
      },
    },
  );
}
