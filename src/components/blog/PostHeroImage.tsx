import { urlFor } from "@/lib/sanity-image";
import type { BlogPost } from "@/lib/blog";

type PostHeroImageProps = {
  image: NonNullable<BlogPost["image"]>;
  alt: string;
};

export function PostHeroImage({ image, alt }: PostHeroImageProps) {
  const imageUrl = urlFor(image)?.width(1200).height(675).fit("crop").url();

  if (!imageUrl) return null;

  return (
    <figure className="mb-10 overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={alt}
        className="aspect-[16/9] w-full object-cover"
        width={1200}
        height={675}
      />
    </figure>
  );
}
