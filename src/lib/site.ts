const docsUrl =
  process.env.NEXT_PUBLIC_DOCS_URL ?? "https://flashchat-api.direxme.com/docs";

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
