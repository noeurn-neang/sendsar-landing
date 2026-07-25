import { BlogPreview } from "@/components/landing/BlogPreview";
import { Capabilities } from "@/components/landing/Capabilities";
import { ClosingCta } from "@/components/landing/ClosingCta";
import { DevExperience } from "@/components/landing/DevExperience";
import { Differentiator } from "@/components/landing/Differentiator";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { PlatformOverview } from "@/components/landing/PlatformOverview";
import { PricingSection } from "@/components/landing/PricingSection";
import { TrustedStats } from "@/components/landing/TrustedStats";
import { UseCases } from "@/components/landing/UseCases";
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
      <TrustedStats />
      <PlatformOverview />
      <HowItWorks />
      <Capabilities />
      <UseCases />
      <PricingSection />
      <DevExperience />
      <Differentiator />
      <BlogPreview />
      <ClosingCta />
    </>
  );
}
