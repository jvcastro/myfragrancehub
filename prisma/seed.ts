import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import pg from "pg";

import { PrismaClient } from "../src/generated/prisma/client";

function createSeedClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required to run the seed script.");
  }
  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return {
    prisma: new PrismaClient({ adapter }),
    pool,
  };
}

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to seed in production. Set NODE_ENV!=production for local seeding.");
  }

  const { prisma, pool } = createSeedClient();

  try {
    await prisma.productImage.deleteMany();
    await prisma.product.deleteMany();
    await prisma.blogPost.deleteMany();
    await prisma.category.deleteMany();
    await prisma.brand.deleteMany();
    await prisma.adminUser.deleteMany();

    const maison = await prisma.brand.create({
      data: {
        name: "Maison Nocturne",
        slug: "maison-nocturne",
        bio: "Parisian house known for resinous woods and quiet smoke.",
        seoTitle: "Maison Nocturne | My Fragrance Hub",
        seoDescription: "Discover Maison Nocturne compositions at My Fragrance Hub.",
      },
    });

    const lumiere = await prisma.brand.create({
      data: {
        name: "Lumière d’Or",
        slug: "lumiere-dor",
        bio: "Mediterranean citrus meets white florals in sun-warmed compositions.",
        seoTitle: "Lumière d’Or | My Fragrance Hub",
      },
    });

    const atlas = await prisma.brand.create({
      data: {
        name: "Atlas Reserve",
        slug: "atlas-reserve",
        bio: "Spice routes and suede — structured, dry, and deliberate.",
      },
    });

    const catOud = await prisma.category.create({
      data: {
        name: "Oud & Resins",
        slug: "oud-resins",
        description: "Dense woods, amber, and ceremonial depth.",
      },
    });

    const catCitrus = await prisma.category.create({
      data: {
        name: "Citrus & Light",
        slug: "citrus-light",
        description: "Effervescent openings and airy dry-downs.",
      },
    });

    const catFloral = await prisma.category.create({
      data: {
        name: "White Florals",
        slug: "white-florals",
        description: "Gardenia, tuberose, and polished petals.",
      },
    });

    const catLeather = await prisma.category.create({
      data: {
        name: "Leather & Spice",
        slug: "leather-spice",
        description: "Saffron, birch tar, and tailored silhouettes.",
      },
    });

    const img = (path: string) =>
      `https://images.unsplash.com/${path}?auto=format&fit=crop&w=1200&q=80`;

    const products: Array<{
      name: string;
      slug: string;
      shortDescription: string;
      description: string;
      fragranceNotes?: string;
      price: string;
      isSoldOut: boolean;
      isFeatured: boolean;
      brandId: string;
      categoryId: string;
      images: { imageUrl: string; altText: string; sortOrder: number }[];
    }> = [
      {
        name: "Nocturne IV",
        slug: "nocturne-iv",
        shortDescription: "Smoked oud, black tea, and cooled embers on skin.",
        description:
          "A slow-reveal evening scent built around a refined oud accord, softened by black tea and a trace of vanilla resin. Designed for close encounters and long dinners.",
        fragranceNotes: "Oud, black tea, cistus, vanilla resin, cedarwood.",
        price: "21890.00",
        isSoldOut: false,
        isFeatured: true,
        brandId: maison.id,
        categoryId: catOud.id,
        images: [
          {
            imageUrl: img("photo-1541643600914-78b084683601"),
            altText: "Amber glass perfume bottle beside dried botanicals",
            sortOrder: 0,
          },
        ],
      },
      {
        name: "Cuir Solaire",
        slug: "cuir-solaire",
        shortDescription: "Saffron leather over sun-warmed linen.",
        description:
          "Structured saffron and birch tar meet a bright neroli top. The dry-down stays supple — polished leather without heaviness.",
        fragranceNotes: "Saffron, neroli, birch, suede, sandalwood.",
        price: "16950.00",
        isSoldOut: true,
        isFeatured: true,
        brandId: atlas.id,
        categoryId: catLeather.id,
        images: [
          {
            imageUrl: img("photo-1595425970377-c970029bf1e6"),
            altText: "Minimal perfume bottle on neutral stone surface",
            sortOrder: 0,
          },
        ],
      },
      {
        name: "L’Heure Dorée",
        slug: "lheure-doree",
        shortDescription: "Bergamot, neroli, and sheer musk at golden hour.",
        description:
          "An optimistic citrus opening folds into soft musks and pale woods. Made for warm climates and quiet confidence.",
        fragranceNotes: "Bergamot, neroli, petitgrain, white musk, driftwood.",
        price: "12490.00",
        isSoldOut: false,
        isFeatured: true,
        brandId: lumiere.id,
        categoryId: catCitrus.id,
        images: [
          {
            imageUrl: img("photo-1615634260167-c8cdede054de"),
            altText: "Elegant fragrance bottle with soft daylight",
            sortOrder: 0,
          },
        ],
      },
      {
        name: "Tubéreuse Nue",
        slug: "tubereuse-nue",
        shortDescription: "Creamy tuberose with a cool green stem.",
        description:
          "A modern white floral: lush tuberose balanced by green galbanum and a trace of aldehydes. Long-lasting without shouting.",
        fragranceNotes: "Tuberose, galbanum, jasmine, aldehydes, cashmeran.",
        price: "13890.00",
        isSoldOut: false,
        isFeatured: false,
        brandId: lumiere.id,
        categoryId: catFloral.id,
        images: [
          {
            imageUrl: img("photo-1592946935069-a4c7bcb97d22"),
            altText: "Floral arrangement beside a glass perfume bottle",
            sortOrder: 0,
          },
        ],
      },
      {
        name: "Encens Atlas",
        slug: "encens-atlas",
        shortDescription: "Frankincense, cardamom, and dry cedar.",
        description:
          "Ceremonial frankincense lifted by cardamom and grounded in cedar. Linear, meditative, and impeccably dry.",
        fragranceNotes: "Frankincense, cardamom, cedar, myrrh, black pepper.",
        price: "17850.00",
        isSoldOut: false,
        isFeatured: false,
        brandId: atlas.id,
        categoryId: catOud.id,
        images: [
          {
            imageUrl: img("photo-1612817288484-6f916006741a"),
            altText: "Dark glass perfume bottle with botanical accents",
            sortOrder: 0,
          },
        ],
      },
      {
        name: "Velours Minuit",
        slug: "velours-minuit",
        shortDescription: "Violet leaf, iris butter, and cool tonka.",
        description:
          "Powdered iris and violet over a velvet tonka base. Intimate, tailored, and unmistakably French.",
        fragranceNotes: "Violet leaf, orris butter, tonka bean, vetiver, musk.",
        price: "15290.00",
        isSoldOut: false,
        isFeatured: false,
        brandId: maison.id,
        categoryId: catFloral.id,
        images: [
          {
            imageUrl: img("photo-1590736969955-71cc94901144"),
            altText: "Luxury perfume bottle on marble surface",
            sortOrder: 0,
          },
        ],
      },
    ];

    for (const p of products) {
      const { images, ...data } = p;
      await prisma.product.create({
        data: {
          ...data,
          images: { create: images },
        },
      });
    }

    await prisma.blogPost.createMany({
      data: [
        {
          title: "How we curate each bottle",
          slug: "how-we-curate-each-bottle",
          excerpt:
            "A short note on provenance, batch integrity, and why we never rush a release.",
          content:
            "## Behind the shelf\n\nEvery fragrance in our catalog is chosen for composition quality, longevity on skin, and coherence with the rest of the collection. We favor houses that respect materials and avoid disposable trend-chasing.\n\nWhen you inquire, we confirm availability for the specific batch in front of us—no anonymous checkout, no surprises.",
          coverImage: img("photo-1615634260167-c8cdede054de"),
          isPublished: true,
          seoTitle: "How we curate each bottle | My Fragrance Hub",
          seoDescription: "Learn how My Fragrance Hub selects fragrances for the catalog.",
        },
        {
          title: "Inquiries through Messenger",
          slug: "inquiries-through-messenger",
          excerpt: "Why conversation replaces a cart—for you and for the bottles.",
          content:
            "## Personal service\n\nLuxury is rarely one-size-fits-all. We use Messenger so you can ask about skin chemistry, seasonality, and availability before committing.\n\nThere is no online payment on this site by design: each order is confirmed human to human.",
          isPublished: true,
        },
        {
          title: "Draft: Client events and trunk shows",
          slug: "draft-client-events",
          excerpt:
            "Use this draft to announce appointments, new arrivals, or in-person visits before publishing.",
          content:
            "## Draft\n\nReplace this copy in Admin → Blog when you are ready to go live. Unpublished posts never appear on the public Journal.",
          isPublished: false,
        },
      ],
    });

    await prisma.siteSetting.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        brandName: "My Fragrance Hub",
        heroTitle: "Sculpted for those who wear perfume like tailoring",
        heroSubtitle:
          "A private catalog of fine fragrances in Philippine peso (PHP). Discover notes and houses—then inquire for availability; every order is confirmed personally.",
        aboutContent:
          "My Fragrance Hub is a curated storefront for clients who value material quality and calm service. We do not offer anonymous checkout; every inquiry is answered personally.",
        contactEmail: null,
        contactPhone: null,
        address: null,
        facebookMessengerLink: null,
        facebookLink: null,
        instagramLink: null,
        defaultSeoTitle: "My Fragrance Hub | High-end fragrance catalog",
        defaultSeoDescription:
          "Curated luxury fragrances in Philippine peso (PHP). Browse the catalog and inquire for availability—no anonymous checkout.",
      },
      update: {
        brandName: "My Fragrance Hub",
        heroTitle: "Sculpted for those who wear perfume like tailoring",
        heroSubtitle:
          "A private catalog of fine fragrances in Philippine peso (PHP). Discover notes and houses—then inquire for availability; every order is confirmed personally.",
        aboutContent:
          "My Fragrance Hub is a curated storefront for clients who value material quality and calm service. We do not offer anonymous checkout; every inquiry is answered personally.",
        contactEmail: null,
        contactPhone: null,
        address: null,
        facebookMessengerLink: null,
        facebookLink: null,
        instagramLink: null,
        defaultSeoTitle: "My Fragrance Hub | High-end fragrance catalog",
        defaultSeoDescription:
          "Curated luxury fragrances in Philippine peso (PHP). Browse the catalog and inquire for availability—no anonymous checkout.",
      },
    });

    const passwordHash = bcrypt.hashSync("admin123", 12);
    await prisma.adminUser.create({
      data: {
        email: "admin@myfragrancehub.local",
        passwordHash,
        name: "Seed Admin",
      },
    });

    console.log("Seed completed: brands, categories, products, images, blog posts, site settings, admin user.");
    console.log(
      "Local admin: admin@myfragrancehub.local / admin123 — rotate password before any shared demo.",
    );
    console.log(
      "Configure Admin → Site settings: contact email, Messenger URL, and social links (seed leaves these empty).",
    );
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
