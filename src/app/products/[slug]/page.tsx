import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MarkdownBody } from "@/components/blog/markdown-body";
import { ProductCard } from "@/components/product/product-card";
import { ProductGallery } from "@/components/product/product-gallery";
import { MessengerCta } from "@/components/product/messenger-cta";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { absoluteUrl } from "@/config/site";
import { formatPhp, STORE_CURRENCY_CODE } from "@/lib/format-price";
import { createCaller } from "@/trpc/server";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const api = await createCaller();
    const p = await api.product.bySlug({ slug });
    const title = p.seoTitle ?? p.name;
    const description =
      p.seoDescription ?? p.shortDescription ?? p.description.slice(0, 160);
    const ogImage = p.images[0]?.imageUrl;
    return {
      title,
      description,
      alternates: { canonical: absoluteUrl(`/products/${p.slug}`) },
      openGraph: {
        title,
        description: description ?? undefined,
        url: absoluteUrl(`/products/${p.slug}`),
        type: "website",
        images: ogImage ? [{ url: ogImage }] : undefined,
      },
    };
  } catch {
    return { title: "Product" };
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const api = await createCaller();
  let product;
  try {
    product = await api.product.bySlug({ slug });
  } catch {
    notFound();
  }

  const settings = await api.settings.get();

  const description =
    product.seoDescription ??
    product.shortDescription ??
    product.description.slice(0, 500);
  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description,
    image: product.images.map((img) => img.imageUrl).filter(Boolean),
    brand: { "@type": "Brand", name: product.brand.name },
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/products/${product.slug}`),
      priceCurrency: STORE_CURRENCY_CODE,
      price: product.price,
      availability: product.isSoldOut
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
    },
  };

  return (
    <main className="flex flex-1 flex-col">
      <JsonLd data={productLd} />
      <article className="mx-auto w-full min-w-0 max-w-6xl px-4 py-10 sm:px-6 sm:py-12 md:px-8 md:py-16">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted-foreground sm:gap-2">
            <li className="min-w-0">
              <Link href="/products" className="hover:text-foreground">
                Collection
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="min-w-0">
              <Link
                href={`/products?category=${encodeURIComponent(product.category.slug)}`}
                className="break-words hover:text-foreground [overflow-wrap:anywhere]"
              >
                {product.category.name}
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="min-w-0 max-w-full break-words text-foreground [overflow-wrap:anywhere]">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="mt-8 grid min-w-0 gap-10 sm:mt-10 sm:gap-12 lg:grid-cols-2 lg:gap-16">
          <ProductGallery productName={product.name} images={product.images} />
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {product.brand.name}
            </p>
            <h1 className="mt-3 break-words font-display text-2xl tracking-[-0.03em] text-foreground [overflow-wrap:anywhere] sm:text-3xl md:text-4xl">
              {product.name}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="text-2xl font-medium tabular-nums">
                {formatPhp(product.price)}
              </span>
              {product.isSoldOut ? (
                <Badge variant="secondary">Sold out</Badge>
              ) : (
                <Badge variant="secondary" className="bg-muted text-foreground">
                  Available
                </Badge>
              )}
            </div>
            {product.shortDescription ? (
              <p className="mt-6 text-base leading-relaxed text-muted-foreground">
                {product.shortDescription}
              </p>
            ) : null}
            <Separator className="my-8 bg-border/80" />
            <div className="prose-mfh">
              <MarkdownBody content={product.description} />
            </div>
            {product.fragranceNotes ? (
              <section className="mt-10" aria-labelledby="notes-heading">
                <h2
                  id="notes-heading"
                  className="font-heading text-lg text-foreground"
                >
                  Profile
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {product.fragranceNotes}
                </p>
              </section>
            ) : null}
            <div className="mt-10 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:items-center">
              <MessengerCta
                messengerHref={settings?.facebookMessengerLink}
                productName={product.name}
                className="inline-flex w-full min-h-11 items-center justify-center sm:w-auto sm:min-h-9"
              />
              <Link
                href={`/products?brand=${encodeURIComponent(product.brand.slug)}`}
                className="text-center text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline sm:text-left"
              >
                More from {product.brand.name}
              </Link>
            </div>
          </div>
        </div>

        {product.related.length > 0 ? (
          <section className="mt-20 border-t border-border/60 pt-16" aria-labelledby="related">
            <h2
              id="related"
              className="font-heading text-2xl tracking-tight text-foreground"
            >
              You may also like
            </h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {product.related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        ) : null}
      </article>
    </main>
  );
}
