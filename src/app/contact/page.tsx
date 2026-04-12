import type { Metadata } from "next";

import { InquiryForm } from "@/components/contact/inquiry-form";
import { MessengerCta } from "@/components/product/messenger-cta";
import { Separator } from "@/components/ui/separator";
import { absoluteUrl, siteConfig } from "@/config/site";
import { createCaller } from "@/trpc/server";

export const metadata: Metadata = {
  title: "Contact",
  description: `Reach ${siteConfig.name} for fragrance inquiries.`,
  alternates: { canonical: absoluteUrl("/contact") },
};

export default async function ContactPage() {
  const api = await createCaller();
  const settings = await api.settings.get();
  const messengerHref = settings?.facebookMessengerLink;
  const showHint = !messengerHref?.trim();

  return (
    <main className="flex flex-1 flex-col">
      <div className="mx-auto grid min-w-0 max-w-6xl gap-12 px-4 py-12 sm:gap-16 sm:px-6 sm:py-16 md:px-8 md:py-20 lg:grid-cols-2">
        <div>
          <p className="font-accent text-[0.65rem] font-medium uppercase tracking-[0.32em] text-muted-foreground">
            Contact
          </p>
          <h1 className="mt-4 font-display text-4xl tracking-[-0.03em] text-foreground sm:text-5xl">
            Let&apos;s talk
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            We respond personally—no carts, no automated queues. Use Messenger
            for the fastest reply, or send a note through your email client.
          </p>
          <Separator className="my-10" />
          <dl className="space-y-6 text-sm">
            {settings?.contactEmail ? (
              <div>
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                  Email
                </dt>
                <dd className="mt-1">
                  <a
                    className="text-foreground underline-offset-4 hover:underline"
                    href={`mailto:${settings.contactEmail}`}
                  >
                    {settings.contactEmail}
                  </a>
                </dd>
              </div>
            ) : null}
            {settings?.contactPhone ? (
              <div>
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                  Phone
                </dt>
                <dd className="mt-1 text-foreground">{settings.contactPhone}</dd>
              </div>
            ) : null}
            {settings?.address ? (
              <div>
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                  Location
                </dt>
                <dd className="mt-1 whitespace-pre-line text-muted-foreground">
                  {settings.address}
                </dd>
              </div>
            ) : null}
          </dl>
          <div className="mt-10 flex flex-col gap-3">
            <MessengerCta messengerHref={messengerHref} />
            {showHint ? (
              <p className="text-xs text-muted-foreground">
                Configure your Messenger URL in site settings to activate this
                button.
              </p>
            ) : null}
          </div>
        </div>
        <div className="rounded-xl border border-border/60 bg-card/30 p-6 sm:p-8">
          <h2 className="font-display text-xl tracking-[-0.02em] text-foreground">
            Email inquiry
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Opens your mail app with a pre-filled message to our team.
          </p>
          <div className="mt-6">
            <InquiryForm contactEmail={settings?.contactEmail ?? null} />
          </div>
        </div>
      </div>
    </main>
  );
}
