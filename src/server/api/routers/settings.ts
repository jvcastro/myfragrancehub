import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const settingsRouter = createTRPCRouter({
  get: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.siteSetting.findUnique({
      where: { id: "default" },
    });
  }),
});
