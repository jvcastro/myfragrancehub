"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SiteLogo } from "@/components/layout/site-logo";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/brands", label: "Brands" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/settings", label: "Site settings" },
  { href: "/admin/account", label: "Account" },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border/60 bg-card/30">
      <div className="border-b border-border/60 px-4 py-5">
        <SiteLogo size={40} alt="" className="opacity-95" />
        <p className="mt-3 font-heading text-sm text-foreground">CMS</p>
        <p className="text-xs text-muted-foreground">{siteConfig.name}</p>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 p-2" aria-label="Admin">
        {links.map((l) => {
          const active =
            l.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-muted font-medium text-foreground"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border/60 p-2">
        <Button
          type="button"
          variant="ghost"
          className="w-full justify-start text-muted-foreground"
          onClick={() => void logout()}
        >
          Sign out
        </Button>
        <Link
          href="/"
          className="mt-1 block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground"
        >
          View storefront
        </Link>
      </div>
    </aside>
  );
}
