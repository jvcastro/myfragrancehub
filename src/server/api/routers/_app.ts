import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const appRouter = createTRPCRouter({
  health: publicProcedure.query(() => ({
    ok: true as const,
    service: "myfragrancehub-api",
  })),
});
