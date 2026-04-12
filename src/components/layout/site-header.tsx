import Link from "next/link";

import { MobileNav } from "@/components/layout/mobile-nav";
import { SiteLogo } from "@/components/layout/site-logo";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export function SiteHeader({ brandName }: { brandName?: string | null }) {
  const title = brandName?.trim() || siteConfig.name;
  return (
    <header className="sticky top-0 z-40 border-b border-foreground/[0.06] bg-background/85 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-[4.25rem] min-w-0 max-w-6xl items-center justify-between gap-3 px-4 sm:h-[4.5rem] sm:gap-4 sm:px-6 md:px-8">
        <Link
          href="/"
          aria-label={title}
          className="flex min-w-0 max-w-[min(100%,calc(100%-3.5rem))] shrink items-center gap-2 transition-opacity hover:opacity-90 sm:max-w-none sm:gap-3"
        >
          <SiteLogo size={40} priority />
          <span className="hidden min-w-0 max-w-[10rem] truncate font-heading text-base font-medium leading-tight tracking-[-0.01em] text-foreground sm:block sm:max-w-[14rem] sm:text-lg">
            {title}
          </span>
        </Link>
        <nav
          className="hidden items-center gap-10 md:flex"
          aria-label="Main"
        >
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "font-accent text-[0.68rem] font-medium uppercase tracking-[0.26em] text-foreground/55 transition-colors duration-300",
                "hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <MobileNav />
      </div>
    </header>
  );
}
