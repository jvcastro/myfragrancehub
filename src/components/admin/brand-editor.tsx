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
import type { BrandFormValues } from "@/lib/schemas/admin-brand";
import { brandWriteSchema } from "@/lib/schemas/admin-brand";
import { standardSchemaResolver } from "@/lib/zod-standard-resolver";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";

export function BrandEditor({ brandId }: { brandId?: string }) {
  const router = useRouter();
  const isEdit = Boolean(brandId);
  const utils = api.useUtils();

  const { data, isPending } = api.admin.brand.byId.useQuery(
    { id: brandId! },
    { enabled: isEdit },
  );

  const form = useForm<BrandFormValues>({
    resolver: standardSchemaResolver(brandWriteSchema),
    defaultValues: {
      name: "",
      slug: "",
      bio: "",
      logoUrl: "",
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
      bio: data.bio ?? "",
      logoUrl: data.logoUrl ?? "",
      seoTitle: data.seoTitle ?? "",
      seoDescription: data.seoDescription ?? "",
    });
  }, [data, form]);

  const createMut = api.admin.brand.create.useMutation({
    onSuccess: async () => {
      toast.success("Brand created");
      await utils.admin.brand.list.invalidate();
      router.push("/admin/brands");
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMut = api.admin.brand.update.useMutation({
    onSuccess: async () => {
      toast.success("Saved");
      await utils.admin.brand.list.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  if (isEdit && isPending) {
    return <p className="p-8 text-sm text-muted-foreground">Loading…</p>;
  }

  const e = (name: keyof BrandFormValues) => form.formState.errors[name]?.message;

  return (
    <div className="mx-auto max-w-xl p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-heading text-2xl text-foreground">{isEdit ? "Edit brand" : "New brand"}</h1>
        <Link
          href="/admin/brands"
          className={cn(buttonVariants({ variant: "ghost" }), "text-foreground/75 hover:text-foreground")}
        >
          Cancel
        </Link>
      </div>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit((values) => {
          if (isEdit && brandId) {
            updateMut.mutate({ id: brandId, data: values });
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
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            rows={4}
            className="bg-background"
            aria-invalid={e("bio") ? true : undefined}
            aria-describedby={e("bio") ? "bio-error" : undefined}
            {...form.register("bio")}
          />
          <FormFieldError id="bio-error" message={e("bio")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="logo">Logo URL</Label>
          <Input
            id="logo"
            className="bg-background"
            aria-invalid={e("logoUrl") ? true : undefined}
            aria-describedby={e("logoUrl") ? "logoUrl-error" : undefined}
            {...form.register("logoUrl")}
          />
          <FormFieldError id="logoUrl-error" message={e("logoUrl")} />
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
