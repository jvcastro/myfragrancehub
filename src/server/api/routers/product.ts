import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

const sortValues = ["newest", "price_asc", "price_desc", "name"] as const;

const productListInclude = {
  brand: { select: { id: true, name: true, slug: true } },
  category: { select: { id: true, name: true, slug: true } },
  images: { orderBy: { sortOrder: "asc" as const }, take: 1 },
} as const;

function priceToString(price: { toString(): string }) {
  return price.toString();
}

export const productRouter = createTRPCRouter({
  featured: publicProcedure.query(async ({ ctx }) => {
    const rows = await ctx.prisma.product.findMany({
      where: { isFeatured: true },
      orderBy: { updatedAt: "desc" },
      take: 8,
      include: productListInclude,
    });
    return rows.map((p) => ({
      ...p,
      price: priceToString(p.price),
    }));
  }),

  list: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        categorySlug: z.string().optional(),
        brandSlug: z.string().optional(),
        sort: z
          .string()
          .optional()
          .transform((s) => {
            if (s && (sortValues as readonly string[]).includes(s)) {
              return s as (typeof sortValues)[number];
            }
            return "newest";
          }),
        take: z.number().min(1).max(72).default(48),
      }),
    )
    .query(async ({ ctx, input }) => {
      const search = input.search?.trim();
      const where = {
        AND: [
          search
            ? {
                OR: [
                  { name: { contains: search, mode: "insensitive" as const } },
                  {
                    shortDescription: {
                      contains: search,
                      mode: "insensitive" as const,
                    },
                  },
                ],
              }
            : {},
          input.categorySlug
            ? { category: { slug: input.categorySlug } }
            : {},
          input.brandSlug ? { brand: { slug: input.brandSlug } } : {},
        ],
      };

      const orderBy =
        input.sort === "price_asc"
          ? { price: "asc" as const }
          : input.sort === "price_desc"
            ? { price: "desc" as const }
            : input.sort === "name"
              ? { name: "asc" as const }
              : { createdAt: "desc" as const };

      const rows = await ctx.prisma.product.findMany({
        where,
        orderBy,
        take: input.take,
        include: productListInclude,
      });

      return rows.map((p) => ({
        ...p,
        price: priceToString(p.price),
      }));
    }),

  bySlug: publicProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const product = await ctx.prisma.product.findUnique({
        where: { slug: input.slug },
        include: {
          brand: true,
          category: true,
          images: { orderBy: { sortOrder: "asc" } },
        },
      });

      if (!product) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
      }

      const related = await ctx.prisma.product.findMany({
        where: {
          categoryId: product.categoryId,
          id: { not: product.id },
        },
        orderBy: { updatedAt: "desc" },
        take: 4,
        include: productListInclude,
      });

      return {
        ...product,
        price: priceToString(product.price),
        related: related.map((p) => ({
          ...p,
          price: priceToString(p.price),
        })),
      };
    }),
});
