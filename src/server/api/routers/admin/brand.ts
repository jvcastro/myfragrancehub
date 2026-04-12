import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { nullIfEmpty } from "@/lib/null-if-empty";
import { brandWriteSchema } from "@/lib/schemas/admin-brand";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

const brandWrite = brandWriteSchema;

function brandData(input: z.infer<typeof brandWrite>) {
  return {
    name: input.name,
    slug: input.slug,
    bio: nullIfEmpty(input.bio),
    logoUrl: nullIfEmpty(input.logoUrl),
    seoTitle: nullIfEmpty(input.seoTitle),
    seoDescription: nullIfEmpty(input.seoDescription),
  };
}

export const adminBrandRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.brand.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    });
  }),

  byId: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const row = await ctx.prisma.brand.findUnique({ where: { id: input.id } });
      if (!row) throw new TRPCError({ code: "NOT_FOUND" });
      return row;
    }),

  create: protectedProcedure.input(brandWrite).mutation(async ({ ctx, input }) => {
    try {
      return await ctx.prisma.brand.create({ data: brandData(input) });
    } catch (e) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Could not create brand (slug may already exist).",
        cause: e,
      });
    }
  }),

  update: protectedProcedure
    .input(z.object({ id: z.string().min(1), data: brandWrite.partial() }))
    .mutation(async ({ ctx, input }) => {
      const raw = Object.fromEntries(
        Object.entries(input.data).filter(([, v]) => v !== undefined),
      ) as Partial<z.infer<typeof brandWrite>>;
      const patch: Record<string, unknown> = { ...raw };
      for (const key of ["bio", "logoUrl", "seoTitle", "seoDescription"] as const) {
        if (key in patch && patch[key] !== undefined) {
          patch[key] = nullIfEmpty(patch[key] as string);
        }
      }
      try {
        return await ctx.prisma.brand.update({
          where: { id: input.id },
          data: patch as z.infer<typeof brandWrite>,
        });
      } catch (e) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Could not update brand.", cause: e });
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const count = await ctx.prisma.product.count({
        where: { brandId: input.id },
      });
      if (count > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot delete: ${count} product(s) still use this brand.`,
        });
      }
      await ctx.prisma.brand.delete({ where: { id: input.id } });
      return { ok: true as const };
    }),
});
