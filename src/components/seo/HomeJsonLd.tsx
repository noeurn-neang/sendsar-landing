import { JsonLd } from "@/components/seo/JsonLd";
import { absoluteUrl } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export function HomeJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "@id": `${absoluteUrl("/")}#organization`,
            name: siteConfig.name,
            url: absoluteUrl("/"),
            logo: absoluteUrl("/favicon.svg"),
          },
          {
            "@type": "WebSite",
            "@id": `${absoluteUrl("/")}#website`,
            url: absoluteUrl("/"),
            name: siteConfig.name,
            description: siteConfig.description,
            publisher: { "@id": `${absoluteUrl("/")}#organization` },
          },
          {
            "@type": "SoftwareApplication",
            name: siteConfig.name,
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web",
            description: siteConfig.description,
            url: absoluteUrl("/"),
            documentation: siteConfig.docsUrl,
            offers: {
              "@type": "AggregateOffer",
              lowPrice: "0",
              highPrice: "399",
              priceCurrency: "USD",
              offerCount: "4",
            },
          },
        ],
      }}
    />
  );
}
