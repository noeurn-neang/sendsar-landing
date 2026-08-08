const docsUrl =
  process.env.NEXT_PUBLIC_DOCS_URL ?? "https://docs.sendsar.com";

export const siteConfig = {
  name: "Sendsar",
  tagline: "Headless Chat API",
  description:
    "Your users, your login — messaging, voice, and video. Headless chat API with UI Kits and SDKs.",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://sendsar.com",
  docsUrl,
  quickstartUrl: `${docsUrl.replace(/\/$/, "")}/setup/quickstart`,
  contactEmail: "support@sendsar.com",
  contactTelegram: "https://t.me/sendsar_support",
  contactMailto: "mailto:support@sendsar.com?subject=Sendsar",
  contactNote: "Start free, or message us on Telegram.",
  /** Solo operator of the Sendsar service (not a registered company). */
  legal: {
    operatorName: "Noeurn Neang",
    governingLaw: "Cambodia",
    hostingRegion: "Singapore (Contabo)",
    fileStorage: "Cloudflare R2",
    lastUpdated: "2026-07-21",
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
