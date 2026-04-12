import Link from "next/link";

import { SiteLogo } from "@/components/layout/site-logo";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-foreground/[0.08] bg-[var(--surface-sunken)]">
      <div className="mx-auto min-w-0 max-w-6xl px-4 py-14 sm:px-6 sm:py-16 md:px-8 md:py-20">
        <div className="flex flex-col gap-10 sm:gap-12 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex max-w-md flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
            <SiteLogo size={52} alt={siteConfig.name} className="opacity-90" />
            <div>
              <p className="font-display text-xl tracking-[-0.02em] text-foreground">
                {siteConfig.name}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {siteConfig.tagline}
              </p>
            </div>
          </div>
          <nav
            className="flex flex-wrap gap-x-6 gap-y-3 sm:gap-x-10"
            aria-label="Footer"
          >
            {siteConfig.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "font-accent text-[0.65rem] font-medium uppercase tracking-[0.24em] text-muted-foreground transition-colors hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-14 flex flex-col gap-2 border-t border-foreground/[0.08] pt-8 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p className="text-xs tracking-wide text-muted-foreground">
            © {year} {siteConfig.name}. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Catalog inquiries only—no online checkout.
          </p>
        </div>
      </div>
    </footer>
  );
}
