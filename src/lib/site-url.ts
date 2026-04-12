/**
 * Absolute origin for server-side URLs (tRPC batch, metadata, sitemap).
 * Prefer `NEXT_PUBLIC_SITE_URL` in all deployed environments.
 */
export function getServerSiteOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (process.env.VERCEL_URL)
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}
