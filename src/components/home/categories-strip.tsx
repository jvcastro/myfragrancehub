import Link from "next/link";

export function CategoriesStrip({
  categories,
}: {
  categories: { slug: string; name: string; count: number }[];
}) {
  if (categories.length === 0) return null;

  return (
    <section
      className="border-b border-foreground/[0.06] bg-background py-20 sm:py-24"
      aria-labelledby="collections-heading"
    >
      <div className="mx-auto min-w-0 max-w-6xl px-4 sm:px-6 md:px-8">
        <div className="max-w-2xl">
          <p className="font-accent text-[0.65rem] font-medium uppercase tracking-[0.32em] text-muted-foreground">
            Navigate
          </p>
          <h2
            id="collections-heading"
            className="font-display mt-3 text-3xl tracking-[-0.02em] text-foreground sm:text-4xl"
          >
            Collections
          </h2>
          <p className="mt-4 text-[0.95rem] leading-relaxed text-muted-foreground sm:text-base">
            Each line opens the catalog with that family pre-selected—move by
            mood, not menus.
          </p>
        </div>

        <ul className="mt-14 divide-y divide-foreground/[0.08] border-y border-foreground/[0.08]">
          {categories.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/products?category=${encodeURIComponent(c.slug)}`}
                className="group flex min-h-[3.25rem] flex-col gap-1 py-6 transition-colors active:bg-muted/30 sm:min-h-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8 sm:py-8"
              >
                <span className="font-display text-xl tracking-[-0.02em] text-foreground transition-colors [overflow-wrap:anywhere] group-hover:text-gold-foreground sm:text-2xl md:text-3xl">
                  {c.name}
                </span>
                <span className="font-accent text-[0.65rem] uppercase tracking-[0.28em] text-muted-foreground">
                  {c.count} {c.count === 1 ? "piece" : "pieces"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
