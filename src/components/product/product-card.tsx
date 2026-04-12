import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { formatPhp } from "@/lib/format-price";
import { remoteImageShouldBypassNextOptimizer } from "@/lib/remote-image-url";
import { cn } from "@/lib/utils";

export type ProductCardProduct = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  price: string;
  isSoldOut: boolean;
  isFeatured: boolean;
  brand: { name: string; slug: string };
  category: { name: string; slug: string };
  images: { imageUrl: string; altText: string | null }[];
};

export function ProductCard({ product }: { product: ProductCardProduct }) {
  const img = product.images[0];
  const href = `/products/${product.slug}`;

  return (
    <article className="group relative flex flex-col overflow-hidden border border-foreground/[0.07] bg-card/50 shadow-[0_1px_0_rgba(0,0,0,0.03)] transition-[box-shadow,transform] duration-500 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-16px_rgba(0,0,0,0.12)]">
      <Link href={href} className="relative aspect-[4/5] overflow-hidden bg-muted">
        {img ? (
          <Image
            src={img.imageUrl}
            alt={img.altText ?? product.name}
            fill
            className="object-cover transition-[transform,filter] duration-[1.05s] ease-out group-hover:scale-[1.03] group-hover:brightness-[1.02]"
            sizes="(max-width: 768px) 100vw, 33vw"
            unoptimized={remoteImageShouldBypassNextOptimizer(img.imageUrl)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            No image
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {product.isSoldOut ? (
            <Badge variant="secondary" className="border-0 bg-background/88 text-foreground">
              Sold out
            </Badge>
          ) : (
            <Badge variant="secondary" className="border-0 bg-background/88 text-foreground">
              Available
            </Badge>
          )}
          {product.isFeatured ? (
            <Badge className="border border-gold/35 bg-gold/12 font-accent text-[0.6rem] uppercase tracking-[0.2em] text-gold-foreground">
              Featured
            </Badge>
          ) : null}
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-2 border-t border-foreground/[0.05] p-5">
        <p className="font-accent text-[0.6rem] font-medium uppercase tracking-[0.28em] text-muted-foreground">
          {product.brand.name}
        </p>
        <Link href={href}>
          <h3 className="font-heading text-xl font-medium leading-snug tracking-[-0.01em] text-foreground transition-colors duration-300 group-hover:text-gold-foreground">
            {product.name}
          </h3>
        </Link>
        {product.shortDescription ? (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {product.shortDescription}
          </p>
        ) : null}
        <p className="mt-auto pt-2 font-display text-lg tabular-nums tracking-tight text-foreground">
          {formatPhp(product.price)}
        </p>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden border border-foreground/[0.07] bg-card/50">
      <div className={cn("aspect-[4/5] animate-pulse bg-muted")} />
      <div className="space-y-3 border-t border-foreground/[0.05] p-5">
        <div className="h-2.5 w-16 animate-pulse rounded bg-muted" />
        <div className="h-6 w-[75%] animate-pulse rounded bg-muted" />
        <div className="h-3 w-full animate-pulse rounded bg-muted" />
        <div className="h-5 w-20 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
