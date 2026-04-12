import { z } from "zod";

import { optionalEmail, optionalHttpUrl } from "@/lib/form-schemas";

/** Shared between admin settings form and `admin.settings.save` input. */
export const siteSettingsWriteSchema = z.object({
  brandName: z.string().trim().min(1, "Brand name is required").max(120),
  heroTitle: z.string().trim().min(1, "Hero title is required").max(200),
  heroSubtitle: z.string().trim().min(1, "Hero subtitle is required").max(2000),
  aboutContent: z.string().trim().min(1, "About content is required").max(100_000),
  contactEmail: optionalEmail,
  contactPhone: z.string().trim().max(80),
  address: z.string().trim().max(2000),
  facebookMessengerLink: optionalHttpUrl,
  facebookLink: optionalHttpUrl,
  instagramLink: optionalHttpUrl,
  defaultSeoTitle: z.string().trim().max(200),
  defaultSeoDescription: z.string().trim().max(500),
});

export type SiteSettingsWriteValues = z.infer<typeof siteSettingsWriteSchema>;
