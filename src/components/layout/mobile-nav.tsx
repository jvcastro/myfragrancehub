"use client";

import Link from "next/link";
import { Menu } from "lucide-react";

import { SiteLogo } from "@/components/layout/site-logo";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger
        nativeButton
        render={
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Open menu"
          />
        }
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[min(100vw,20rem)] max-w-[100vw] pb-[max(1.5rem,env(safe-area-inset-bottom))]"
      >
        <SheetHeader className="space-y-3 text-left">
          <SiteLogo size={44} alt="" className="opacity-95" />
          <SheetTitle className="font-accent text-[0.65rem] uppercase tracking-[0.28em] text-muted-foreground">
            Menu
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-0.5 px-2 pb-6" aria-label="Mobile">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block rounded-lg px-3 py-3.5 font-accent text-[0.72rem] font-medium uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
