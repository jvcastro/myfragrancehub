import { getR2PublicUrlConfigurationIssue, isR2ProductUploadConfigured } from "@/lib/r2";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const adminUploadRouter = createTRPCRouter({
  status: protectedProcedure.query(() => ({
    configured: isR2ProductUploadConfigured(),
    publicUrlIssue: getR2PublicUrlConfigurationIssue(),
  })),
});
