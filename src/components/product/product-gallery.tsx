"use client";

import Image from "next/image";
import { useState } from "react";

import { remoteImageShouldBypassNextOptimizer } from "@/lib/remote-image-url";
import { cn } from "@/lib/utils";

export function ProductGallery({
  productName,
  images,
}: {
  productName: string;
  images: { id: string; imageUrl: string; altText: string | null }[];
}) {
  const [active, setActive] = useState(0);
  const main = images[active] ?? images[0];

  if (!main) {
    return (
      <div className="flex aspect-[4/5] items-center justify-center rounded-xl bg-muted text-sm text-muted-foreground">
        No imagery yet
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-muted ring-1 ring-foreground/10">
        <Image
          key={main.id}
          src={main.imageUrl}
          alt={main.altText ?? productName}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
          unoptimized={remoteImageShouldBypassNextOptimizer(main.imageUrl)}
        />
      </div>
      {images.length > 1 ? (
        <ul className="flex flex-wrap gap-2" aria-label="Product images">
          {images.map((img, i) => (
            <li key={img.id}>
              <button
                type="button"
                onClick={() => setActive(i)}
                className={cn(
                  "relative h-16 w-16 overflow-hidden rounded-md ring-2 transition-all",
                  i === active
                    ? "ring-gold/70 ring-offset-2 ring-offset-background"
                    : "ring-transparent opacity-70 hover:opacity-100",
                )}
              >
                <Image
                  src={img.imageUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="64px"
                  unoptimized={remoteImageShouldBypassNextOptimizer(img.imageUrl)}
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
