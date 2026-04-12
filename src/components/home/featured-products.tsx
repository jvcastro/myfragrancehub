import Link from "next/link";

import { FeaturedSpotlight } from "@/components/home/featured-spotlight";
import { ProductCard } from "@/components/product/product-card";
import { buttonVariants } from "@/components/ui/button";
import type { ProductCardProduct } from "@/components/product/product-card";
import { cn } from "@/lib/utils";

export function FeaturedProductsSection({
  products,
}: {
  products: ProductCardProduct[];
}) {
  const [first, ...rest] = products;

  return (
    <section
      className="border-b border-foreground/[0.06] bg-[oklch(0.992_0.004_82)] py-20 sm:py-28"
      aria-labelledby="featured-heading"
    >
      <div className="mx-auto min-w-0 max-w-6xl px-4 sm:px-6 md:px-8">
        <div className="mb-12 flex flex-col gap-6 sm:mb-14 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
          <div className="min-w-0 max-w-xl">
            <p className="font-accent text-[0.65rem] font-medium uppercase tracking-[0.32em] text-muted-foreground">
              Selection
            </p>
            <h2
              id="featured-heading"
              className="font-display mt-3 text-3xl tracking-[-0.02em] text-foreground sm:text-4xl"
            >
              Featured
            </h2>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-muted-foreground sm:text-base">
              A tight edit of pieces we stand behind—availability is always
              confirmed personally, never by cart.
            </p>
          </div>
          <Link
            href="/products"
            className={cn(
              buttonVariants({ variant: "outline", size: "default" }),
              "inline-flex w-full shrink-0 justify-center border-foreground/15 bg-background/60 text-xs uppercase tracking-[0.2em] sm:w-auto",
            )}
          >
            View all
          </Link>
        </div>

        {first ? <FeaturedSpotlight product={first} /> : null}

        {rest.length > 0 ? (
          <ul className="mt-16 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
            {rest.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
