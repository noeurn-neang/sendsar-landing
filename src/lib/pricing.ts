import pricingData from "@/data/pricing.json";
import { siteConfig } from "@/lib/site";

export type BillingPeriod = keyof typeof pricingData.billingPeriods;

type PlanPrice = {
  monthly: number | null;
  annual?: number | null;
  display?: string;
};

type Plan = (typeof pricingData.plans)[number];

export type PricingTier = {
  id: string;
  name: string;
  price: string;
  priceSuffix?: string | null;
  compareAt?: string;
  savingsBadge?: string;
  billingSubtext?: string;
  description: string;
  cta: string;
  ctaHref: string;
  highlighted?: boolean;
  badge?: string | null;
  features: string[];
};

export type PricingComparisonRow = {
  feature: string;
  free: string | boolean;
  plus: string | boolean;
  pro: string | boolean;
  enterprise: string | boolean;
};

export type PricingComparisonSection = {
  title: string;
  rows: PricingComparisonRow[];
};

export type PricingFaq = {
  q: string;
  a: string;
};

export const billingPeriods = pricingData.billingPeriods;
export const billingPeriodOrder: BillingPeriod[] = ["monthly", "annual"];
export const defaultBillingPeriod =
  (pricingData.display.defaultBillingPeriod as BillingPeriod) ?? "annual";
export const pricingComparisonTitle = pricingData.display.comparisonTitle;
export const pricingFaqsTitle = pricingData.display.faqsTitle;
export const pricingSectionIntro = pricingData.display.pricingSectionIntro;
export const pricingPageIntro = pricingData.display.pricingPageIntro;

const voiceCallLabel = pricingData.display.voiceCallLabel;
const videoCallLabel = pricingData.display.videoCallLabel;
const recordingLabel = pricingData.display.recordingLabel;
const textChatMessagesLabel = pricingData.display.textChatMessagesLabel;
const textChatHistoryLabel = pricingData.display.textChatHistoryLabel;
const activeChattersLabel = pricingData.display.activeChattersLabel;
const concurrentConnectionsLabel = pricingData.display.concurrentConnectionsLabel;
const comparisonSectionUsage = pricingData.display.comparisonSectionUsage;
const comparisonSectionTechnical = pricingData.display.comparisonSectionTechnical;
const chatLines = pricingData.display.chatLines;
const callLines = pricingData.display.callLines;
const priceLabels = pricingData.display.priceLabels;
const monthSuffix = priceLabels.monthSuffix;

type PlanCalls = Plan["calls"];

const planById = Object.fromEntries(
  pricingData.plans.map((plan) => [plan.id, plan]),
) as Record<string, Plan>;

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: pricingData.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

function renderTemplate(
  template: string | undefined | null,
  vars: Record<string, string>,
): string {
  if (!template) return "";
  return template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? `{${key}}`);
}

function resolveAnnualAmount(monthly: number, explicitAnnual?: number | null): number {
  if (explicitAnnual != null) return explicitAnnual;
  const discount = billingPeriods.annual.discount;
  return Math.round(monthly * 12 * (1 - discount));
}

function getPlanAmount(plan: Plan, period: BillingPeriod): number | null {
  const priceData = plan.price as PlanPrice;

  if (priceData.display) return null;

  if (period === "monthly") {
    return priceData.monthly;
  }

  const monthly = priceData.monthly;
  if (monthly == null) return priceData.annual ?? null;

  return resolveAnnualAmount(monthly, priceData.annual);
}

function getAnnualDiscountPercent(): number {
  return Math.round(billingPeriods.annual.discount * 100);
}

function getPlanYearlySavings(planId: string): string {
  const plan = planById[planId];
  const monthly = (plan?.price as PlanPrice | undefined)?.monthly;
  if (monthly == null || monthly === 0) return formatUsd(0);

  const annual = getPlanAmount(plan, "annual");
  if (annual == null) return formatUsd(0);

  return formatUsd(monthly * 12 - annual);
}

function getGlobalTemplateVars(): Record<string, string> {
  return {
    discount: String(getAnnualDiscountPercent()),
    annualLabel: billingPeriods.annual.label,
    plusYearlySavings: getPlanYearlySavings("plus"),
    proYearlySavings: getPlanYearlySavings("pro"),
  };
}

export function getBillingPromoHeadline(): string {
  return renderTemplate(billingPeriods.annual.promoHeadline, getGlobalTemplateVars());
}

export function getBillingMonthlyHint(): string {
  return renderTemplate(billingPeriods.monthly.monthlyHint, getGlobalTemplateVars());
}

export function getBillingActiveNote(period: BillingPeriod): string {
  if (period === "monthly") return "";
  return renderTemplate(billingPeriods.annual.activeNote, getGlobalTemplateVars());
}

