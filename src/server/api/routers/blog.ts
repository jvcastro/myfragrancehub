import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const blogRouter = createTRPCRouter({
  listPublished: publicProcedure
    .input(
      z
        .object({
          take: z.number().min(1).max(50).optional().default(20),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const take = input?.take ?? 20;
      return ctx.prisma.blogPost.findMany({
        where: { isPublished: true },
        orderBy: { createdAt: "desc" },
        take,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          coverImage: true,
          createdAt: true,
        },
      });
    }),

  bySlug: publicProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.prisma.blogPost.findFirst({
        where: { slug: input.slug, isPublished: true },
      });
      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }
      return post;
    }),
});
