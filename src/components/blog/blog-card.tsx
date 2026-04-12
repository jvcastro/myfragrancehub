import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

export function BlogCard({
  post,
}: {
  post: {
    title: string;
    slug: string;
    excerpt: string | null;
    coverImage: string | null;
    createdAt: Date;
  };
}) {
  const href = `/blog/${post.slug}`;
  return (
    <article className="group flex flex-col overflow-hidden border border-foreground/[0.07] bg-card/50 shadow-[0_1px_0_rgba(0,0,0,0.03)] transition-[box-shadow,transform] duration-500 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-16px_rgba(0,0,0,0.1)]">
      <Link href={href} className="relative aspect-[16/10] overflow-hidden bg-muted">
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover transition-[transform,filter] duration-[1.05s] ease-out group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-accent text-[0.65rem] uppercase tracking-[0.24em] text-muted-foreground">
            Journal
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-3 border-t border-foreground/[0.05] p-5">
        <time
          className="font-accent text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground"
          dateTime={post.createdAt.toISOString()}
        >
          {post.createdAt.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </time>
        <Link href={href}>
          <h2 className="font-heading text-xl font-medium leading-snug tracking-[-0.01em] text-foreground transition-colors duration-300 group-hover:text-gold-foreground">
            {post.title}
          </h2>
        </Link>
        {post.excerpt ? (
          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {post.excerpt}
          </p>
        ) : null}
        <Link
          href={href}
          className={cn(
            "mt-auto pt-1 font-accent text-[0.6rem] font-medium uppercase tracking-[0.2em] text-muted-foreground underline-offset-8 transition-colors hover:text-foreground",
          )}
        >
          Continue reading
        </Link>
      </div>
    </article>
  );
}