export function getBillingDiscountBadge(period: BillingPeriod): string | null {
  if (period === "monthly") return null;
  const badge = renderTemplate(billingPeriods.annual.badge, getGlobalTemplateVars());
  return badge || null;
}

export function getSchemaHighPrice(): string {
  const planId = pricingData.display.schemaHighPricePlanId;
  const plan = planById[planId];
  if (!plan) return "0";

  const annual = getPlanAmount(plan, "annual");
  return annual == null ? "0" : String(annual);
}

function formatHistoryDays(days: number): string {
  if (days < 30) return `${days} days`;
  if (days === 365) return "1 year";
  if (days === 1095) return "3 years";
  if (days % 365 === 0) return `${days / 365} years`;
  return `${Math.round(days / 30)} months`;
}

function formatPrice(
  plan: Plan,
  period: BillingPeriod,
): {
  price: string;
  priceSuffix: string | null;
  compareAt?: string;
  savingsBadge?: string;
  billingSubtext?: string;
} {
  const priceData = plan.price as PlanPrice;

  if (priceData.display) {
    return { price: priceData.display, priceSuffix: null };
  }

  const amount = getPlanAmount(plan, period);
  if (amount === null || amount === undefined) {
    return { price: "Custom", priceSuffix: null };
  }

  if (amount === 0) {
    return { price: formatUsd(0), priceSuffix: monthSuffix };
  }

  const monthlyList = priceData.monthly;
  if (monthlyList === null || monthlyList === undefined) {
    return { price: formatUsd(amount), priceSuffix: monthSuffix };
  }

  if (period === "monthly") {
    return { price: formatUsd(amount), priceSuffix: monthSuffix };
  }

  const monthlyEquivalent = amount / 12;
  const yearlyAtMonthlyRate = monthlyList * 12;
  const savingsAmount = yearlyAtMonthlyRate - amount;
  const discountPercent = Math.round((savingsAmount / yearlyAtMonthlyRate) * 100);
  const templateVars = {
    ...getGlobalTemplateVars(),
    discount: String(discountPercent),
    yearlySavings: formatUsd(savingsAmount),
    annualTotal: formatUsd(amount),
    monthlyYearTotal: formatUsd(yearlyAtMonthlyRate),
  };

  return {
    price: formatUsd(monthlyEquivalent),
    priceSuffix: monthSuffix,
    compareAt: renderTemplate(priceLabels.monthCompare, {
      price: formatUsd(monthlyList),
    }),
    savingsBadge:
      savingsAmount > 0
        ? renderTemplate(billingPeriods.annual.savingsBadge, templateVars)
        : undefined,
    billingSubtext: renderTemplate(billingPeriods.annual.billingSubtext, templateVars),
  };
}

function formatStorage(plan: Plan): string {
  const { includedGB, display } = plan.storage;
  if (display) return display;
  if (includedGB === null) return "Custom";
  const overage = plan.storage.overage;
  if (overage) {
    return `${includedGB} GB included (+ ${renderTemplate(priceLabels.storageOverage, {
      price: formatUsd(overage.pricePerBlock),
      blockGB: String(overage.blockGB),
    })} extra)`;
  }
  return `${includedGB} GB`;
}

function formatVoiceCallLine(calls: PlanCalls): string {
  const included = "includedVoiceCallMinutesPerMonth" in calls ? calls.includedVoiceCallMinutesPerMonth : null;
  const rate = "voiceCallPricePerMin" in calls ? calls.voiceCallPricePerMin : null;

  if (included != null && included > 0) {
    return renderTemplate(callLines.voiceIncluded, {
      minutes: formatNumber(included),
      voiceCallLabel,
    });
  }

  if (rate === "custom") {
    return renderTemplate(callLines.voiceUnlimited, { voiceCallLabel });
  }

  return renderTemplate(callLines.noVoiceCall, { voiceCallLabel });
}

function formatVideoCallLine(calls: PlanCalls): string {
  const included = "includedVideoCallMinutesPerMonth" in calls ? calls.includedVideoCallMinutesPerMonth : null;
  const rate = "videoCallPricePerMin" in calls ? calls.videoCallPricePerMin : null;

  if (included != null && included > 0) {
    return renderTemplate(callLines.videoIncluded, {
      minutes: formatNumber(included),
      videoCallLabel,
    });
  }

  if (rate === "custom") {
    return renderTemplate(callLines.videoUnlimited, { videoCallLabel });
  }

  return renderTemplate(callLines.noVideoCall, { videoCallLabel });
}

function formatRecordingLine(calls: PlanCalls): string {
  if (calls.recordingDisplay) return calls.recordingDisplay;
  if (!calls.recordingAvailable) return callLines.noRecording;

  const included =
    "includedRecordingMinutesPerMonth" in calls ? calls.includedRecordingMinutesPerMonth : null;

  if (included != null && included > 0) {
    return renderTemplate(callLines.recordingIncluded, {
      minutes: formatNumber(included),
      recordingLabel,
    });
  }

  if (calls.recordingPricePerMin === 0) return "Included, unlimited";

  return callLines.noRecording;
}

