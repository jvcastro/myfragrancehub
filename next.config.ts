import type { NextConfig } from "next";

/**
 * App Router + dev tooling (Turbopack / HMR) rely on dynamic code paths that
 * browsers classify as eval-like unless `script-src` includes `'unsafe-eval'`.
 * We allow that only in development. Production stays off `unsafe-eval`.
 *
 * If you also set CSP in a reverse proxy or host dashboard, remove one copy —
 * multiple CSP headers are intersected and the strictest rules win.
 */
function buildContentSecurityPolicy(): string {
  const isDev = process.env.NODE_ENV === "development";
  const scriptExtra = isDev ? " 'unsafe-eval'" : "";

  /** Dev HMR / Turbopack uses ws + occasional tooling requests; scheme sources keep localhost on any port working. */
  const connectExtra = isDev ? " http: https: ws: wss:" : "";

  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${scriptExtra}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self'",
    `connect-src 'self'${connectExtra}`,
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "object-src 'none'",
  ].join("; ");
}

function securityHeadersList(): { key: string; value: string }[] {
  const base = [
    { key: "X-DNS-Prefetch-Control", value: "on" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "X-Frame-Options", value: "SAMEORIGIN" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=()",
    },
  ];
  if (process.env.DISABLE_NEXT_CSP === "1") return base;
  return [
    ...base,
    { key: "Content-Security-Policy", value: buildContentSecurityPolicy() },
  ];
}

/** Cloudflare R2 public bucket URLs use `https://pub-*.r2.dev` — allow them even if `R2_PUBLIC_BASE_URL` was unset when this file was evaluated. */
const r2DevPublicImagePattern = {
  protocol: "https" as const,
  hostname: "*.r2.dev",
  pathname: "/**",
};

function r2ImageRemotePattern(): { protocol: "https"; hostname: string; pathname: string }[] {
  const patterns: { protocol: "https"; hostname: string; pathname: string }[] = [r2DevPublicImagePattern];
  const raw = process.env.R2_PUBLIC_BASE_URL?.trim();
  if (!raw) return patterns;
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:" || !u.hostname) return patterns;
    if (!u.hostname.endsWith(".r2.dev")) {
      patterns.push({ protocol: "https", hostname: u.hostname, pathname: "/**" });
    }
    return patterns;
  } catch {
    return patterns;
  }
}

const nextConfig: NextConfig = {
  /** Smaller Node images and platforms that run `node server.js` from `.next/standalone`. */
  output: "standalone",
  poweredByHeader: false,
  async rewrites() {
    return [{ source: "/favicon.ico", destination: "/logo.png" }];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      ...r2ImageRemotePattern(),
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeadersList(),
      },
    ];
  },
};

export default nextConfig;
