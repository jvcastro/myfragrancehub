import type { Metadata } from "next";
import { Suspense } from "react";

import { ProductBrowse } from "@/components/product/product-browse";
import { Skeleton } from "@/components/ui/skeleton";
import { absoluteUrl, siteConfig } from "@/config/site";
import { createCaller } from "@/trpc/server";

export const metadata: Metadata = {
  title: "Collection",
  description: `Browse the fragrance collection at ${siteConfig.name}.`,
  alternates: { canonical: absoluteUrl("/products") },
};

function ProductsBrowseFallback() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12 sm:px-8">
      <Skeleton className="h-10 w-56" />
      <Skeleton className="mt-4 h-4 w-full max-w-xl" />
      <div className="mt-10 flex flex-col gap-4 sm:flex-row">
        <Skeleton className="h-10 flex-1 max-w-md" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default async function ProductsPage() {
  const api = await createCaller();
  const [categories, brands] = await Promise.all([
    api.category.list(),
    api.brand.list(),
  ]);

  const categoryOptions = categories.map((c) => ({ slug: c.slug, name: c.name }));
  const brandOptions = brands.map((b) => ({ slug: b.slug, name: b.name }));

  return (
    <main className="flex flex-1 flex-col">
      <Suspense fallback={<ProductsBrowseFallback />}>
        <ProductBrowse categories={categoryOptions} brands={brandOptions} />
      </Suspense>
    </main>
  );
}
