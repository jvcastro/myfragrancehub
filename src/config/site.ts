import { getServerSiteOrigin } from "@/lib/site-url";

export const siteName = "My Fragrance Hub";

export function getSiteUrl(): string {
  return getServerSiteOrigin();
}

export const siteConfig = {
  name: siteName,
  get url() {
    return getSiteUrl();
  },
  defaultTitle: siteName,
  defaultDescription:
    "A curated catalog of fine fragrances, priced in Philippine peso (PHP). Inquire for availability—there is no anonymous online checkout.",
  /** Dark mark in `public/` — header/footer; light theme */
  logoPath: "/logo.png",
  /** White mark for `.dark` (transparent / dark-friendly) */
  logoPathDark: "/logo-dark.png",
  ogImagePath: "/logo.png",
  tagline: "Curated fine fragrance, made personal.",
  nav: [
    { label: "Products", href: "/products" },
    { label: "About", href: "/about" },
    { label: "Journal", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ],
} as const;

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
