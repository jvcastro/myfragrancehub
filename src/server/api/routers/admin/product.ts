import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { PRODUCT_IMAGE_MAX_COUNT } from "@/constants/product-images";
import { nullIfEmpty } from "@/lib/null-if-empty";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { productFieldsSchema } from "@/lib/schemas/admin-product-fields";

const imageSchema = z.object({
  imageUrl: z.string().url(),
  altText: z.string().optional(),
  sortOrder: z.number().int().default(0),
});

const productWrite = productFieldsSchema.extend({
  images: z.array(imageSchema).max(PRODUCT_IMAGE_MAX_COUNT).default([]),
});

export const adminProductRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.product.findMany({
      orderBy: { updatedAt: "desc" },
      take: 200,
      include: {
        brand: { select: { name: true } },
        category: { select: { name: true } },
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        _count: { select: { images: true } },
      },
    });
  }),

  byId: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const p = await ctx.prisma.product.findUnique({
        where: { id: input.id },
        include: {
          brand: true,
          category: true,
          images: { orderBy: { sortOrder: "asc" } },
        },
      });
      if (!p) throw new TRPCError({ code: "NOT_FOUND" });
      return {
        ...p,
        price: p.price.toString(),
      };
    }),

  create: protectedProcedure.input(productWrite).mutation(async ({ ctx, input }) => {
    const { images, ...data } = input;
    try {
      return await ctx.prisma.product.create({
        data: {
          name: data.name,
          slug: data.slug,
          shortDescription: nullIfEmpty(data.shortDescription),
          description: data.description,
          fragranceNotes: nullIfEmpty(data.fragranceNotes),
          price: data.price,
          isSoldOut: data.isSoldOut,
          isFeatured: data.isFeatured,
          seoTitle: nullIfEmpty(data.seoTitle),
          seoDescription: nullIfEmpty(data.seoDescription),
          brandId: data.brandId,
          categoryId: data.categoryId,
          images: { create: images },
        },
      });
    } catch (e) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Could not create product (check slug uniqueness and relations).",
        cause: e,
      });
    }
  }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        data: productWrite.partial().extend({
          images: z.array(imageSchema).max(PRODUCT_IMAGE_MAX_COUNT).optional(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, data } = input;
      const { images, ...patch } = data;
      const patchEntries = Object.fromEntries(
        Object.entries(patch).filter(([, v]) => v !== undefined),
      ) as Record<string, unknown>;
      for (const key of ["shortDescription", "fragranceNotes", "seoTitle", "seoDescription"] as const) {
        if (key in patchEntries && patchEntries[key] !== undefined) {
          patchEntries[key] = nullIfEmpty(patchEntries[key] as string);
        }
      }
      try {
        await ctx.prisma.product.update({
          where: { id },
          data: {
            ...patchEntries,
            ...(images !== undefined
              ? {
                  images: {
                    deleteMany: { productId: id },
                    create: images,
                  },
                }
              : {}),
          },
        });
        return { ok: true as const };
      } catch (e) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Could not update product.",
          cause: e,
        });
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.product.delete({ where: { id: input.id } });
      return { ok: true as const };
    }),
});
