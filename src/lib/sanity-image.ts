import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";

import { client } from "@/sanity/client";

const { projectId, dataset } = client.config();

export function urlFor(source: SanityImageSource) {
  if (!projectId || !dataset) return null;
  return createImageUrlBuilder({ projectId, dataset }).image(source);
}

export function ogImageUrl(source: SanityImageSource) {
  return urlFor(source)?.width(1200).height(630).fit("crop").url() ?? null;
}
