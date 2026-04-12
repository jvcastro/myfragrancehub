"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { standardSchemaResolver } from "@/lib/zod-standard-resolver";
import { FormFieldError } from "@/components/ui/form-field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const inquirySchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(120),
  email: z.string().trim().email("Enter a valid email address"),
  message: z.string().trim().min(1, "Please enter a message").max(10_000),
});

type InquiryFormValues = z.infer<typeof inquirySchema>;

export function InquiryForm({ contactEmail }: { contactEmail: string | null }) {
  const [sent, setSent] = useState(false);

  const form = useForm<InquiryFormValues>({
    resolver: standardSchemaResolver(inquirySchema),
    defaultValues: { name: "", email: "", message: "" },
    mode: "onTouched",
  });

  const e = (name: keyof InquiryFormValues) => form.formState.errors[name]?.message;

  if (!contactEmail) {
    return (
      <p className="text-sm text-muted-foreground">
        Add a contact email in Admin → Site settings to enable the mailto inquiry form.
      </p>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) => {
        const subject = encodeURIComponent("Fragrance inquiry");
        const body = encodeURIComponent(
          `Name: ${values.name}\nEmail: ${values.email}\n\n${values.message}`,
        );
        const href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
        window.location.assign(href);
        setSent(true);
      })}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="inq-name">Name</Label>
          <Input
            id="inq-name"
            autoComplete="name"
            aria-invalid={e("name") ? true : undefined}
            aria-describedby={e("name") ? "inq-name-error" : undefined}
            {...form.register("name")}
          />
          <FormFieldError id="inq-name-error" message={e("name")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="inq-email">Your email</Label>
          <Input
            id="inq-email"
            type="email"
            autoComplete="email"
            aria-invalid={e("email") ? true : undefined}
            aria-describedby={e("email") ? "inq-email-error" : undefined}
            {...form.register("email")}
          />
          <FormFieldError id="inq-email-error" message={e("email")} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="inq-message">Message</Label>
        <Textarea
          id="inq-message"
          rows={5}
          placeholder="Fragrances you have in mind, skin chemistry, occasion, or budget in PHP…"
          aria-invalid={e("message") ? true : undefined}
          aria-describedby={e("message") ? "inq-message-error" : undefined}
          {...form.register("message")}
        />
        <FormFieldError id="inq-message-error" message={e("message")} />
      </div>
      <Button type="submit">Open email draft</Button>
      {sent ? (
        <p className="text-sm text-muted-foreground" role="status">
          If your mail client did not open, email us directly at {contactEmail}.
        </p>
      ) : null}
    </form>
  );
}
