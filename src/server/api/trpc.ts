import { TRPCError, initTRPC } from "@trpc/server";
import { cookies } from "next/headers";
import superjson from "superjson";

import {
  ADMIN_SESSION_COOKIE,
  parseSessionTokenFromCookieHeader,
  verifyAdminToken,
} from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

async function readSession(opts?: { req?: Request }) {
  if (!process.env.AUTH_SECRET) return null;
  let token: string | null | undefined;
  if (opts?.req) {
    token = parseSessionTokenFromCookieHeader(opts.req.headers.get("cookie"));
  } else {
    token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  }
  if (!token) return null;
  try {
    return await verifyAdminToken(token);
  } catch {
    return null;
  }
}

export async function createTRPCContext(opts?: { req?: Request }) {
  const session = await readSession(opts);
  return { prisma, session };
}

type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

const enforceAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.adminUserId) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin sign-in required." });
  }
  return next({
    ctx: {
      ...ctx,
      session: { adminUserId: ctx.session.adminUserId },
    },
  });
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(enforceAdmin);
