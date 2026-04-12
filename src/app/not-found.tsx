import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col">
      <div className="mx-auto flex min-w-0 max-w-lg flex-col items-center px-4 py-20 text-center sm:px-6 sm:py-28 md:py-32">
        <p className="font-accent text-[0.65rem] font-medium uppercase tracking-[0.32em] text-muted-foreground">
          404
        </p>
        <h1 className="mt-4 font-display text-4xl tracking-[-0.03em] text-foreground sm:text-5xl">
          This page isn&apos;t here
        </h1>
        <p className="mt-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
          The link may be outdated, or the page was removed. Browse the collection
          or return to {siteConfig.name}.
        </p>
        <div className="mt-10 flex w-full max-w-xs flex-col gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center">
          <Link
            href="/"
            className={cn(
              buttonVariants(),
              "inline-flex w-full min-h-11 items-center justify-center sm:w-auto sm:min-h-9",
            )}
          >
            Home
          </Link>
          <Link
            href="/products"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "inline-flex w-full min-h-11 items-center justify-center sm:w-auto sm:min-h-9",
            )}
          >
            Collection
          </Link>
        </div>
      </div>
    </main>
  );
}
