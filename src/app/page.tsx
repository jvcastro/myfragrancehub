import type { Metadata } from "next";
import Link from "next/link";

import { CategoriesStrip } from "@/components/home/categories-strip";
import { FeaturedProductsSection } from "@/components/home/featured-products";
import { SiteHero } from "@/components/home/site-hero";
import { buttonVariants } from "@/components/ui/button";
import { absoluteUrl, siteConfig } from "@/config/site";
import { createCaller } from "@/trpc/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Home",
  description: siteConfig.defaultDescription,
  alternates: { canonical: absoluteUrl("/") },
};

export default async function HomePage() {
  const api = await createCaller();
  const [settings, featured, categories] = await Promise.all([
    api.settings.get(),
    api.product.featured(),
    api.category.list(),
  ]);

  const heroTitle = settings?.heroTitle ?? siteConfig.name;
  const heroSubtitle = settings?.heroSubtitle ?? siteConfig.defaultDescription;
  const messengerHref = settings?.facebookMessengerLink;
  const showMessengerHint = !messengerHref?.trim();

  const categoryCards = categories
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      count: c._count.products,
    }))
    .filter((c) => c.count > 0);

  return (
    <main className="flex flex-1 flex-col">
      <SiteHero
        title={heroTitle}
        subtitle={heroSubtitle}
        messengerHref={messengerHref}
        showMessengerHint={showMessengerHint}
      />
      {featured.length > 0 ? (
        <FeaturedProductsSection products={featured} />
      ) : null}
      <CategoriesStrip categories={categoryCards} />
      <section
        className="border-b border-foreground/[0.06] bg-[var(--surface-elevated)] py-24 sm:py-32"
        aria-labelledby="intro-heading"
      >
        <div className="mx-auto grid min-w-0 max-w-6xl gap-10 px-4 sm:gap-12 sm:px-6 md:px-8 lg:grid-cols-12 lg:gap-16">
          <div className="min-w-0 lg:col-span-5">
            <p className="font-accent text-[0.65rem] font-medium uppercase tracking-[0.32em] text-muted-foreground">
              Philosophy
            </p>
            <h2
              id="intro-heading"
              className="font-display mt-4 text-[clamp(1.85rem,3.5vw,2.75rem)] leading-[1.12] tracking-[-0.03em] text-foreground"
            >
              The art of wearing scent
            </h2>
          </div>
          <div className="flex min-w-0 flex-col justify-center border-t border-foreground/[0.08] pt-8 sm:pt-10 lg:col-span-7 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0 xl:pl-14">
            <p className="text-[1.02rem] leading-[1.75] text-muted-foreground sm:text-[1.05rem] sm:leading-[1.8]">
              {siteConfig.tagline} We believe fragrance deserves a conversation,
              not a cart. Browse the collection, then reach out on
              Messenger—every inquiry is answered personally.
            </p>
            <div className="mt-8 sm:mt-10">
              <Link
                href="/products"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "inline-flex w-full min-h-11 items-center justify-center border-foreground/15 bg-background/80 sm:w-auto sm:min-h-9",
                )}
              >
                View the collection
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
