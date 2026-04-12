import "server-only";

import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

export async function createCaller() {
  const ctx = await createTRPCContext();
  return appRouter.createCaller(ctx);
}
