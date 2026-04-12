import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/config/site";
import { prisma } from "@/lib/prisma";

const STATIC_PATHS = [
  { path: "", changeFrequency: "weekly" as const, priority: 1 },
  { path: "/products", changeFrequency: "weekly" as const, priority: 0.9 },
  { path: "/about", changeFrequency: "monthly" as const, priority: 0.6 },
  { path: "/blog", changeFrequency: "weekly" as const, priority: 0.7 },
  { path: "/contact", changeFrequency: "yearly" as const, priority: 0.5 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map(
    ({ path, changeFrequency, priority }) => ({
      url: absoluteUrl(path),
      lastModified: new Date(),
      changeFrequency,
      priority,
    }),
  );

  try {
    const [products, posts] = await Promise.all([
      prisma.product.findMany({
        select: { slug: true, updatedAt: true },
      }),
      prisma.blogPost.findMany({
        where: { isPublished: true },
        select: { slug: true, updatedAt: true },
      }),
    ]);

    const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
      url: absoluteUrl(`/products/${p.slug}`),
      lastModified: p.updatedAt,
      changeFrequency: "weekly",
      priority: 0.85,
    }));

    const blogEntries: MetadataRoute.Sitemap = posts.map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: post.updatedAt,
      changeFrequency: "monthly",
      priority: 0.65,
    }));

    return [...staticEntries, ...productEntries, ...blogEntries];
  } catch (err) {
    console.error("[sitemap] Failed to load dynamic URLs:", err);
    return staticEntries;
  }
}
