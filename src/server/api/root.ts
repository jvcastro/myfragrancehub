import { createTRPCRouter } from "@/server/api/trpc";
import { appRouter as coreRouter } from "@/server/api/routers/_app";
import { blogRouter } from "@/server/api/routers/blog";
import { brandRouter } from "@/server/api/routers/brand";
import { categoryRouter } from "@/server/api/routers/category";
import { productRouter } from "@/server/api/routers/product";
import { settingsRouter } from "@/server/api/routers/settings";
import { adminRouter } from "@/server/api/routers/admin";

export const appRouter = createTRPCRouter({
  app: coreRouter,
  product: productRouter,
  category: categoryRouter,
  brand: brandRouter,
  blog: blogRouter,
  settings: settingsRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
