"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { FormFieldError } from "@/components/ui/form-field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { SiteSettingsWriteValues } from "@/lib/schemas/site-settings";
import { siteSettingsWriteSchema } from "@/lib/schemas/site-settings";
import { standardSchemaResolver } from "@/lib/zod-standard-resolver";
import { api } from "@/trpc/react";

export function SettingsForm() {
  const utils = api.useUtils();
  const { data, isPending } = api.admin.settings.get.useQuery();
  const save = api.admin.settings.save.useMutation({
    onSuccess: async () => {
      toast.success("Site settings saved");
      await utils.admin.settings.get.invalidate();
      await utils.settings.get.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const form = useForm<SiteSettingsWriteValues>({
    resolver: standardSchemaResolver(siteSettingsWriteSchema),
    defaultValues: {
      brandName: "",
      heroTitle: "",
      heroSubtitle: "",
      aboutContent: "",
      contactEmail: "",
      contactPhone: "",
      address: "",
      facebookMessengerLink: "",
      facebookLink: "",
      instagramLink: "",
      defaultSeoTitle: "",
      defaultSeoDescription: "",
    },
    mode: "onTouched",
  });

  useEffect(() => {
    if (!data) return;
    form.reset({
      brandName: data.brandName,
      heroTitle: data.heroTitle,
      heroSubtitle: data.heroSubtitle,
      aboutContent: data.aboutContent,
      contactEmail: data.contactEmail ?? "",
      contactPhone: data.contactPhone ?? "",
      address: data.address ?? "",
      facebookMessengerLink: data.facebookMessengerLink ?? "",
      facebookLink: data.facebookLink ?? "",
      instagramLink: data.instagramLink ?? "",
      defaultSeoTitle: data.defaultSeoTitle ?? "",
      defaultSeoDescription: data.defaultSeoDescription ?? "",
    });
  }, [data, form]);

  if (isPending && !data) {
    return <p className="p-8 text-sm text-muted-foreground">Loading…</p>;
  }

  const err = (name: keyof SiteSettingsWriteValues) => form.formState.errors[name]?.message;

  return (
    <div className="mx-auto max-w-3xl p-8">
      <h1 className="font-heading text-2xl text-foreground">Site settings</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Homepage hero, about copy, contact, social links, Messenger, and default SEO.
      </p>
      <form className="mt-8 space-y-6" onSubmit={form.handleSubmit((values) => save.mutate(values))}>
        <div className="space-y-2">
          <Label htmlFor="brandName">Brand name (header)</Label>
          <Input
            id="brandName"
            className="bg-background"
            aria-invalid={err("brandName") ? true : undefined}
            aria-describedby={err("brandName") ? "brandName-error" : undefined}
            {...form.register("brandName")}
          />
          <FormFieldError id="brandName-error" message={err("brandName")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="heroTitle">Hero title</Label>
          <Input
            id="heroTitle"
            className="bg-background"
            aria-invalid={err("heroTitle") ? true : undefined}
            aria-describedby={err("heroTitle") ? "heroTitle-error" : undefined}
            {...form.register("heroTitle")}
          />
          <FormFieldError id="heroTitle-error" message={err("heroTitle")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="heroSubtitle">Hero subtitle</Label>
          <Textarea
            id="heroSubtitle"
            rows={3}
            className="bg-background"
            aria-invalid={err("heroSubtitle") ? true : undefined}
            aria-describedby={err("heroSubtitle") ? "heroSubtitle-error" : undefined}
            {...form.register("heroSubtitle")}
          />
          <FormFieldError id="heroSubtitle-error" message={err("heroSubtitle")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="about">About page content (Markdown)</Label>
          <Textarea
            id="about"
            rows={10}
            className="bg-background font-mono text-sm"
            aria-invalid={err("aboutContent") ? true : undefined}
            aria-describedby={err("aboutContent") ? "aboutContent-error" : undefined}
            {...form.register("aboutContent")}
          />
          <FormFieldError id="aboutContent-error" message={err("aboutContent")} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email">Contact email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              className="bg-background"
              aria-invalid={err("contactEmail") ? true : undefined}
              aria-describedby={err("contactEmail") ? "contactEmail-error" : undefined}
              {...form.register("contactEmail")}
            />
            <FormFieldError id="contactEmail-error" message={err("contactEmail")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Contact phone</Label>
            <Input
              id="phone"
              className="bg-background"
              aria-invalid={err("contactPhone") ? true : undefined}
              aria-describedby={err("contactPhone") ? "contactPhone-error" : undefined}
              {...form.register("contactPhone")}
            />
            <FormFieldError id="contactPhone-error" message={err("contactPhone")} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            rows={2}
            className="bg-background"
            aria-invalid={err("address") ? true : undefined}
            aria-describedby={err("address") ? "address-error" : undefined}
            {...form.register("address")}
          />
          <FormFieldError id="address-error" message={err("address")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="messenger">Facebook Messenger link</Label>
          <Input
            id="messenger"
            className="bg-background"
            aria-invalid={err("facebookMessengerLink") ? true : undefined}
            aria-describedby={err("facebookMessengerLink") ? "facebookMessengerLink-error" : undefined}
            {...form.register("facebookMessengerLink")}
          />
          <FormFieldError id="facebookMessengerLink-error" message={err("facebookMessengerLink")} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fb">Facebook URL</Label>
            <Input
              id="fb"
              className="bg-background"
              aria-invalid={err("facebookLink") ? true : undefined}
              aria-describedby={err("facebookLink") ? "facebookLink-error" : undefined}
              {...form.register("facebookLink")}
            />
            <FormFieldError id="facebookLink-error" message={err("facebookLink")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ig">Instagram URL</Label>
            <Input
              id="ig"
              className="bg-background"
              aria-invalid={err("instagramLink") ? true : undefined}
              aria-describedby={err("instagramLink") ? "instagramLink-error" : undefined}
              {...form.register("instagramLink")}
            />
            <FormFieldError id="instagramLink-error" message={err("instagramLink")} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="dseo">Default SEO title</Label>
          <Input
            id="dseo"
            className="bg-background"
            aria-invalid={err("defaultSeoTitle") ? true : undefined}
            aria-describedby={err("defaultSeoTitle") ? "defaultSeoTitle-error" : undefined}
            {...form.register("defaultSeoTitle")}
          />
          <FormFieldError id="defaultSeoTitle-error" message={err("defaultSeoTitle")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dseod">Default SEO description</Label>
          <Textarea
            id="dseod"
            rows={2}
            className="bg-background"
            aria-invalid={err("defaultSeoDescription") ? true : undefined}
            aria-describedby={err("defaultSeoDescription") ? "defaultSeoDescription-error" : undefined}
            {...form.register("defaultSeoDescription")}
          />
          <FormFieldError id="defaultSeoDescription-error" message={err("defaultSeoDescription")} />
        </div>
        <Button type="submit" disabled={save.isPending}>
          Save settings
        </Button>
      </form>
    </div>
  );
}
