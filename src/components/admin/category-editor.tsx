"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { FormFieldError } from "@/components/ui/form-field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CategoryFormValues } from "@/lib/schemas/admin-category";
import { categoryWriteSchema } from "@/lib/schemas/admin-category";
import { standardSchemaResolver } from "@/lib/zod-standard-resolver";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";

export function CategoryEditor({ categoryId }: { categoryId?: string }) {
  const router = useRouter();
  const isEdit = Boolean(categoryId);
  const utils = api.useUtils();

  const { data, isPending } = api.admin.category.byId.useQuery(
    { id: categoryId! },
    { enabled: isEdit },
  );

  const form = useForm<CategoryFormValues>({
    resolver: standardSchemaResolver(categoryWriteSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      seoTitle: "",
      seoDescription: "",
    },
    mode: "onTouched",
  });

  useEffect(() => {
    if (!data) return;
    form.reset({
      name: data.name,
      slug: data.slug,
      description: data.description ?? "",
      seoTitle: data.seoTitle ?? "",
      seoDescription: data.seoDescription ?? "",
    });
  }, [data, form]);

  const createMut = api.admin.category.create.useMutation({
    onSuccess: async () => {
      toast.success("Category created");
      await utils.admin.category.list.invalidate();
      router.push("/admin/categories");
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMut = api.admin.category.update.useMutation({
    onSuccess: async () => {
      toast.success("Saved");
      await utils.admin.category.list.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  if (isEdit && isPending) {
    return <p className="p-8 text-sm text-muted-foreground">Loading…</p>;
  }

  const e = (name: keyof CategoryFormValues) => form.formState.errors[name]?.message;

  return (
    <div className="mx-auto max-w-xl p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-heading text-2xl text-foreground">
          {isEdit ? "Edit category" : "New category"}
        </h1>
        <Link
          href="/admin/categories"
          className={cn(buttonVariants({ variant: "ghost" }), "text-foreground/75 hover:text-foreground")}
        >
          Cancel
        </Link>
      </div>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit((values) => {
          if (isEdit && categoryId) {
            updateMut.mutate({ id: categoryId, data: values });
          } else {
            createMut.mutate(values);
          }
        })}
      >
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            className="bg-background"
            aria-invalid={e("name") ? true : undefined}
            aria-describedby={e("name") ? "name-error" : undefined}
            {...form.register("name")}
          />
          <FormFieldError id="name-error" message={e("name")} />
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
        <div className="space-y-2">
          <Label htmlFor="desc">Description</Label>
          <Textarea
            id="desc"
            rows={3}
            className="bg-background"
            aria-invalid={e("description") ? true : undefined}
            aria-describedby={e("description") ? "description-error" : undefined}
            {...form.register("description")}
          />
          <FormFieldError id="description-error" message={e("description")} />
        </div>
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
        <Button type="submit" disabled={createMut.isPending || updateMut.isPending}>
          {isEdit ? "Save" : "Create"}
        </Button>
      </form>
    </div>
  );
}
