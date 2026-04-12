"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { standardSchemaResolver } from "@/lib/zod-standard-resolver";
import { FormFieldError } from "@/components/ui/form-field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const loginSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required").max(2000),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm({ configError }: { configError?: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: standardSchemaResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  });

  const e = (name: keyof LoginFormValues) => form.formState.errors[name]?.message;

  return (
    <form
      className="mt-8 space-y-4"
      onSubmit={form.handleSubmit(async (values) => {
        setPending(true);
        try {
          const res = await fetch("/api/admin/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
          });
          const data = (await res.json()) as { error?: string };
          if (!res.ok) {
            toast.error(data.error ?? "Sign-in failed");
            return;
          }
          toast.success("Signed in");
          router.push("/admin");
          router.refresh();
        } finally {
          setPending(false);
        }
      })}
    >
      {configError ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          Set <code className="font-mono text-xs">AUTH_SECRET</code> (16+ characters)
          in <code className="font-mono text-xs">.env</code>, restart the dev server,
          then try again.
        </p>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="username"
          className="bg-background"
          aria-invalid={e("email") ? true : undefined}
          aria-describedby={e("email") ? "login-email-error" : undefined}
          {...form.register("email")}
        />
        <FormFieldError id="login-email-error" message={e("email")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          className="bg-background"
          aria-invalid={e("password") ? true : undefined}
          aria-describedby={e("password") ? "login-password-error" : undefined}
          {...form.register("password")}
        />
        <FormFieldError id="login-password-error" message={e("password")} />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