function formatCallFeatures(plan: Plan): string[] {
  const { calls } = plan;
  const lines = [
    formatVoiceCallLine(calls),
    formatVideoCallLine(calls),
    formatRecordingLine(calls),
  ];

  if (
    "afterIncludedMinutes" in calls &&
    calls.afterIncludedMinutes === "calls_paused_until_next_month"
  ) {
    lines.push(callLines.callsPauseAfterIncluded);
  }

  return lines;
}

function formatChat(plan: Plan): string[] {
  const { chat } = plan;
  const lines: string[] = [];

  if (chat.display) {
    lines.push(chatLines.unlimitedMessages);
  } else if (chat.messagesIncludedPerMonth !== null) {
    lines.push(
      renderTemplate(chatLines.messages, {
        count: formatNumber(chat.messagesIncludedPerMonth),
      }),
    );
  }

  if (chat.display && chat.messageHistoryDays === null) {
    lines.push(chatLines.unlimitedHistory);
  } else if (chat.messageHistoryDays !== null) {
    lines.push(
      renderTemplate(chatLines.history, {
        duration: formatHistoryDays(chat.messageHistoryDays),
      }),
    );
  }

  return lines;
}

function formatActiveChatters(plan: Plan): string {
  const { activeChatters } = plan;
  if (activeChatters.display) return activeChatters.display;
  if (activeChatters.maxPerMonth === null) return "Custom";
  return renderTemplate(chatLines.activeChatters, {
    count: formatNumber(activeChatters.maxPerMonth),
  });
}

function formatConcurrentConnections(plan: Plan): string {
  const { chat } = plan;
  if (chat.display && chat.peakConcurrentConnections === null) {
    return chatLines.unlimitedConcurrentConnections;
  }
  if (chat.peakConcurrentConnections === null) return "Custom";
  return renderTemplate(chatLines.concurrentConnections, {
    count: formatNumber(chat.peakConcurrentConnections),
  });
}

function buildFeatures(plan: Plan): string[] {
  const features = [
    formatActiveChatters(plan),
    ...formatChat(plan),
    formatStorage(plan),
    ...formatCallFeatures(plan),
  ];

  if ("infra" in plan && plan.infra === "dedicated") {
    features.push("Dedicated infrastructure");
  }

  if ("salesHighlights" in plan && Array.isArray(plan.salesHighlights)) {
    features.push(...plan.salesHighlights);
  }

  return features;
}

function resolveCtaHref(channel: string | undefined): string {
  switch (channel) {
    case "email":
      return siteConfig.contactMailto;
    case "telegram":
    default:
      return siteConfig.contactTelegram;
  }
}

function tierMeta(plan: Plan): Pick<PricingTier, "highlighted" | "badge" | "cta" | "ctaHref"> {
  const cta = "cta" in plan && plan.cta ? plan.cta : { label: "Contact us", channel: "email" };

  return {
    highlighted: "highlighted" in plan ? Boolean(plan.highlighted) : false,
    badge: "badge" in plan ? (plan.badge ?? null) : null,
    cta: cta.label,
    ctaHref: resolveCtaHref(cta.channel),
  };
}

export function getPricingTiers(period: BillingPeriod = defaultBillingPeriod): PricingTier[] {
  return pricingData.plans.map((plan) => {
    const pricing = formatPrice(plan, period);
    const meta = tierMeta(plan);

    return {
      id: plan.id,
      name: plan.name,
      price: pricing.price,
      priceSuffix: pricing.priceSuffix,
      compareAt: pricing.compareAt,
      savingsBadge: pricing.savingsBadge,
      billingSubtext: pricing.billingSubtext,
      description: plan.builtFor,
      features: buildFeatures(plan),
      ...meta,
    };
  });
}

export const pricingTiers = getPricingTiers(defaultBillingPeriod);

function cell(planId: string, value: string | boolean): string | boolean {
  return planById[planId] ? value : "—";
}

function chatCell(planId: string, field: "messages" | "history"): string {
  const plan = planById[planId];
  if (!plan) return "—";

  if (field === "messages") {
    if (plan.chat.display) return plan.chat.display;
    if (plan.chat.messagesIncludedPerMonth === null) return "Custom";
    return renderTemplate(priceLabels.messagesPerMonth, {
      count: formatNumber(plan.chat.messagesIncludedPerMonth),
    });
  }

  if (plan.chat.display && plan.chat.messageHistoryDays === null) return plan.chat.display;
  if (plan.chat.messageHistoryDays === null) return "Custom";
  return formatHistoryDays(plan.chat.messageHistoryDays);
}

