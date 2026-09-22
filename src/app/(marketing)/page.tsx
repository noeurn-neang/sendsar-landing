import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { PricingHighlight } from "@/components/landing/PricingHighlight";
import { HomeJsonLd } from "@/components/seo/HomeJsonLd";
import { createMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata = createMetadata({
  title: `${siteConfig.name} | Headless Chat API for B2B Platforms`,
  absoluteTitle: true,
  description: siteConfig.description,
  path: "/",
  keywords: [
    ...siteConfig.keywords,
    "CometChat alternative",
    "Sendbird alternative",
    "headless messaging API",
    "platform chat integration",
    "marketplace chat API",
    "delivery app chat",
  ],
});

export default function HomePage() {
  return (
    <>
      <HomeJsonLd />
      <Hero />
      <HowItWorks />
      <PricingHighlight />
    </>
  );
}
