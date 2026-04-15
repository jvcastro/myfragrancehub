import { z } from "zod";

/** Admin account → `admin.account.updateEmail` input. */
export const adminUpdateEmailSchema = z.object({
  newEmail: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email address")
    .transform((s) => s.toLowerCase()),
  currentPassword: z.string().min(1, "Current password is required"),
});

export type AdminUpdateEmailValues = z.infer<typeof adminUpdateEmailSchema>;

/** Admin account → `admin.account.updatePassword` input. */
export const adminUpdatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Use at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type AdminUpdatePasswordValues = z.infer<typeof adminUpdatePasswordSchema>;
