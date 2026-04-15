import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { TRPCError } from "@trpc/server";

import { ADMIN_SESSION_COOKIE, signAdminToken } from "@/lib/auth/session";
import {
  adminUpdateEmailSchema,
  adminUpdatePasswordSchema,
} from "@/lib/schemas/admin-account";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function isUniqueConstraintError(e: unknown): boolean {
  return typeof e === "object" && e !== null && "code" in e && (e as { code: string }).code === "P2002";
}

function sessionCookieOptions() {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}

export const adminAccountRouter = createTRPCRouter({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.adminUser.findUnique({
      where: { id: ctx.session.adminUserId },
      select: { email: true },
    });
    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Admin user not found." });
    }
    return user;
  }),

  updateEmail: protectedProcedure.input(adminUpdateEmailSchema).mutation(async ({ ctx, input }) => {
    const user = await ctx.prisma.adminUser.findUnique({
      where: { id: ctx.session.adminUserId },
    });
    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Admin user not found." });
    }
    if (!bcrypt.compareSync(input.currentPassword, user.passwordHash)) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Current password is incorrect." });
    }
    if (input.newEmail === user.email) {
      return { email: user.email };
    }

    try {
      await ctx.prisma.adminUser.update({
        where: { id: user.id },
        data: { email: input.newEmail },
      });
    } catch (e: unknown) {
      if (isUniqueConstraintError(e)) {
        throw new TRPCError({ code: "CONFLICT", message: "That email is already in use." });
      }
      throw e;
    }

    const token = await signAdminToken(user.id, input.newEmail);
    (await cookies()).set(ADMIN_SESSION_COOKIE, token, sessionCookieOptions());

    return { email: input.newEmail };
  }),

  updatePassword: protectedProcedure
    .input(adminUpdatePasswordSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.adminUser.findUnique({
        where: { id: ctx.session.adminUserId },
      });
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Admin user not found." });
      }
      if (!bcrypt.compareSync(input.currentPassword, user.passwordHash)) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Current password is incorrect." });
      }

      const passwordHash = bcrypt.hashSync(input.newPassword, 12);
      await ctx.prisma.adminUser.update({
        where: { id: user.id },
        data: { passwordHash },
      });

      return { ok: true as const };
    }),
});
