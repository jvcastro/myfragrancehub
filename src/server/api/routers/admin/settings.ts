import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { siteSettingsWriteSchema } from "@/lib/schemas/site-settings";

function nullIfEmpty(s: string | undefined) {
  const t = s?.trim();
  return t ? t : null;
}

export const adminSettingsRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.siteSetting.findUnique({ where: { id: "default" } });
  }),

  save: protectedProcedure.input(siteSettingsWriteSchema).mutation(async ({ ctx, input }) => {
    const data = {
      brandName: input.brandName,
      heroTitle: input.heroTitle,
      heroSubtitle: input.heroSubtitle,
      aboutContent: input.aboutContent,
      contactEmail: nullIfEmpty(input.contactEmail),
      contactPhone: nullIfEmpty(input.contactPhone),
      address: nullIfEmpty(input.address),
      facebookMessengerLink: nullIfEmpty(input.facebookMessengerLink),
      facebookLink: nullIfEmpty(input.facebookLink),
      instagramLink: nullIfEmpty(input.instagramLink),
      defaultSeoTitle: nullIfEmpty(input.defaultSeoTitle),
      defaultSeoDescription: nullIfEmpty(input.defaultSeoDescription),
    };
    return ctx.prisma.siteSetting.upsert({
      where: { id: "default" },
      create: { id: "default", ...data },
      update: data,
    });
  }),
});
