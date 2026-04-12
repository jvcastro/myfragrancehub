import { z } from "zod";

import { phpPriceString, routeSlugSchema } from "@/lib/form-schemas";

/** Product form fields (images validated separately in the editor). */
export const productFieldsSchema = z.object({
  name: z.string().trim().min(1, "Product name is required").max(200),
  slug: routeSlugSchema,
  shortDescription: z.string().trim().max(500),
  description: z.string().trim().min(1, "Description is required").max(50_000),
  fragranceNotes: z.string().trim().max(2000),
  price: phpPriceString,
  isSoldOut: z.boolean(),
  isFeatured: z.boolean(),
  seoTitle: z.string().trim().max(200),
  seoDescription: z.string().trim().max(500),
  brandId: z.string().trim().min(1, "Select a brand"),
  categoryId: z.string().trim().min(1, "Select a category"),
});

export type ProductFieldsFormValues = z.infer<typeof productFieldsSchema>;
