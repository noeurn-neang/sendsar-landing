const docsUrl =
  process.env.NEXT_PUBLIC_DOCS_URL ?? "https://docs.sendsar.com";

export const siteConfig = {
  name: "Sendsar",
  tagline: "Headless Chat API",
  description:
    "Add two-party messaging to your product without replacing auth, users, or UI. Your IDs, your login, our real-time engine.",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://sendsar.com",
  docsUrl,
  quickstartUrl: `${docsUrl.replace(/\/$/, "")}/setup/quickstart`,
  demoUrl:
    process.env.NEXT_PUBLIC_DEMO_URL ?? "https://demo.sendsar.com",
  contactEmail: "noeurnnneang@gmail.com",
  contactTelegram: "https://t.me/noeurn_neang",
  earlyAccessMailto:
    "mailto:noeurnnneang@gmail.com?subject=Sendsar%20%E2%80%94%20early%20access",
  contactMailto: "mailto:noeurnnneang@gmail.com?subject=Sendsar",
  earlyAccessNote:
    "We're onboarding early partners personally — reach out by email or Telegram while we scale hosted infrastructure.",
  keywords: [
    "Sendsar",
    "headless chat API",
    "in-app messaging",
    "B2B chat",
    "two-party messaging",
    "chat SDK",
    "real-time messaging",
    "WebSocket chat",
    "marketplace chat",
  ],
} as const;
