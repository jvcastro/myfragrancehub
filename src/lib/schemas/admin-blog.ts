import { z } from "zod";

import { optionalHttpUrl, routeSlugSchema } from "@/lib/form-schemas";

export const blogWriteSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  slug: routeSlugSchema,
  excerpt: z.string().trim().max(500),
  content: z.string().trim().min(1, "Content is required").max(200_000),
  coverImage: optionalHttpUrl,
  isPublished: z.boolean(),
  seoTitle: z.string().trim().max(200),
  seoDescription: z.string().trim().max(500),
});

export type BlogFormValues = z.infer<typeof blogWriteSchema>;
