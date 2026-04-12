import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const brandRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.brand.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    });
  }),
});
