import { createTRPCRouter } from "@/server/api/trpc";

import { adminBlogRouter } from "@/server/api/routers/admin/blog";
import { adminBrandRouter } from "@/server/api/routers/admin/brand";
import { adminCategoryRouter } from "@/server/api/routers/admin/category";
import { adminDashboardRouter } from "@/server/api/routers/admin/dashboard";
import { adminProductRouter } from "@/server/api/routers/admin/product";
import { adminSettingsRouter } from "@/server/api/routers/admin/settings";
import { adminUploadRouter } from "@/server/api/routers/admin/upload";

export const adminRouter = createTRPCRouter({
  dashboard: adminDashboardRouter,
  upload: adminUploadRouter,
  product: adminProductRouter,
  category: adminCategoryRouter,
  brand: adminBrandRouter,
  blog: adminBlogRouter,
  settings: adminSettingsRouter,
});
