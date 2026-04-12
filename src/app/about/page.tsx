import type { Metadata } from "next";

import { MarkdownBody } from "@/components/blog/markdown-body";
import { Separator } from "@/components/ui/separator";
import { defaultAboutMarkdown } from "@/config/cms-defaults";
import { absoluteUrl, siteConfig } from "@/config/site";
import { createCaller } from "@/trpc/server";

export const metadata: Metadata = {
  title: "About",
  description: `The story behind ${siteConfig.name}.`,
  alternates: { canonical: absoluteUrl("/about") },
};

export default async function AboutPage() {
  const api = await createCaller();
  const settings = await api.settings.get();
  const body = settings?.aboutContent?.trim() || defaultAboutMarkdown;

  return (
    <main className="flex flex-1 flex-col">
      <div className="mx-auto min-w-0 max-w-3xl px-4 py-14 sm:px-6 sm:py-20 md:px-8 md:py-24">
        <p className="font-accent text-[0.65rem] font-medium uppercase tracking-[0.32em] text-muted-foreground">
          About
        </p>
        <h1 className="mt-4 font-display text-4xl tracking-[-0.03em] text-foreground sm:text-5xl">
          {settings?.brandName ?? siteConfig.name}
        </h1>
        <Separator className="mt-8" />
        <div className="mt-10">
          <MarkdownBody content={body} />
        </div>
      </div>
    </main>
  );
}
