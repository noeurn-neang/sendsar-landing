const docsUrl =
  process.env.NEXT_PUBLIC_DOCS_URL ?? "https://flashchat-docs.direxme.com";

export const siteConfig = {
  name: "Flash Chat",
  tagline: "Headless Chat API",
  description:
    "Add two-party messaging to your product without replacing auth, users, or UI. Your IDs, your login, our real-time engine.",
  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://flashchat.direxme.com",
  docsUrl,
  quickstartUrl: `${docsUrl.replace(/\/$/, "")}/setup/quickstart`,
  demoUrl:
    process.env.NEXT_PUBLIC_DEMO_URL ?? "https://flashchat-demo.direxme.com",
  contactEmail: "noeurnnneang@gmail.com",
  contactTelegram: "https://t.me/noeurn_neang",
  earlyAccessMailto:
    "mailto:noeurnnneang@gmail.com?subject=Flash%20Chat%20%E2%80%94%20early%20access",
  contactMailto:
    "mailto:noeurnnneang@gmail.com?subject=Flash%20Chat",
  earlyAccessNote:
    "We're onboarding early partners personally — reach out by email or Telegram while we scale hosted infrastructure.",
  keywords: [
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
