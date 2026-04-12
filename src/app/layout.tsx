import type { Metadata } from "next";
import {
  Cinzel,
  EB_Garamond,
  Playfair_Display,
  Source_Sans_3,
} from "next/font/google";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { JsonLd } from "@/components/seo/json-ld";
import { absoluteUrl, getSiteUrl, siteConfig } from "@/config/site";
import { createCaller } from "@/trpc/server";

import { Providers } from "./providers";
import "./globals.css";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source",
  display: "swap",
});

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-garamond",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cinzel",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: siteConfig.defaultTitle,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.defaultDescription,
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: siteConfig.name,
    title: siteConfig.defaultTitle,
    description: siteConfig.defaultDescription,
    url: getSiteUrl(),
    images: [{ url: siteConfig.ogImagePath, width: 416, height: 416, alt: siteConfig.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.defaultTitle,
    description: siteConfig.defaultDescription,
    images: [siteConfig.ogImagePath],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: siteConfig.logoPath, type: "image/png", sizes: "512x512" }],
    shortcut: [{ url: siteConfig.logoPath, type: "image/png" }],
    apple: [{ url: siteConfig.logoPath, type: "image/png" }],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let headerBrand: string | null = null;
  let siteJsonLd: Record<string, unknown> | null = null;
  try {
    const api = await createCaller();
    const settings = await api.settings.get();
    headerBrand = settings?.brandName ?? null;
    const base = getSiteUrl();
    const orgId = `${base}/#organization`;
    const websiteId = `${base}/#website`;
    const sameAs = [settings?.facebookLink, settings?.instagramLink].filter(
      (u): u is string => Boolean(u?.trim()),
    );
    siteJsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": orgId,
          name: settings?.brandName ?? siteConfig.name,
          url: base,
          logo: absoluteUrl(siteConfig.logoPath),
          ...(sameAs.length > 0 ? { sameAs } : {}),
        },
        {
          "@type": "WebSite",
          "@id": websiteId,
          url: base,
          name: settings?.brandName ?? siteConfig.name,
          description: settings?.defaultSeoDescription ?? siteConfig.defaultDescription,
          publisher: { "@id": orgId },
        },
      ],
    };
  } catch {
    headerBrand = null;
    siteJsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": `${getSiteUrl()}/#organization`,
          name: siteConfig.name,
          url: getSiteUrl(),
          logo: absoluteUrl(siteConfig.logoPath),
        },
        {
          "@type": "WebSite",
          "@id": `${getSiteUrl()}/#website`,
          url: getSiteUrl(),
          name: siteConfig.name,
          description: siteConfig.defaultDescription,
          publisher: { "@id": `${getSiteUrl()}/#organization` },
        },
      ],
    };
  }

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sourceSans.variable} ${ebGaramond.variable} ${playfair.variable} ${cinzel.variable} h-full scroll-smooth`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-background text-foreground antialiased"
      >
        {siteJsonLd ? <JsonLd data={siteJsonLd} /> : null}
        <Providers>
          <SiteHeader brandName={headerBrand} />
          <div className="flex flex-1 flex-col">{children}</div>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
