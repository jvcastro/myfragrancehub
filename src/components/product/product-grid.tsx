import { ProductCard, type ProductCardProduct } from "@/components/product/product-card";

export function ProductGrid({ products }: { products: ProductCardProduct[] }) {
  if (products.length === 0) {
    return (
      <div className="border border-dashed border-foreground/15 bg-muted/15 px-6 py-16 text-center">
        <p className="font-display text-xl text-foreground">No fragrances match</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Try another search or clear filters to see the full catalog.
        </p>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
      {products.map((p) => (
        <li key={p.id}>
          <ProductCard product={p} />
        </li>
      ))}
    </ul>
  );
}
