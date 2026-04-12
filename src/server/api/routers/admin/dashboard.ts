import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const adminDashboardRouter = createTRPCRouter({
  stats: protectedProcedure.query(async ({ ctx }) => {
    const [
      totalProducts,
      totalBlogs,
      soldOut,
      featured,
      recentProducts,
      recentBlogs,
    ] = await Promise.all([
      ctx.prisma.product.count(),
      ctx.prisma.blogPost.count(),
      ctx.prisma.product.count({ where: { isSoldOut: true } }),
      ctx.prisma.product.count({ where: { isFeatured: true } }),
      ctx.prisma.product.findMany({
        take: 6,
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          name: true,
          slug: true,
          updatedAt: true,
          isSoldOut: true,
          isFeatured: true,
        },
      }),
      ctx.prisma.blogPost.findMany({
        take: 5,
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          isPublished: true,
          updatedAt: true,
        },
      }),
    ]);

    return {
      totalProducts,
      totalBlogs,
      soldOut,
      featured,
      recentProducts,
      recentBlogs,
    };
  }),
});
