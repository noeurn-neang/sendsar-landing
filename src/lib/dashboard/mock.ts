/** Demo tenant console data until control-plane APIs exist. */

export const demoTenant = {
  id: "ten_demo_acme",
  name: "Acme Delivery",
  slug: "acme-delivery",
  planId: "plus" as const,
  planName: "Plus",
  region: "ap-southeast",
  createdAt: "2026-03-12",
  webhookUrl: "https://api.acme.kh/webhooks/sendsar",
};

export const demoUsage = {
  periodLabel: "Jul 2026",
  activeChatters: { used: 842, limit: 2500 },
  messages: { used: 18420, limit: 50000 },
  voiceMinutes: { used: 96, limit: 240 },
  videoMinutes: { used: 41, limit: 120 },
  recordingMinutes: { used: 58, limit: 240 },
  storageGB: { used: 2.4, limit: 5 },
  series: [
    { day: "Jul 1", messages: 410, chatters: 120 },
    { day: "Jul 3", messages: 520, chatters: 145 },
    { day: "Jul 5", messages: 680, chatters: 190 },
    { day: "Jul 7", messages: 740, chatters: 210 },
    { day: "Jul 9", messages: 610, chatters: 185 },
    { day: "Jul 11", messages: 890, chatters: 240 },
    { day: "Jul 13", messages: 920, chatters: 255 },
    { day: "Jul 15", messages: 780, chatters: 220 },
  ],
};

export const demoKeys = [
  {
    id: "key_live_1",
    name: "Production",
    prefix: "sk_live_acme",
    masked: "sk_live_acme••••••••••••••••4f2a",
    createdAt: "2026-03-12",
    lastUsedAt: "2026-07-15",
    status: "active" as const,
  },
  {
    id: "key_test_1",
    name: "Sandbox",
    prefix: "sk_test_acme",
    masked: "sk_test_acme••••••••••••••••91bc",
    createdAt: "2026-03-12",
    lastUsedAt: "2026-07-10",
    status: "active" as const,
  },
];

export const demoBilling = {
  planName: "Plus",
  priceMonthly: 19,
  billingPeriod: "annual" as const,
  nextInvoiceAt: "2027-03-12",
  annualTotal: 182,
  paymentMethod: "Visa •••• 4242",
  invoices: [
    { id: "inv_2026_03", date: "2026-03-12", amount: 182, status: "paid" as const },
    { id: "inv_2025_03", date: "2025-03-12", amount: 182, status: "paid" as const },
  ],
};

export const demoSettings = {
  tenantName: demoTenant.name,
  webhookUrl: demoTenant.webhookUrl,
  chatHistoryDays: 365,
  recordingEnabled: true,
  voiceEnabled: true,
  videoEnabled: true,
};

export function usagePercent(used: number, limit: number): number {
  if (limit <= 0) return 0;
  return Math.min(100, Math.round((used / limit) * 100));
}

export function formatCount(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}
