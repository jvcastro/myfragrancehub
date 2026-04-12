import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { nullIfEmpty } from "@/lib/null-if-empty";
import { blogWriteSchema } from "@/lib/schemas/admin-blog";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

const blogWrite = blogWriteSchema;

function blogData(input: z.infer<typeof blogWrite>) {
  return {
    title: input.title,
    slug: input.slug,
    excerpt: nullIfEmpty(input.excerpt),
    content: input.content,
    coverImage: nullIfEmpty(input.coverImage),
    isPublished: input.isPublished,
    seoTitle: nullIfEmpty(input.seoTitle),
    seoDescription: nullIfEmpty(input.seoDescription),
  };
}

export const adminBlogRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.blogPost.findMany({
      orderBy: { updatedAt: "desc" },
      take: 200,
    });
  }),

  byId: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const row = await ctx.prisma.blogPost.findUnique({ where: { id: input.id } });
      if (!row) throw new TRPCError({ code: "NOT_FOUND" });
      return row;
    }),

  create: protectedProcedure.input(blogWrite).mutation(async ({ ctx, input }) => {
    try {
      return await ctx.prisma.blogPost.create({ data: blogData(input) });
    } catch (e) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Could not create post (slug may already exist).",
        cause: e,
      });
    }
  }),

  update: protectedProcedure
    .input(z.object({ id: z.string().min(1), data: blogWrite.partial() }))
    .mutation(async ({ ctx, input }) => {
      const raw = Object.fromEntries(
        Object.entries(input.data).filter(([, v]) => v !== undefined),
      ) as Partial<z.infer<typeof blogWrite>>;
      const patch: Record<string, unknown> = { ...raw };
      for (const key of ["excerpt", "coverImage", "seoTitle", "seoDescription"] as const) {
        if (key in patch && patch[key] !== undefined) {
          patch[key] = nullIfEmpty(patch[key] as string);
        }
      }
      try {
        return await ctx.prisma.blogPost.update({
          where: { id: input.id },
          data: patch as z.infer<typeof blogWrite>,
        });
      } catch (e) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Could not update post.", cause: e });
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.blogPost.delete({ where: { id: input.id } });
      return { ok: true as const };
    }),
});
