"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { FormFieldError } from "@/components/ui/form-field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { BlogFormValues } from "@/lib/schemas/admin-blog";
import { blogWriteSchema } from "@/lib/schemas/admin-blog";
import { standardSchemaResolver } from "@/lib/zod-standard-resolver";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";

export function BlogEditor({ postId }: { postId?: string }) {
  const router = useRouter();
  const isEdit = Boolean(postId);
  const utils = api.useUtils();

  const { data, isPending } = api.admin.blog.byId.useQuery(
    { id: postId! },
    { enabled: isEdit },
  );

  const form = useForm<BlogFormValues>({
    resolver: standardSchemaResolver(blogWriteSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      coverImage: "",
      isPublished: false,
      seoTitle: "",
      seoDescription: "",
    },
    mode: "onTouched",
  });

  useEffect(() => {
    if (!data) return;
    form.reset({
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt ?? "",
      content: data.content,
      coverImage: data.coverImage ?? "",
      isPublished: data.isPublished,
      seoTitle: data.seoTitle ?? "",
      seoDescription: data.seoDescription ?? "",
    });
  }, [data, form]);

  const createMut = api.admin.blog.create.useMutation({
    onSuccess: async () => {
      toast.success("Post created");
      await utils.admin.blog.list.invalidate();
      router.push("/admin/blog");
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMut = api.admin.blog.update.useMutation({
    onSuccess: async () => {
      toast.success("Saved");
      await utils.admin.blog.list.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  if (isEdit && isPending) {
    return <p className="p-8 text-sm text-muted-foreground">Loading…</p>;
  }

  const e = (name: keyof BlogFormValues) => form.formState.errors[name]?.message;

  return (
    <div className="mx-auto max-w-3xl p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-heading text-2xl text-foreground">{isEdit ? "Edit post" : "New post"}</h1>
        <Link
          href="/admin/blog"
          className={cn(buttonVariants({ variant: "ghost" }), "text-foreground/75 hover:text-foreground")}
        >
          Cancel
        </Link>
      </div>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit((values) => {
          if (isEdit && postId) {
            updateMut.mutate({ id: postId, data: values });
          } else {
            createMut.mutate(values);
          }
        })}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              className="bg-background"
              aria-invalid={e("title") ? true : undefined}
              aria-describedby={e("title") ? "title-error" : undefined}
              {...form.register("title")}
            />
            <FormFieldError id="title-error" message={e("title")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              className="bg-background font-mono text-sm"
              aria-invalid={e("slug") ? true : undefined}
              aria-describedby={e("slug") ? "slug-error" : undefined}
              {...form.register("slug")}
            />
            <FormFieldError id="slug-error" message={e("slug")} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="excerpt">Excerpt</Label>
          <Textarea
            id="excerpt"
            rows={2}
            className="bg-background"
            aria-invalid={e("excerpt") ? true : undefined}
            aria-describedby={e("excerpt") ? "excerpt-error" : undefined}
            {...form.register("excerpt")}
          />
          <FormFieldError id="excerpt-error" message={e("excerpt")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="content">Content (Markdown)</Label>
          <Textarea
            id="content"
            rows={12}
            className="bg-background font-mono text-sm"
            aria-invalid={e("content") ? true : undefined}
            aria-describedby={e("content") ? "content-error" : undefined}
            {...form.register("content")}
          />
          <FormFieldError id="content-error" message={e("content")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cover">Cover image URL</Label>
          <Input
            id="cover"
            className="bg-background"
            aria-invalid={e("coverImage") ? true : undefined}
            aria-describedby={e("coverImage") ? "coverImage-error" : undefined}
            {...form.register("coverImage")}
          />
          <FormFieldError id="coverImage-error" message={e("coverImage")} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="seoTitle">SEO title</Label>
            <Input
              id="seoTitle"
              className="bg-background"
              aria-invalid={e("seoTitle") ? true : undefined}
              aria-describedby={e("seoTitle") ? "seoTitle-error" : undefined}
              {...form.register("seoTitle")}
            />
            <FormFieldError id="seoTitle-error" message={e("seoTitle")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seoDesc">SEO description</Label>
            <Input
              id="seoDesc"
              className="bg-background"
              aria-invalid={e("seoDescription") ? true : undefined}
              aria-describedby={e("seoDescription") ? "seoDescription-error" : undefined}
              {...form.register("seoDescription")}
            />
            <FormFieldError id="seoDescription-error" message={e("seoDescription")} />
          </div>
        </div>
        <Controller
          name="isPublished"
          control={form.control}
          render={({ field }) => (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="size-4 rounded border border-input"
                checked={field.value}
                onChange={(ev) => field.onChange(ev.target.checked)}
                onBlur={field.onBlur}
                ref={field.ref}
              />
              Published
            </label>
          )}
        />
        <FormFieldError message={e("isPublished")} />
        <Button type="submit" disabled={createMut.isPending || updateMut.isPending}>
          {isEdit ? "Save" : "Create"}
        </Button>
      </form>
    </div>
  );
}
