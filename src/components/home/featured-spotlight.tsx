import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import type { ProductCardProduct } from "@/components/product/product-card";
import { formatPhp } from "@/lib/format-price";
import { remoteImageShouldBypassNextOptimizer } from "@/lib/remote-image-url";
import { cn } from "@/lib/utils";

export function FeaturedSpotlight({ product }: { product: ProductCardProduct }) {
  const img = product.images[0];
  const href = `/products/${product.slug}`;

  return (
    <article className="group relative min-w-0 overflow-hidden border border-foreground/[0.07] bg-card/40 shadow-[0_1px_0_rgba(0,0,0,0.04)] lg:grid lg:min-h-[min(28rem,62vh)] lg:grid-cols-12">
      <Link
        href={href}
        className="relative block aspect-[4/5] max-h-[min(70vh,28rem)] bg-muted sm:max-h-none lg:col-span-7 lg:aspect-auto lg:max-h-none lg:min-h-[20rem]"
      >
        {img ? (
          <Image
            src={img.imageUrl}
            alt={img.altText ?? product.name}
            fill
            className="object-cover transition-[transform,filter] duration-[1.1s] ease-out group-hover:scale-[1.02] group-hover:brightness-[1.03]"
            sizes="(max-width: 1024px) 100vw, 58vw"
            priority
            unoptimized={remoteImageShouldBypassNextOptimizer(img.imageUrl)}
          />
        ) : (
          <div className="flex h-full min-h-[12rem] items-center justify-center text-sm text-muted-foreground">
            No image
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/25 via-transparent to-transparent lg:bg-gradient-to-r" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {product.isSoldOut ? (
            <Badge variant="secondary" className="border-0 bg-background/85 text-foreground">
              Sold out
            </Badge>
          ) : (
            <Badge variant="secondary" className="border-0 bg-background/85 text-foreground">
              Available
            </Badge>
          )}
        </div>
      </Link>
      <div className="flex min-w-0 flex-col justify-center border-t border-foreground/[0.06] px-5 py-8 sm:px-8 sm:py-10 lg:col-span-5 lg:border-l lg:border-t-0 lg:px-12 lg:py-14">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <p className="font-accent text-[0.65rem] font-medium uppercase tracking-[0.32em] text-muted-foreground">
            {product.brand.name}
          </p>
          {product.isFeatured ? (
            <span className="font-accent text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-gold-foreground">
              Featured
            </span>
          ) : null}
        </div>
        <Link href={href} className="mt-4 block">
          <h3 className="font-display text-2xl leading-[1.12] tracking-[-0.02em] text-foreground transition-colors duration-300 group-hover:text-gold-foreground [overflow-wrap:anywhere] sm:text-3xl md:text-4xl">
            {product.name}
          </h3>
        </Link>
        {product.shortDescription ? (
          <p className="mt-5 max-w-md text-[0.95rem] leading-relaxed text-muted-foreground sm:text-base">
            {product.shortDescription}
          </p>
        ) : null}
        <p className="mt-8 font-display text-2xl tabular-nums tracking-tight text-foreground">
          {formatPhp(product.price)}
        </p>
        <div className="mt-8 sm:mt-10">
          <Link
            href={href}
            className={cn(
              buttonVariants({ size: "lg" }),
              "inline-flex w-full min-h-11 items-center justify-center sm:w-auto sm:min-h-9 sm:min-w-[10rem]",
            )}
          >
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}
