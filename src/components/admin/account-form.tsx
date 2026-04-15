"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { FormFieldError } from "@/components/ui/form-field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  adminUpdateEmailSchema,
  adminUpdatePasswordSchema,
  type AdminUpdateEmailValues,
  type AdminUpdatePasswordValues,
} from "@/lib/schemas/admin-account";
import { standardSchemaResolver } from "@/lib/zod-standard-resolver";
import { api } from "@/trpc/react";

export function AccountForm() {
  const utils = api.useUtils();
  const { data, isPending } = api.admin.account.getProfile.useQuery();

  const updateEmail = api.admin.account.updateEmail.useMutation({
    onSuccess: async (result) => {
      toast.success("Email updated. Your session was refreshed.");
      emailForm.reset({ newEmail: result.email, currentPassword: "" });
      await utils.admin.account.getProfile.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const updatePassword = api.admin.account.updatePassword.useMutation({
    onSuccess: async () => {
      toast.success("Password updated");
      passwordForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    },
    onError: (e) => toast.error(e.message),
  });

  const emailForm = useForm<AdminUpdateEmailValues>({
    resolver: standardSchemaResolver(adminUpdateEmailSchema),
    defaultValues: { newEmail: "", currentPassword: "" },
    mode: "onTouched",
  });

  const passwordForm = useForm<AdminUpdatePasswordValues>({
    resolver: standardSchemaResolver(adminUpdatePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
    mode: "onTouched",
  });

  const emailFromServer = data?.email;
  useEffect(() => {
    if (emailFromServer == null) return;
    emailForm.reset({
      newEmail: emailFromServer,
      currentPassword: "",
    });
  }, [emailFromServer, emailForm]);

  if (isPending && !data) {
    return <p className="p-8 text-sm text-muted-foreground">Loading…</p>;
  }

  const emailErr = (name: keyof AdminUpdateEmailValues) =>
    emailForm.formState.errors[name]?.message;
  const passErr = (name: keyof AdminUpdatePasswordValues) =>
    passwordForm.formState.errors[name]?.message;

  return (
    <div className="mx-auto max-w-3xl p-8">
      <h1 className="font-heading text-2xl text-foreground">Account</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Change the email and password you use to sign in to the admin CMS.
      </p>

      <section className="mt-10 space-y-6 border-t border-border/60 pt-10">
        <h2 className="font-heading text-lg text-foreground">Email</h2>
        <p className="text-sm text-muted-foreground">
          Current email:{" "}
          <span className="font-medium text-foreground">{data?.email ?? "—"}</span>
        </p>
        <form
          className="space-y-6"
          onSubmit={emailForm.handleSubmit((values) => updateEmail.mutate(values))}
        >
          <div className="space-y-2">
            <Label htmlFor="newEmail">New email</Label>
            <Input
              id="newEmail"
              type="email"
              autoComplete="email"
              className="bg-background"
              aria-invalid={emailErr("newEmail") ? true : undefined}
              aria-describedby={emailErr("newEmail") ? "newEmail-error" : undefined}
              {...emailForm.register("newEmail")}
            />
            <FormFieldError id="newEmail-error" message={emailErr("newEmail")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emailCurrentPassword">Current password</Label>
            <Input
              id="emailCurrentPassword"
              type="password"
              autoComplete="current-password"
              className="bg-background"
              aria-invalid={emailErr("currentPassword") ? true : undefined}
              aria-describedby={emailErr("currentPassword") ? "emailCurrentPw-error" : undefined}
              {...emailForm.register("currentPassword")}
            />
            <FormFieldError id="emailCurrentPw-error" message={emailErr("currentPassword")} />
          </div>
          <Button type="submit" disabled={updateEmail.isPending}>
            Update email
          </Button>
        </form>
      </section>

      <section className="mt-12 space-y-6 border-t border-border/60 pt-10">
        <h2 className="font-heading text-lg text-foreground">Password</h2>
        <form
          className="space-y-6"
          onSubmit={passwordForm.handleSubmit((values) => updatePassword.mutate(values))}
        >
          <div className="space-y-2">
            <Label htmlFor="pwCurrent">Current password</Label>
            <Input
              id="pwCurrent"
              type="password"
              autoComplete="current-password"
              className="bg-background"
              aria-invalid={passErr("currentPassword") ? true : undefined}
              aria-describedby={passErr("currentPassword") ? "pwCurrent-error" : undefined}
              {...passwordForm.register("currentPassword")}
            />
            <FormFieldError id="pwCurrent-error" message={passErr("currentPassword")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pwNew">New password</Label>
            <Input
              id="pwNew"
              type="password"
              autoComplete="new-password"
              className="bg-background"
              aria-invalid={passErr("newPassword") ? true : undefined}
              aria-describedby={passErr("newPassword") ? "pwNew-error" : undefined}
              {...passwordForm.register("newPassword")}
            />
            <FormFieldError id="pwNew-error" message={passErr("newPassword")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pwConfirm">Confirm new password</Label>
            <Input
              id="pwConfirm"
              type="password"
              autoComplete="new-password"
              className="bg-background"
              aria-invalid={passErr("confirmPassword") ? true : undefined}
              aria-describedby={passErr("confirmPassword") ? "pwConfirm-error" : undefined}
              {...passwordForm.register("confirmPassword")}
            />
            <FormFieldError id="pwConfirm-error" message={passErr("confirmPassword")} />
          </div>
          <Button type="submit" disabled={updatePassword.isPending}>
            Update password
          </Button>
        </form>
      </section>
    </div>
  );
}
