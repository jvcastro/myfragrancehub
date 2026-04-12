"use client";

import { useEffect } from "react";
import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col">
      <div className="mx-auto flex min-w-0 max-w-lg flex-col items-center px-4 py-20 text-center sm:px-6 sm:py-28 md:py-32">
        <p className="font-accent text-[0.65rem] font-medium uppercase tracking-[0.32em] text-muted-foreground">
          Error
        </p>
        <h1 className="mt-4 font-display text-4xl tracking-[-0.03em] text-foreground sm:text-5xl">
          Something went wrong
        </h1>
        <p className="mt-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {siteConfig.name} hit an unexpected issue loading this view. You can
          retry, or go back to a stable page.
        </p>
        <div className="mt-10 flex w-full max-w-xs flex-col gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center">
          <Button
            type="button"
            className="w-full min-h-11 sm:w-auto sm:min-h-9"
            onClick={() => reset()}
          >
            Try again
          </Button>
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "inline-flex w-full min-h-11 items-center justify-center sm:w-auto sm:min-h-9",
            )}
          >
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
