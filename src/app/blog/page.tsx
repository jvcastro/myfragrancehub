import type { Metadata } from "next";

import { BlogCard } from "@/components/blog/blog-card";
import { absoluteUrl, siteConfig } from "@/config/site";
import { createCaller } from "@/trpc/server";

export const metadata: Metadata = {
  title: "Journal",
  description: `Editorial notes and house stories from ${siteConfig.name}.`,
  alternates: { canonical: absoluteUrl("/blog") },
};

export default async function BlogListingPage() {
  const api = await createCaller();
  const posts = await api.blog.listPublished({ take: 24 });

  return (
    <main className="flex flex-1 flex-col">
      <div className="mx-auto min-w-0 max-w-6xl px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-20">
        <header className="max-w-2xl">
          <p className="font-accent text-[0.65rem] font-medium uppercase tracking-[0.32em] text-muted-foreground">
            Journal
          </p>
          <h1 className="mt-3 font-display text-4xl tracking-[-0.03em] text-foreground sm:text-5xl">
            Notes on scent
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Short reads on how we work, what we stock, and how to inquire.
          </p>
        </header>

        {posts.length === 0 ? (
          <p className="mt-16 rounded-xl border border-dashed border-border/80 bg-muted/20 px-6 py-12 text-center text-sm text-muted-foreground">
            No published posts yet.
          </p>
        ) : (
          <ul className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <li key={post.id}>
                <BlogCard post={post} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
