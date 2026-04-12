"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ExternalLinkIcon, Loader2Icon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormFieldError } from "@/components/ui/form-field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  PRODUCT_IMAGE_MAX_BYTES,
  PRODUCT_IMAGE_MAX_COUNT,
  isProductImageContentType,
} from "@/constants/product-images";
import { routeSlugSchema } from "@/lib/form-schemas";
import type { ProductFieldsFormValues } from "@/lib/schemas/admin-product-fields";
import { productFieldsSchema } from "@/lib/schemas/admin-product-fields";
import { slugify } from "@/lib/slugify";
import { standardSchemaResolver } from "@/lib/zod-standard-resolver";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";

function imagesPayload(urls: string[]) {
  return urls.map((imageUrl, sortOrder) => ({
    imageUrl,
    sortOrder,
    altText: undefined as string | undefined,
  }));
}

export function ProductEditor({ productId }: { productId?: string }) {
  const router = useRouter();
  const isEdit = Boolean(productId);
  const utils = api.useUtils();
  const fileInputRef = useRef<HTMLInputElement>(null);
  /** When false (new product only), slug follows the name until the user edits the slug field. */
  const slugUserEditedRef = useRef(false);

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [pasteUrl, setPasteUrl] = useState("");
  const [brandDialogOpen, setBrandDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [newBrandSlug, setNewBrandSlug] = useState("");
  const newBrandSlugEditedRef = useRef(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategorySlug, setNewCategorySlug] = useState("");
  const newCategorySlugEditedRef = useRef(false);

  const { data: product, isPending: loadingProduct } = api.admin.product.byId.useQuery(
    { id: productId! },
    { enabled: isEdit },
  );

  const { data: brands } = api.brand.list.useQuery();
  const { data: categories } = api.category.list.useQuery();
  const { data: uploadStatus } = api.admin.upload.status.useQuery();
  const [uploadingImage, setUploadingImage] = useState(false);

  const defaultValues = useMemo<ProductFieldsFormValues>(
    () => ({
      name: "",
      slug: "",
      shortDescription: "",
      description: "",
      fragranceNotes: "",
      price: "0",
      isSoldOut: false,
      isFeatured: false,
      seoTitle: "",
      seoDescription: "",
      brandId: "",
      categoryId: "",
    }),
    [],
  );

  const form = useForm<ProductFieldsFormValues>({
    resolver: standardSchemaResolver(productFieldsSchema),
    defaultValues,
    mode: "onTouched",
  });

  useEffect(() => {
    if (isEdit) return;
    setImageUrls([]);
  }, [isEdit]);

  useEffect(() => {
    slugUserEditedRef.current = isEdit;
  }, [isEdit]);

  useEffect(() => {
    if (isEdit || !brands?.length || !categories?.length) return;
    if (!form.getValues("brandId")) form.setValue("brandId", brands[0]!.id);
    if (!form.getValues("categoryId")) form.setValue("categoryId", categories[0]!.id);
  }, [brands, categories, isEdit, form]);

  useEffect(() => {
    if (!product) return;
    form.reset({
      name: product.name,
      slug: product.slug,
      shortDescription: product.shortDescription ?? "",
      description: product.description,
      fragranceNotes: product.fragranceNotes ?? "",
      price: product.price,
      isSoldOut: product.isSoldOut,
      isFeatured: product.isFeatured,
      seoTitle: product.seoTitle ?? "",
      seoDescription: product.seoDescription ?? "",
      brandId: product.brandId,
      categoryId: product.categoryId,
    });
    setImageUrls(product.images.map((i) => i.imageUrl));
  }, [product, form]);

  const createMut = api.admin.product.create.useMutation({
    onSuccess: async () => {
      toast.success("Product created");
      await utils.admin.product.list.invalidate();
      router.push("/admin/products");
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMut = api.admin.product.update.useMutation({
    onSuccess: async () => {
      toast.success("Saved");
      await utils.admin.product.list.invalidate();
      if (productId) await utils.admin.product.byId.invalidate({ id: productId });
    },
    onError: (e) => toast.error(e.message),
  });

  const createBrandQuick = api.admin.brand.create.useMutation({
    onSuccess: async (row) => {
      toast.success("Brand created");
      await utils.brand.list.invalidate();
      await utils.admin.brand.list.invalidate();
      form.setValue("brandId", row.id, { shouldValidate: true, shouldDirty: true });
      setBrandDialogOpen(false);
    },
    onError: (e) => toast.error(e.message),
  });

  const createCategoryQuick = api.admin.category.create.useMutation({
    onSuccess: async (row) => {
      toast.success("Category created");
      await utils.category.list.invalidate();
      await utils.admin.category.list.invalidate();
      form.setValue("categoryId", row.id, { shouldValidate: true, shouldDirty: true });
      setCategoryDialogOpen(false);
    },
    onError: (e) => toast.error(e.message),
  });

  const addUrlFromPaste = () => {
    const raw = pasteUrl.trim();
    if (!raw) return;
    const parsed = z.string().url().safeParse(raw);
    if (!parsed.success) {
      toast.error("Enter a valid image URL (https or http).");
      return;
    }
    if (imageUrls.length >= PRODUCT_IMAGE_MAX_COUNT) {
      toast.error(`Maximum ${PRODUCT_IMAGE_MAX_COUNT} images per product.`);
      return;
    }
    setImageUrls((prev) => [...prev, parsed.data]);
    setPasteUrl("");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (imageUrls.length >= PRODUCT_IMAGE_MAX_COUNT) {
      toast.error(`Maximum ${PRODUCT_IMAGE_MAX_COUNT} images per product.`);
      return;
    }
    if (file.size > PRODUCT_IMAGE_MAX_BYTES) {
      toast.error(`Each image must be ${PRODUCT_IMAGE_MAX_BYTES / (1024 * 1024)}MB or smaller.`);
      return;
    }
    if (!isProductImageContentType(file.type)) {
      toast.error("Use JPEG, PNG, WebP, or GIF.");
      return;
    }
    const form = new FormData();
    form.set("file", file, file.name);
    setUploadingImage(true);
    try {
      const res = await fetch("/api/admin/upload/product-image", {
        method: "POST",
        body: form,
      });
      const data = (await res.json().catch(() => null)) as { publicUrl?: string; error?: string } | null;
      if (!res.ok) {
        throw new Error(data?.error ?? `Upload failed (${res.status})`);
      }
      const publicUrl = data?.publicUrl;
      if (!publicUrl) {
        throw new Error("Upload response missing URL.");
      }
      setImageUrls((prev) => [...prev, publicUrl]);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImageAt = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  if (isEdit && loadingProduct) {
    return <p className="p-4 text-sm text-muted-foreground sm:p-8">Loading…</p>;
  }

  const fieldErr = (name: keyof ProductFieldsFormValues) =>
    form.formState.errors[name]?.message;
  const rootMsg = form.formState.errors.root?.message;

  const slugWatch = form.watch("slug");
  const brandId = form.watch("brandId");
  const categoryId = form.watch("categoryId");
  const brandDisplayName = brands?.find((b) => b.id === brandId)?.name ?? null;
  const categoryDisplayName = categories?.find((c) => c.id === categoryId)?.name ?? null;

  function submitQuickBrand() {
    const name = newBrandName.trim();
    if (!name) {
      toast.error("Enter a brand name.");
      return;
    }
    const slugCandidate = (newBrandSlug.trim() || slugify(name)).trim() || slugify(name);
    const slugParsed = routeSlugSchema.safeParse(slugCandidate);
    if (!slugParsed.success) {
      toast.error(slugParsed.error.issues[0]?.message ?? "Invalid slug.");
      return;
    }
    createBrandQuick.mutate({
      name,
      slug: slugParsed.data,
      bio: "",
      logoUrl: "",
      seoTitle: "",
      seoDescription: "",
    });
  }

  function submitQuickCategory() {
    const name = newCategoryName.trim();
    if (!name) {
      toast.error("Enter a category name.");
      return;
    }
    const slugCandidate = (newCategorySlug.trim() || slugify(name)).trim() || slugify(name);
    const slugParsed = routeSlugSchema.safeParse(slugCandidate);
    if (!slugParsed.success) {
      toast.error(slugParsed.error.issues[0]?.message ?? "Invalid slug.");
      return;
    }
    createCategoryQuick.mutate({
      name,
      slug: slugParsed.data,
      description: "",
      seoTitle: "",
      seoDescription: "",
    });
  }

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <h1 className="font-heading text-2xl text-foreground">
            {isEdit ? "Edit product" : "New product"}
          </h1>
          {isEdit && product ? (
            <Link
              href={`/products/${encodeURIComponent((slugWatch || product.slug).trim() || product.slug)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              View on site
              <ExternalLinkIcon className="size-3.5 shrink-0 opacity-70" aria-hidden />
            </Link>
          ) : null}
        </div>
        <Link
          href="/admin/products"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "self-start text-foreground/75 hover:text-foreground sm:self-auto",
          )}
        >
          Cancel
        </Link>
      </div>

      <form
        className="space-y-6"
        onSubmit={form.handleSubmit((values) => {
          form.clearErrors("root");
          if (imageUrls.length > PRODUCT_IMAGE_MAX_COUNT) {
            const msg = `Maximum ${PRODUCT_IMAGE_MAX_COUNT} images per product.`;
            form.setError("root", { message: msg });
            toast.error(msg);
            return;
          }
          const urlCheck = z.array(z.string().url()).max(PRODUCT_IMAGE_MAX_COUNT).safeParse(imageUrls);
          if (!urlCheck.success) {
            const msg = urlCheck.error.issues[0]?.message ?? "Each image must be a valid URL.";
            form.setError("root", { message: msg });
            toast.error(msg);
            return;
          }
          const images = imagesPayload(imageUrls);
          const payload = { ...values, images };
          if (isEdit && productId) {
            updateMut.mutate({ id: productId, data: payload });
          } else {
            createMut.mutate(payload);
          }
        })}
      >
        <FormFieldError message={rootMsg} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              className="bg-background"
              aria-invalid={fieldErr("name") ? true : undefined}
              aria-describedby={fieldErr("name") ? "product-name-error" : undefined}
              {...form.register("name", {
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                  if (!slugUserEditedRef.current) {
                    const next = slugify(e.target.value);
                    form.setValue("slug", next, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }
                },
              })}
            />
            <FormFieldError id="product-name-error" message={fieldErr("name")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              className="bg-background font-mono text-sm"
              placeholder={isEdit ? undefined : "e.g. noir-extreme-100ml"}
              aria-invalid={fieldErr("slug") ? true : undefined}
              aria-describedby={fieldErr("slug") ? "product-slug-error" : undefined}
              {...form.register("slug", {
                onChange: () => {
                  slugUserEditedRef.current = true;
                },
              })}
            />
            <FormFieldError id="product-slug-error" message={fieldErr("slug")} />
            <p className="text-xs text-muted-foreground">
              {isEdit
                ? "Changing the name does not change the slug, so existing links keep working."
                : "Suggested from the name — edit this field if you want a different URL."}
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <Label id="product-brand-label">Brand</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 w-full shrink-0 text-xs sm:h-8 sm:w-auto"
                onClick={() => {
                  setNewBrandName("");
                  setNewBrandSlug("");
                  newBrandSlugEditedRef.current = false;
                  setBrandDialogOpen(true);
                }}
              >
                New brand…
              </Button>
            </div>
            <Select
              value={brandId}
              onValueChange={(v: string | null) => {
                form.setValue("brandId", v ?? "", { shouldValidate: true, shouldDirty: true });
              }}
            >
              <SelectTrigger
                className="w-full min-w-0 bg-background"
                aria-labelledby="product-brand-label"
                aria-invalid={fieldErr("brandId") ? true : undefined}
                aria-describedby={fieldErr("brandId") ? "product-brand-error" : undefined}
              >
                <SelectValue placeholder="Select brand">
                  {brandDisplayName ? <span className="truncate">{brandDisplayName}</span> : null}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {brands?.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormFieldError id="product-brand-error" message={fieldErr("brandId")} />
          </div>
          <div className="space-y-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <Label id="product-category-label">Category</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 w-full shrink-0 text-xs sm:h-8 sm:w-auto"
                onClick={() => {
                  setNewCategoryName("");
                  setNewCategorySlug("");
                  newCategorySlugEditedRef.current = false;
                  setCategoryDialogOpen(true);
                }}
              >
                New category…
              </Button>
            </div>
            <Select
              value={categoryId}
              onValueChange={(v: string | null) => {
                form.setValue("categoryId", v ?? "", { shouldValidate: true, shouldDirty: true });
              }}
            >
              <SelectTrigger
                className="w-full min-w-0 bg-background"
                aria-labelledby="product-category-label"
                aria-invalid={fieldErr("categoryId") ? true : undefined}
                aria-describedby={fieldErr("categoryId") ? "product-category-error" : undefined}
              >
                <SelectValue placeholder="Select category">
                  {categoryDisplayName ? <span className="truncate">{categoryDisplayName}</span> : null}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {categories?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormFieldError id="product-category-error" message={fieldErr("categoryId")} />
          </div>
        </div>

        <Dialog
          open={brandDialogOpen}
          onOpenChange={(open) => {
            setBrandDialogOpen(open);
            if (!open) {
              setNewBrandName("");
              setNewBrandSlug("");
              newBrandSlugEditedRef.current = false;
            }
          }}
        >
          <DialogContent className="sm:max-w-md" showCloseButton>
            <DialogHeader>
              <DialogTitle>New brand</DialogTitle>
              <DialogDescription>
                Creates a minimal brand and selects it for this product. You can edit details later in Brands.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3">
              <div className="space-y-2">
                <Label htmlFor="quick-brand-name">Name</Label>
                <Input
                  id="quick-brand-name"
                  className="bg-background"
                  value={newBrandName}
                  onChange={(e) => {
                    const v = e.target.value;
                    setNewBrandName(v);
                    if (!newBrandSlugEditedRef.current) {
                      setNewBrandSlug(slugify(v));
                    }
                  }}
                  placeholder="e.g. Maison Nocturne"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quick-brand-slug">Slug</Label>
                <Input
                  id="quick-brand-slug"
                  className="bg-background font-mono text-base sm:text-xs"
                  value={newBrandSlug}
                  onChange={(e) => {
                    newBrandSlugEditedRef.current = true;
                    setNewBrandSlug(e.target.value);
                  }}
                  placeholder="auto from name"
                />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:justify-end sm:gap-3">
              <Button
                type="button"
                variant="outline"
                className="min-h-11 w-full touch-manipulation sm:min-h-10 sm:w-auto"
                onClick={() => setBrandDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="min-h-11 w-full touch-manipulation sm:min-h-10 sm:w-auto"
                disabled={createBrandQuick.isPending}
                onClick={submitQuickBrand}
              >
                {createBrandQuick.isPending ? "Creating…" : "Create brand"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={categoryDialogOpen}
          onOpenChange={(open) => {
            setCategoryDialogOpen(open);
            if (!open) {
              setNewCategoryName("");
              setNewCategorySlug("");
              newCategorySlugEditedRef.current = false;
            }
          }}
        >
          <DialogContent className="sm:max-w-md" showCloseButton>
            <DialogHeader>
              <DialogTitle>New category</DialogTitle>
              <DialogDescription>
                Creates a minimal category and selects it for this product. You can edit details later in Categories.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3">
              <div className="space-y-2">
                <Label htmlFor="quick-cat-name">Name</Label>
                <Input
                  id="quick-cat-name"
                  className="bg-background"
                  value={newCategoryName}
                  onChange={(e) => {
                    const v = e.target.value;
                    setNewCategoryName(v);
                    if (!newCategorySlugEditedRef.current) {
                      setNewCategorySlug(slugify(v));
                    }
                  }}
                  placeholder="e.g. White florals"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quick-cat-slug">Slug</Label>
                <Input
                  id="quick-cat-slug"
                  className="bg-background font-mono text-base sm:text-xs"
                  value={newCategorySlug}
                  onChange={(e) => {
                    newCategorySlugEditedRef.current = true;
                    setNewCategorySlug(e.target.value);
                  }}
                  placeholder="auto from name"
                />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:justify-end sm:gap-3">
              <Button
                type="button"
                variant="outline"
                className="min-h-11 w-full touch-manipulation sm:min-h-10 sm:w-auto"
                onClick={() => setCategoryDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="min-h-11 w-full touch-manipulation sm:min-h-10 sm:w-auto"
                disabled={createCategoryQuick.isPending}
                onClick={submitQuickCategory}
              >
                {createCategoryQuick.isPending ? "Creating…" : "Create category"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <div className="space-y-2">
          <Label htmlFor="price">Price (PHP)</Label>
          <Input
            id="price"
            className="bg-background"
            inputMode="decimal"
            placeholder="0.00"
            aria-invalid={fieldErr("price") ? true : undefined}
            aria-describedby={fieldErr("price") ? "product-price-error" : undefined}
            {...form.register("price")}
          />
          <FormFieldError id="product-price-error" message={fieldErr("price")} />
        </div>
        <div className="flex flex-wrap gap-6">
          <Controller
            name="isSoldOut"
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
                Sold out
              </label>
            )}
          />
          <Controller
            name="isFeatured"
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
                Featured
              </label>
            )}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="short">Short description</Label>
          <Textarea
            id="short"
            className="bg-background"
            rows={2}
            aria-invalid={fieldErr("shortDescription") ? true : undefined}
            aria-describedby={fieldErr("shortDescription") ? "product-short-error" : undefined}
            {...form.register("shortDescription")}
          />
          <FormFieldError id="product-short-error" message={fieldErr("shortDescription")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="desc">Full description</Label>
          <Textarea
            id="desc"
            className="bg-background"
            rows={6}
            aria-invalid={fieldErr("description") ? true : undefined}
            aria-describedby={fieldErr("description") ? "product-desc-error" : undefined}
            {...form.register("description")}
          />
          <FormFieldError id="product-desc-error" message={fieldErr("description")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Fragrance notes / profile</Label>
          <Textarea
            id="notes"
            className="bg-background"
            rows={3}
            aria-invalid={fieldErr("fragranceNotes") ? true : undefined}
            aria-describedby={fieldErr("fragranceNotes") ? "product-notes-error" : undefined}
            {...form.register("fragranceNotes")}
          />
          <FormFieldError id="product-notes-error" message={fieldErr("fragranceNotes")} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="seoTitle">SEO title</Label>
            <Input
              id="seoTitle"
              className="bg-background"
              aria-invalid={fieldErr("seoTitle") ? true : undefined}
              aria-describedby={fieldErr("seoTitle") ? "product-seo-title-error" : undefined}
              {...form.register("seoTitle")}
            />
            <FormFieldError id="product-seo-title-error" message={fieldErr("seoTitle")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seoDesc">SEO description</Label>
            <Input
              id="seoDesc"
              className="bg-background"
              aria-invalid={fieldErr("seoDescription") ? true : undefined}
              aria-describedby={fieldErr("seoDescription") ? "product-seo-desc-error" : undefined}
              {...form.register("seoDescription")}
            />
            <FormFieldError id="product-seo-desc-error" message={fieldErr("seoDescription")} />
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-foreground/10 bg-card/30 p-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <Label className="text-base">Images</Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Up to {PRODUCT_IMAGE_MAX_COUNT} images, {PRODUCT_IMAGE_MAX_BYTES / (1024 * 1024)}MB each (JPEG,
                PNG, WebP, GIF).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept={["image/jpeg", "image/png", "image/webp", "image/gif"].join(",")}
                className="hidden"
                onChange={handleFileChange}
              />
              <Button
                type="button"
                variant="outline"
                disabled={
                  !uploadStatus?.configured ||
                  imageUrls.length >= PRODUCT_IMAGE_MAX_COUNT ||
                  uploadingImage
                }
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadingImage ? (
                  <>
                    <Loader2Icon className="mr-2 size-4 animate-spin" aria-hidden />
                    Uploading…
                  </>
                ) : (
                  "Upload image"
                )}
              </Button>
            </div>
          </div>
          {!uploadStatus?.configured ? (
            <p className="text-xs text-muted-foreground">
              {uploadStatus?.publicUrlIssue ? (
                <span className="text-destructive">{uploadStatus.publicUrlIssue}</span>
              ) : (
                <>
                  Cloud upload is disabled until R2 is configured (see{" "}
                  <code className="rounded bg-muted px-1">.env.example</code>). You can still add images by URL
                  below.
                </>
              )}
            </p>
          ) : null}

          {imageUrls.length > 0 ? (
            <ul className="grid gap-3 sm:grid-cols-2">
              {imageUrls.map((url, index) => (
                <li
                  key={`${url}-${index}`}
                  className="flex gap-3 rounded-lg border border-foreground/10 bg-background/50 p-2"
                >
                  <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                    <Image
                      src={url}
                      alt=""
                      width={80}
                      height={96}
                      className="size-full object-cover"
                      sizes="80px"
                      unoptimized
                    />
                  </div>
                  <div className="min-w-0 flex-1 py-1">
                    <p className="truncate font-mono text-[0.65rem] text-muted-foreground" title={url}>
                      {url}
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mt-2 h-8 text-destructive hover:text-destructive"
                      onClick={() => removeImageAt(index)}
                    >
                      <XIcon className="mr-1 size-3.5" aria-hidden />
                      Remove
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No images yet.</p>
          )}

          <div className="flex flex-col gap-2 border-t border-foreground/10 pt-3 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1 space-y-2">
              <Label htmlFor="paste-image-url" className="text-xs text-muted-foreground">
                Add by URL (optional)
              </Label>
              <Input
                id="paste-image-url"
                className="bg-background font-mono text-xs"
                placeholder="https://…"
                value={pasteUrl}
                onChange={(e) => setPasteUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addUrlFromPaste();
                  }
                }}
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              disabled={imageUrls.length >= PRODUCT_IMAGE_MAX_COUNT || !pasteUrl.trim()}
              onClick={addUrlFromPaste}
            >
              Add URL
            </Button>
          </div>
        </div>

        <Button type="submit" disabled={createMut.isPending || updateMut.isPending}>
          {isEdit ? "Save changes" : "Create product"}
        </Button>
      </form>
    </div>
  );
}
