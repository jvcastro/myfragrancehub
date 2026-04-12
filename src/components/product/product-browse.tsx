"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { ProductGrid } from "@/components/product/product-grid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";

type FilterOption = { slug: string; name: string };

export function ProductBrowse({
  categories,
  brands,
}: {
  categories: FilterOption[];
  brands: FilterOption[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const q = searchParams.get("q") ?? "";
  const categorySlug = searchParams.get("category") ?? "";
  const brandSlug = searchParams.get("brand") ?? "";
  const sort = (searchParams.get("sort") ??
    "newest") as "newest" | "price_asc" | "price_desc" | "name";

  const listInput = useMemo(
    () => ({
      search: q || undefined,
      categorySlug: categorySlug || undefined,
      brandSlug: brandSlug || undefined,
      sort,
      take: 48,
    }),
    [q, categorySlug, brandSlug, sort],
  );

  const { data: products, isPending, isFetching } = api.product.list.useQuery(
    listInput,
  );

  const setParams = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") next.delete(key);
        else next.set(key, value);
      }
      const qs = next.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const loading = isPending || isFetching;

  return (
    <div className="mx-auto min-w-0 max-w-6xl px-4 py-12 sm:px-6 sm:py-14 md:px-8 md:py-16">
      <header className="mb-12 border-b border-foreground/[0.08] pb-12">
        <p className="font-accent text-[0.65rem] font-medium uppercase tracking-[0.32em] text-muted-foreground">
          Catalog
        </p>
        <h1 className="font-display mt-3 text-4xl tracking-[-0.03em] text-foreground sm:text-5xl">
          Collection
        </h1>
        <p className="mt-5 max-w-2xl text-[0.95rem] leading-relaxed text-muted-foreground sm:text-base">
          Browse by house or family, search by name, and sort to taste. Prices are
          shown for orientation—availability is confirmed on inquiry.
        </p>
      </header>

      <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex min-w-0 max-w-full flex-1 flex-col gap-2 sm:max-w-md">
          <Label htmlFor="product-search">Search</Label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
            <Input
              id="product-search"
              name="q"
              defaultValue={q}
              placeholder="Search by product name…"
              className="min-h-10 w-full bg-background sm:min-h-9"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setParams({ q: (e.target as HTMLInputElement).value });
                }
              }}
            />
            <Button
              type="button"
              className="w-full shrink-0 sm:w-auto"
              onClick={() => {
                const el = document.getElementById(
                  "product-search",
                ) as HTMLInputElement | null;
                setParams({ q: el?.value ?? "" });
              }}
            >
              Search
            </Button>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-2 sm:min-w-[180px]">
          <Label htmlFor="sort">Sort</Label>
          <select
            id="sort"
            className="min-h-10 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 sm:h-9 sm:min-h-0"
            value={sort}
            onChange={(e) =>
              setParams({
                sort: e.target.value === "newest" ? null : e.target.value,
              })
            }
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
            <option value="name">Name: A–Z</option>
          </select>
        </div>
      </div>

      <div className="mb-10 flex flex-col gap-4 rounded-xl bg-muted/20 p-4 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:min-w-[200px] sm:max-w-[min(100%,20rem)]">
          <Label htmlFor="filter-category">Category</Label>
          <select
            id="filter-category"
            className="min-h-10 w-full rounded-lg border border-input bg-background px-3 text-sm sm:h-9 sm:min-h-0"
            value={categorySlug}
            onChange={(e) =>
              setParams({
                category: e.target.value || null,
              })
            }
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:min-w-[200px] sm:max-w-[min(100%,20rem)]">
          <Label htmlFor="filter-brand">Brand</Label>
          <select
            id="filter-brand"
            className="min-h-10 w-full rounded-lg border border-input bg-background px-3 text-sm sm:h-9 sm:min-h-0"
            value={brandSlug}
            onChange={(e) =>
              setParams({
                brand: e.target.value || null,
              })
            }
          >
            <option value="">All houses</option>
            {brands.map((b) => (
              <option key={b.slug} value={b.slug}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <Button
          type="button"
          variant="ghost"
          className="w-full justify-center sm:ml-auto sm:w-auto sm:self-end"
          onClick={() => router.push(pathname)}
        >
          Clear filters
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
          ))}
        </div>
      ) : (
        <ProductGrid products={products ?? []} />
      )}
    </div>
  );
}
