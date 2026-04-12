# My Fragrance Hub

Production-ready fragrance catalog and admin CMS: **Next.js 16** (App Router), **TypeScript**, **tRPC**, **Prisma 7**, **PostgreSQL**, **Tailwind CSS v4**, **shadcn/ui**. Prices are shown in **Philippine peso (PHP)**. Public site + **Admin** for catalog, blog, and site copy.

## Prerequisites

- Node.js 20+
- [pnpm](https://pnpm.io/)
- PostgreSQL 14+

## Local setup

```bash
pnpm install
cp .env.example .env
# Set DATABASE_URL, NEXT_PUBLIC_SITE_URL (e.g. http://localhost:3000), AUTH_SECRET (16+ characters)
pnpm db:generate
pnpm db:migrate
pnpm db:seed    # demo catalog + admin (development only; wipes catalog tables)
pnpm dev
```

- Storefront: `NEXT_PUBLIC_SITE_URL` (e.g. [http://localhost:3000](http://localhost:3000))
- Admin: `/admin/login` — after first seed use **admin@myfragrancehub.local** / **admin123**, then change the password and rotate credentials.

After seeding, open **Admin → Site settings** and add contact email, Messenger link, phone, address, and social URLs (the seed leaves these empty so you do not ship fake contact data).

## Production launch checklist

1. **Environment** — Set `DATABASE_URL`, `NEXT_PUBLIC_SITE_URL` (public `https` origin, no trailing slash), and `AUTH_SECRET` (long random secret; min 16 characters).
2. **Migrations** — Run `pnpm db:migrate:deploy` against the production database (see [Deployment](#deployment) below).
3. **Admin user** — Do **not** rely on seed in production (`NODE_ENV=production` blocks it). Create an `AdminUser` with a bcrypt-hashed password (Prisma Studio, SQL, or a one-off script).
4. **Site settings** — Fill brand name, hero, about, SEO defaults, contact email, Messenger URL, and social links in the CMS.
5. **Images** — Replace demo Unsplash URLs in seeded products with your own CDN or uploaded URLs via the admin product editor.
6. **Review** — Unpublish or delete the seeded **draft** blog post when you no longer need it.

## Scripts

| Script | Purpose |
|--------|---------|
| `pnpm dev` | Development server |
| `pnpm build` / `pnpm start` | Production build and server |
| `pnpm lint` | ESLint |
| `pnpm db:generate` | Generate Prisma Client |
| `pnpm db:migrate` | Create/apply migrations (development) |
| `pnpm db:migrate:deploy` | Apply migrations only (production / CI) |
| `pnpm db:seed` | Reseed demo data (development only) |
| `pnpm db:push` | Push schema without migrations (prototyping only) |
| `pnpm db:studio` | Prisma Studio |

## Stack overview

- `src/app/` — Routes, layouts, metadata, SEO (`sitemap.ts`, `robots.ts`)
- `src/components/` — UI, layout, admin editors, product/blog blocks
- `src/config/` — `site.ts` (branding paths), `cms-defaults.ts` (fallback copy)
- `src/lib/` — Prisma, auth, `format-price.ts` (PHP), `site-url.ts` (canonical origin)
- `src/server/api/` — tRPC routers and admin procedures
- `prisma/` — Schema, migrations, `seed.ts`

## Prisma 7

The generated client is under `src/generated/prisma`. This app uses **PrismaPg** + `pg` with `DATABASE_URL`.

If pnpm blocks Prisma engine postinstall scripts: `pnpm approve-builds` for `prisma` and `@prisma/engines`, then `pnpm install` again.

## Deployment

### Environment variables

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (`?sslmode=require` when the host requires TLS). |
| `NEXT_PUBLIC_SITE_URL` | Yes | Public site origin without a trailing slash (metadata, canonicals, sitemap, **server-side tRPC URL**). |
| `AUTH_SECRET` | Yes for `/admin` | Min 16 characters; use the host secret manager. |

### Docker (`standalone`)

```bash
docker build --build-arg DATABASE_URL="postgresql://..." -t myfragrancehub .
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e NEXT_PUBLIC_SITE_URL="https://your-domain.example" \
  -e AUTH_SECRET="your-long-secret-min-16-chars" \
  myfragrancehub
```

The image build must reach a PostgreSQL instance (prerender runs server code that queries the database).

### Vercel (typical)

Set the three variables above, use the default install/build (`postinstall` runs `prisma generate`), and run `pnpm db:migrate:deploy` against production when schema changes.
