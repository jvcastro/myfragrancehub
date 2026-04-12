import { z } from "zod";

/** URL path segment: lowercase letters, digits, single hyphens between groups. */
export const routeSlugSchema = z
  .string()
  .trim()
  .min(1, "Slug is required")
  .max(128)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "Use lowercase letters, numbers, and hyphens only (no spaces).",
  });

/** Form field: empty or absolute http(s) URL. */
export const optionalHttpUrl = z.string().trim().superRefine((s, ctx) => {
  if (s === "") return;
  try {
    const u = new URL(s);
    if (u.protocol !== "http:" && u.protocol !== "https:") {
      ctx.addIssue({
        code: "custom",
        message: "URL must use http:// or https://",
      });
    }
  } catch {
    ctx.addIssue({ code: "custom", message: "Invalid URL" });
  }
});

/** Form field: empty or valid email. */
export const optionalEmail = z.string().trim().superRefine((s, ctx) => {
  if (s === "") return;
  const r = z.string().email().safeParse(s);
  if (!r.success) {
    ctx.addIssue({ code: "custom", message: "Invalid email address" });
  }
});

/** Philippine peso amount as decimal string (no thousands separators). */
export const phpPriceString = z
  .string()
  .trim()
  .regex(/^\d+(\.\d{1,2})?$/, "Enter a valid amount (e.g. 1999 or 1299.50)");
