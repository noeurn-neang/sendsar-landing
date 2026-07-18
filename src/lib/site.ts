const docsUrl =
  process.env.NEXT_PUBLIC_DOCS_URL ?? "https://docs.sendsar.com";

export const siteConfig = {
  name: "Sendsar",
  tagline: "Headless Chat API",
  description:
    "Add messaging, voice, and video to your product without replacing auth, users, or UI. Your IDs, your login, our real-time engine.",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://sendsar.com",
  docsUrl,
  quickstartUrl: `${docsUrl.replace(/\/$/, "")}/setup/quickstart`,
  demoUrl:
    process.env.NEXT_PUBLIC_DEMO_URL ?? "https://demo.sendsar.com",
  contactEmail: "noeurnnneang@gmail.com",
  contactTelegram: "https://t.me/noeurn_neang",
  contactMailto: "mailto:noeurnnneang@gmail.com?subject=Sendsar",
  contactNote:
    "Start on the Free plan or message us on Telegram — we'll help you wire up chat, calls, and production.",
  /** Solo operator of the Sendsar service (not a registered company). */
  legal: {
    operatorName: "Noeurn Neang",
    governingLaw: "Cambodia",
    hostingRegion: "Singapore (Contabo)",
    fileStorage: "Cloudflare R2",
    lastUpdated: "2026-07-18",
  },
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
    "voice and video API",
    "LiveKit chat",
  ],
} as const;
