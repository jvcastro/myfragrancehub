import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { MarkdownBody } from "@/components/blog/markdown-body";
import { JsonLd } from "@/components/seo/json-ld";
import { absoluteUrl, siteConfig } from "@/config/site";
import { createCaller } from "@/trpc/server";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const api = await createCaller();
    const post = await api.blog.bySlug({ slug });
    const title = post.seoTitle ?? post.title;
    const description = post.seoDescription ?? post.excerpt ?? undefined;
    return {
      title,
      description,
      alternates: { canonical: absoluteUrl(`/blog/${post.slug}`) },
      openGraph: {
        title,
        description,
        url: absoluteUrl(`/blog/${post.slug}`),
        type: "article",
        publishedTime: post.createdAt.toISOString(),
        images: post.coverImage ? [{ url: post.coverImage }] : undefined,
      },
    };
  } catch {
    return { title: "Journal" };
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const api = await createCaller();
  let post;
  try {
    post = await api.blog.bySlug({ slug });
  } catch {
    notFound();
  }

  const postLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seoDescription ?? post.excerpt ?? undefined,
    datePublished: post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(`/blog/${post.slug}`),
    },
    ...(post.coverImage ? { image: [post.coverImage] } : {}),
  };

  return (
    <main className="flex flex-1 flex-col">
      <JsonLd data={postLd} />
      <article className="mx-auto w-full min-w-0 max-w-3xl px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-20">
        <header>
          <p className="font-accent text-[0.65rem] font-medium uppercase tracking-[0.32em] text-muted-foreground">
            {siteConfig.name} · Journal
          </p>
          <h1 className="mt-4 font-display text-4xl tracking-[-0.03em] text-foreground sm:text-5xl">
            {post.title}
          </h1>
          <time
            className="mt-4 block text-sm text-muted-foreground"
            dateTime={post.createdAt.toISOString()}
          >
            {post.createdAt.toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        </header>
        {post.coverImage ? (
          <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-xl bg-muted">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 48rem"
              priority
            />
          </div>
        ) : null}
        {post.excerpt ? (
          <p className="mt-10 text-lg leading-relaxed text-muted-foreground">
            {post.excerpt}
          </p>
        ) : null}
        <div className="mt-10">
          <MarkdownBody content={post.content} />
        </div>
      </article>
    </main>
  );
}
