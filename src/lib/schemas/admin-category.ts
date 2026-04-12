import { z } from "zod";

import { routeSlugSchema } from "@/lib/form-schemas";

export const categoryWriteSchema = z.object({
  name: z.string().trim().min(1, "Category name is required").max(120),
  slug: routeSlugSchema,
  description: z.string().trim().max(5000),
  seoTitle: z.string().trim().max(200),
  seoDescription: z.string().trim().max(500),
});

export type CategoryFormValues = z.infer<typeof categoryWriteSchema>;
