import { SignJWT, jwtVerify } from "jose";

export const ADMIN_SESSION_COOKIE = "mfh_admin";

function getEncodedSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "AUTH_SECRET must be set (min 16 chars). Add it to your .env for admin login.",
    );
  }
  return new TextEncoder().encode(secret);
}

export async function signAdminToken(adminUserId: string, email: string) {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(adminUserId)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getEncodedSecret());
}

export async function verifyAdminToken(token: string) {
  const { payload } = await jwtVerify(token, getEncodedSecret());
  const sub = payload.sub;
  if (!sub || typeof sub !== "string") return null;
  return { adminUserId: sub, email: typeof payload.email === "string" ? payload.email : "" };
}

export function parseSessionTokenFromCookieHeader(cookieHeader: string | null) {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";").map((c) => c.trim());
  const pair = parts.find((p) => p.startsWith(`${ADMIN_SESSION_COOKIE}=`));
  if (!pair) return null;
  return pair.slice(`${ADMIN_SESSION_COOKIE}=`.length) || null;
}
