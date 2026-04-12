import Link from "next/link";

import { MessengerCta } from "@/components/product/messenger-cta";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteHero({
  title,
  subtitle,
  messengerHref,
  showMessengerHint,
}: {
  title: string;
  subtitle: string;
  messengerHref: string | null | undefined;
  showMessengerHint?: boolean;
}) {
  return (
    <section
      className="relative overflow-hidden border-b border-foreground/[0.06] bg-background"
      aria-labelledby="hero-title"
    >
      <div
        className="pointer-events-none absolute -right-32 top-0 h-[min(85vh,720px)] w-[min(85vw,640px)] rounded-full bg-[radial-gradient(closest-side,oklch(0.88_0.04_78/0.45),transparent)] blur-3xl dark:bg-[radial-gradient(closest-side,oklch(0.42_0.06_72/0.4),transparent)]"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,oklch(0.99_0.006_82)_0%,transparent_42%)] dark:bg-[linear-gradient(180deg,oklch(0.26_0.02_54/0.95)_0%,transparent_48%)]" />

      <div className="relative mx-auto grid min-w-0 max-w-6xl gap-10 px-4 py-16 sm:gap-12 sm:px-6 sm:py-20 md:px-8 md:py-24 lg:min-h-[min(88dvh,820px)] lg:grid-cols-12 lg:items-center lg:gap-10 lg:py-28">
        <div className="flex min-w-0 flex-col justify-center lg:col-span-6 lg:pr-4">
          <p className="font-accent text-[0.65rem] font-medium uppercase tracking-[0.38em] text-muted-foreground">
            Maison & curation
          </p>
          <h1
            id="hero-title"
            className="font-display mt-6 max-w-full break-words text-[clamp(1.875rem,calc(0.35rem+5vw),4.25rem)] font-medium leading-[1.08] tracking-[-0.03em] text-foreground sm:max-w-[18ch]"
          >
            {title}
          </h1>
          <div className="mt-8 h-px w-12 bg-gradient-to-r from-gold to-gold/20" aria-hidden />
          <p className="mt-8 max-w-lg text-[1.05rem] leading-[1.75] text-muted-foreground sm:text-lg">
            {subtitle}
          </p>
          <div className="mt-10 flex w-full max-w-md flex-col gap-3 sm:mt-12 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-stretch">
            <Link
              href="/products"
              className={cn(
                buttonVariants({ size: "lg" }),
                "inline-flex w-full min-h-11 shrink-0 items-center justify-center border border-foreground/10 bg-foreground text-background shadow-none transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:bg-foreground/90 hover:shadow-md sm:w-auto sm:min-h-9",
              )}
            >
              Explore the collection
            </Link>
            <MessengerCta
              messengerHref={messengerHref}
              size="lg"
              buttonVariant={showMessengerHint ? "secondary" : "outline"}
              className={
                showMessengerHint
                  ? "inline-flex w-full min-h-11 items-center justify-center sm:w-auto sm:min-h-9"
                  : cn(
                      "inline-flex w-full min-h-11 items-center justify-center border-foreground/20 bg-background/80 text-foreground shadow-none backdrop-blur-sm transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-foreground/30 hover:bg-muted/50 sm:w-auto sm:min-h-9",
                    )
              }
            />
          </div>
          {showMessengerHint ? (
            <p className="mt-8 max-w-md text-xs leading-relaxed text-muted-foreground">
              Set your Facebook Messenger URL in Admin → Site settings so this
              button opens a prefilled inquiry for guests.
            </p>
          ) : null}
        </div>

        <div
          className="relative hidden min-h-[20rem] lg:col-span-6 lg:block lg:min-h-[min(28rem,52vh)]"
          aria-hidden
        >
          <div className="absolute inset-0 border border-foreground/[0.08] bg-gradient-to-br from-muted/25 via-background to-muted/40" />
          <div className="absolute inset-6 border border-foreground/[0.05]" />
          <p className="absolute bottom-10 left-10 font-display text-[clamp(3rem,8vw,5.5rem)] font-medium leading-none tracking-[-0.04em] text-foreground/[0.06] dark:text-foreground/[0.1]">
            No. 01
          </p>
        </div>
      </div>
    </section>
  );
}