function storageCell(planId: string): string {
  const plan = planById[planId];
  if (!plan) return "—";
  if (plan.storage.display) return plan.storage.display;
  if (plan.storage.includedGB === null) return "Custom";
  return `${plan.storage.includedGB} GB`;
}

function storageOverageCell(planId: string): string | boolean {
  const plan = planById[planId];
  if (!plan?.storage.overage) return false;
  const { pricePerBlock, blockGB } = plan.storage.overage;
  return renderTemplate(priceLabels.storageOverage, {
    price: formatUsd(pricePerBlock),
    blockGB: String(blockGB),
  });
}

function callsCell(planId: string): string {
  const plan = planById[planId];
  if (!plan) return "—";
  if (plan.calls.peakConcurrentCalls === null) {
    if (plan.id === "free") return "—";
    if (plan.calls.voiceCallPricePerMin === "custom") return "Custom";
    return "—";
  }
  return renderTemplate(priceLabels.concurrentCalls, {
    count: String(plan.calls.peakConcurrentCalls),
  });
}

function voiceCallMinutesCell(planId: string): string {
  const plan = planById[planId];
  if (!plan) return "—";
  return formatVoiceCallLine(plan.calls);
}

function videoCallMinutesCell(planId: string): string {
  const plan = planById[planId];
  if (!plan) return "—";
  return formatVideoCallLine(plan.calls);
}

function recordingCell(planId: string): string | boolean {
  const plan = planById[planId];
  if (!plan) return "—";
  const line = formatRecordingLine(plan.calls);
  if (!line) return false;
  if (line === callLines.noRecording) return false;
  return line;
}

const usageComparisonRows: PricingComparisonRow[] = [
  {
    feature: "Built for",
    free: planById.free.builtFor,
    plus: planById.plus.builtFor,
    pro: planById.pro.builtFor,
    enterprise: planById.enterprise.builtFor,
  },
  {
    feature: activeChattersLabel,
    free: formatActiveChatters(planById.free),
    plus: formatActiveChatters(planById.plus),
    pro: formatActiveChatters(planById.pro),
    enterprise: formatActiveChatters(planById.enterprise),
  },
  {
    feature: textChatMessagesLabel,
    free: chatCell("free", "messages"),
    plus: chatCell("plus", "messages"),
    pro: chatCell("pro", "messages"),
    enterprise: chatCell("enterprise", "messages"),
  },
  {
    feature: textChatHistoryLabel,
    free: chatCell("free", "history"),
    plus: chatCell("plus", "history"),
    pro: chatCell("pro", "history"),
    enterprise: chatCell("enterprise", "history"),
  },
  {
    feature: "Storage",
    free: storageCell("free"),
    plus: storageCell("plus"),
    pro: storageCell("pro"),
    enterprise: storageCell("enterprise"),
  },
  {
    feature: "Storage overage (extra)",
    free: cell("free", false),
    plus: storageOverageCell("plus"),
    pro: storageOverageCell("pro"),
    enterprise: cell("enterprise", "Custom"),
  },
  {
    feature: voiceCallLabel,
    free: voiceCallMinutesCell("free"),
    plus: voiceCallMinutesCell("plus"),
    pro: voiceCallMinutesCell("pro"),
    enterprise: voiceCallMinutesCell("enterprise"),
  },
  {
    feature: videoCallLabel,
    free: videoCallMinutesCell("free"),
    plus: videoCallMinutesCell("plus"),
    pro: videoCallMinutesCell("pro"),
    enterprise: videoCallMinutesCell("enterprise"),
  },
  {
    feature: recordingLabel,
    free: recordingCell("free"),
    plus: recordingCell("plus"),
    pro: recordingCell("pro"),
    enterprise: recordingCell("enterprise"),
  },
];

const technicalComparisonRows: PricingComparisonRow[] = [
  {
    feature: concurrentConnectionsLabel,
    free: formatConcurrentConnections(planById.free),
    plus: formatConcurrentConnections(planById.plus),
    pro: formatConcurrentConnections(planById.pro),
    enterprise: formatConcurrentConnections(planById.enterprise),
  },
  {
    feature: "Concurrent voice/video calls",
    free: callsCell("free"),
    plus: callsCell("plus"),
    pro: callsCell("pro"),
    enterprise: callsCell("enterprise"),
  },
];

export const pricingComparisonSections: PricingComparisonSection[] = [
  { title: comparisonSectionUsage, rows: usageComparisonRows },
  { title: comparisonSectionTechnical, rows: technicalComparisonRows },
];

export const pricingComparisonRows: PricingComparisonRow[] = [
  ...usageComparisonRows,
  ...technicalComparisonRows,
];

export const pricingFaqs: PricingFaq[] = pricingData.faqs.map((faq) => ({
  q: faq.question,
  a: renderTemplate(faq.answer, getGlobalTemplateVars()),
}));
