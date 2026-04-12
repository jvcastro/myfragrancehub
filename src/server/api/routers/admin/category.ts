import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { nullIfEmpty } from "@/lib/null-if-empty";
import { categoryWriteSchema } from "@/lib/schemas/admin-category";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

const categoryWrite = categoryWriteSchema;

function categoryData(input: z.infer<typeof categoryWrite>) {
  return {
    name: input.name,
    slug: input.slug,
    description: nullIfEmpty(input.description),
    seoTitle: nullIfEmpty(input.seoTitle),
    seoDescription: nullIfEmpty(input.seoDescription),
  };
}

export const adminCategoryRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    });
  }),

  byId: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const row = await ctx.prisma.category.findUnique({ where: { id: input.id } });
      if (!row) throw new TRPCError({ code: "NOT_FOUND" });
      return row;
    }),

  create: protectedProcedure.input(categoryWrite).mutation(async ({ ctx, input }) => {
    try {
      return await ctx.prisma.category.create({ data: categoryData(input) });
    } catch (e) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Could not create category (slug may already exist).",
        cause: e,
      });
    }
  }),

  update: protectedProcedure
    .input(z.object({ id: z.string().min(1), data: categoryWrite.partial() }))
    .mutation(async ({ ctx, input }) => {
      const raw = Object.fromEntries(
        Object.entries(input.data).filter(([, v]) => v !== undefined),
      ) as Partial<z.infer<typeof categoryWrite>>;
      const patch: Record<string, unknown> = { ...raw };
      for (const key of ["description", "seoTitle", "seoDescription"] as const) {
        if (key in patch && patch[key] !== undefined) {
          patch[key] = nullIfEmpty(patch[key] as string);
        }
      }
      try {
        return await ctx.prisma.category.update({
          where: { id: input.id },
          data: patch as z.infer<typeof categoryWrite>,
        });
      } catch (e) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Could not update category.", cause: e });
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const count = await ctx.prisma.product.count({
        where: { categoryId: input.id },
      });
      if (count > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot delete: ${count} product(s) still use this category.`,
        });
      }
      await ctx.prisma.category.delete({ where: { id: input.id } });
      return { ok: true as const };
    }),
});
