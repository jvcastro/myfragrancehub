"use client";

import Link from "next/link";

import { api } from "@/trpc/react";
import { Skeleton } from "@/components/ui/skeleton";

function StatCard({
  title,
  value,
  href,
}: {
  title: string;
  value: number;
  href?: string;
}) {
  const inner = (
    <>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{title}</p>
      <p className="mt-2 font-heading text-3xl tabular-nums text-foreground">{value}</p>
    </>
  );
  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-xl border border-border/60 bg-card/40 p-6 shadow-sm transition-shadow hover:shadow-md"
      >
        {inner}
      </Link>
    );
  }
  return (
    <div className="rounded-xl border border-border/60 bg-card/40 p-6 shadow-sm">
      {inner}
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data, isPending } = api.admin.dashboard.stats.useQuery();

  if (isPending || !data) {
    return (
      <div className="p-8">
        <Skeleton className="h-10 w-48" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="font-heading text-3xl tracking-tight text-foreground">Dashboard</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Snapshot of the catalog and recent edits.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Products" value={data.totalProducts} href="/admin/products" />
        <StatCard title="Blog posts" value={data.totalBlogs} href="/admin/blog" />
        <StatCard title="Sold out" value={data.soldOut} href="/admin/products" />
        <StatCard title="Featured" value={data.featured} href="/admin/products" />
      </div>
      <div className="mt-12 grid gap-10 lg:grid-cols-2">
        <section aria-labelledby="recent-products">
          <h2 id="recent-products" className="font-heading text-lg text-foreground">
            Recent products
          </h2>
          <ul className="mt-4 divide-y divide-border/60 rounded-xl border border-border/60">
            {data.recentProducts.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                <Link
                  href={`/admin/products/${p.id}`}
                  className="font-medium text-foreground hover:underline"
                >
                  {p.name}
                </Link>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {p.isSoldOut ? "Sold out" : "In stock"}
                  {p.isFeatured ? " · Featured" : ""}
                </span>
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="recent-blog">
          <h2 id="recent-blog" className="font-heading text-lg text-foreground">
            Recent posts
          </h2>
          <ul className="mt-4 divide-y divide-border/60 rounded-xl border border-border/60">
            {data.recentBlogs.map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                <Link
                  href={`/admin/blog/${b.id}`}
                  className="font-medium text-foreground hover:underline"
                >
                  {b.title}
                </Link>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {b.isPublished ? "Published" : "Draft"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
