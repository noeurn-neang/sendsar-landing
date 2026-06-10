import type { Metadata } from "next";

import { siteConfig } from "@/lib/site";

export function absoluteUrl(path = "/") {
  const base = siteConfig.siteUrl.replace(/\/$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

type CreateMetadataOptions = {
  title: string;
  description?: string;
  path?: string;
  image?: string | null;
  keywords?: string[];
  noIndex?: boolean;
  absoluteTitle?: boolean;
  openGraphType?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
};

export function createMetadata({
  title,
  description = siteConfig.description,
  path = "/",
  image,
  keywords,
  noIndex = false,
  absoluteTitle = false,
  openGraphType = "website",
  publishedTime,
  modifiedTime,
  authors,
}: CreateMetadataOptions): Metadata {
  const url = absoluteUrl(path);
  const ogImage = image ?? absoluteUrl("/opengraph-image");

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    keywords: keywords ?? [...siteConfig.keywords],
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      type: openGraphType,
      locale: "en_US",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
      ...(authors?.length ? { authors } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export const rootMetadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: `${siteConfig.name} | ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  applicationName: siteConfig.name,
  authors: [{ name: "direxme" }],
  creator: "direxme",
  openGraph: {
    siteName: siteConfig.name,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};
