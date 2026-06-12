import { siteConfig } from "@/lib/site";

export type PricingTier = {
  id: string;
  name: string;
  price: string;
  priceNote?: string;
  description: string;
  cta: string;
  ctaHref: string;
  highlighted?: boolean;
  features: string[];
};

export const pricingTiers: PricingTier[] = [
  {
    id: "build",
    name: "Build",
    price: "$0",
    priceNote: "Early access · self-host or sandbox",
    description:
      "Integrate locally or on your own infra. Contact us for sandbox credentials while hosted tiers roll out.",
    cta: "Get early access",
    ctaHref: siteConfig.earlyAccessMailto,
    features: [
      "Self-host the open-source gateway",
      "Full REST + WebSocket API",
      "Session JWT flow",
      "Direct founder support",
    ],
  },
  {
    id: "platform",
    name: "Platform",
    price: "$149",
    priceNote: "Per month · billed monthly",
    description: "Flat pricing for production platforms — onboarding by request during early access.",
    cta: "Contact us",
    ctaHref: siteConfig.contactMailto,
    highlighted: true,
    features: [
      "Up to 10,000 monthly active users",
      "Multi-tenant isolation",
      "Webhooks & presence",
      "Email support",
    ],
  },
  {
    id: "scale",
    name: "Scale",
    price: "$399",
    priceNote: "Per month · billed monthly",
    description: "Higher limits and optional voice/video for teams shipping at volume.",
    cta: "Contact us",
    ctaHref: siteConfig.contactMailto,
    features: [
      "Up to 50,000 monthly active users",
      "Voice & video (LiveKit)",
      "Priority support",
      "99.9% uptime SLA",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    priceNote: "Volume discounts available",
    description: "Dedicated infrastructure, compliance needs, and hands-on onboarding.",
    cta: "Contact us",
    ctaHref: siteConfig.contactMailto,
    features: [
      "Custom MAU & concurrency",
      "Dedicated support & SLA",
      "Security review & DPA",
      "Migration assistance",
    ],
  },
];

export const pricingComparisonRows = [
  { feature: "Monthly active users", build: "Unlimited (dev)", platform: "10,000", scale: "50,000", enterprise: "Custom" },
  { feature: "Pricing model", build: "Free", platform: "Flat monthly", scale: "Flat monthly", enterprise: "Custom" },
  { feature: "Per-MAU overages", build: "—", platform: "None", scale: "None", enterprise: "Negotiable" },
  { feature: "Headless API", build: true, platform: true, scale: true, enterprise: true },
  { feature: "Your user IDs & auth", build: true, platform: true, scale: true, enterprise: true },
  { feature: "Webhooks", build: true, platform: true, scale: true, enterprise: true },
  { feature: "Multi-tenant", build: true, platform: true, scale: true, enterprise: true },
  { feature: "Voice & video", build: false, platform: false, scale: true, enterprise: true },
  { feature: "Uptime SLA", build: "—", platform: "—", scale: "99.9%", enterprise: "Custom" },
  { feature: "Support", build: "Community", platform: "Email", scale: "Priority", enterprise: "Dedicated" },
] as const;

export const pricingFaqs = [
  {
    q: "How do I get started today?",
    a: "Email us or message on Telegram — we'll share docs, answer architecture questions, and set up sandbox or self-host access. Hosted production tiers are onboarding early partners one at a time.",
  },
  {
    q: "Why flat pricing instead of per-MAU?",
    a: "Flash Chat is built for B2B platforms with predictable unit economics. Flat tiers mean you can forecast costs without surprise bills when a customer goes viral.",
  },
  {
    q: "Can I self-host on the Build plan?",
    a: "Yes. The gateway is open source — run it on your own infrastructure for development and production if that fits your compliance model.",
  },
  {
    q: "What counts as a monthly active user?",
    a: "A unique user who connects to Flash Chat at least once in a calendar month via a session JWT. Inactive users don't count.",
  },
  {
    q: "Do you include UI components?",
    a: "We're headless by design. You get SDKs and APIs; your team owns the chat UI inside your existing product.",
  },
] as const;
