import Image from "next/image";

import { ContactCta } from "@/components/landing/ContactCta";

export function Hero() {
  return (
    <section className="border-b border-border bg-marketing-wash">
      <div className="container mx-auto max-w-6xl px-6 pb-10 pt-14 lg:pb-16 lg:pt-20">
        <div className="marketing-fade-up mx-auto max-w-2xl text-center">
          <p className="font-brand text-2xl font-extrabold tracking-[-0.04em] text-foreground sm:text-3xl">
            Send<span className="text-brand">sar</span>
          </p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Headless chat for your product
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-neutral-600 sm:text-lg dark:text-neutral-300">
            Your users, your login — messaging, voice &amp; video.
          </p>
          <div className="mt-8">
            <ContactCta
              variant="light"
              showDocsLink
              primaryLabel="Start free"
              primaryHref="/start"
            />
          </div>
        </div>

        <div className="marketing-fade-up-delay relative mx-auto mt-12 max-w-5xl lg:mt-16">
          <Image
            src="/image-chat-hero@2x.png"
            alt="Chat UI with messaging, voice, video, and reactions"
            width={1600}
            height={1000}
            priority
            className="h-auto w-full object-contain object-bottom"
            sizes="(max-width: 1024px) 100vw, 1024px"
          />
        </div>
      </div>
    </section>
  );
}
