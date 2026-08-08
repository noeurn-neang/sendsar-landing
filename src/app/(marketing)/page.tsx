import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { IntegratePaths } from "@/components/landing/IntegratePaths";
import { PriceClose } from "@/components/landing/PriceClose";
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
      <IntegratePaths />
      <HowItWorks />
      <PriceClose />
    </>
  );
}
