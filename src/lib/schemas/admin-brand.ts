import { z } from "zod";

import { optionalHttpUrl, routeSlugSchema } from "@/lib/form-schemas";

/** Admin brand create/update — shared by tRPC and the brand editor form. */
export const brandWriteSchema = z.object({
  name: z.string().trim().min(1, "Brand name is required").max(120),
  slug: routeSlugSchema,
  bio: z.string().trim().max(5000),
  logoUrl: optionalHttpUrl,
  seoTitle: z.string().trim().max(200),
  seoDescription: z.string().trim().max(500),
});

export type BrandFormValues = z.infer<typeof brandWriteSchema>;
