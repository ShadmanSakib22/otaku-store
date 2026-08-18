// prisma/seed.ts

import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { hash } from "bcryptjs";
import {
  PrismaClient,
  ProductStatus,
  ProductType,
  AdminRole,
} from "../src/generated/prisma/client";

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting database seed...");

  // ============================================================
  // CLEAN DATABASE
  // ============================================================

  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.cashPickupDetails.deleteMany();
  await prisma.orderShippingAddress.deleteMany();
  await prisma.order.deleteMany();

  await prisma.inventory.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.bookMetadata.deleteMany();

  await prisma.productGenre.deleteMany();
  await prisma.productAuthor.deleteMany();

  await prisma.product.deleteMany();
  await prisma.author.deleteMany();
  await prisma.publisher.deleteMany();
  await prisma.genre.deleteMany();
  await prisma.category.deleteMany();

  await prisma.heroSlide.deleteMany();
  await prisma.adminUser.deleteMany();

  // ============================================================
  // ADMIN
  // ============================================================

  const adminPassword = await hash("Admin123!", 12);
  const demoPassword = await hash("Demo123!", 12);

  await prisma.adminUser.createMany({
    data: [
      {
        name: "Store Administrator",
        email: "admin@example.com",
        passwordHash: adminPassword,
        role: AdminRole.ADMIN,
      },
      {
        name: "Demo Administrator",
        email: "demo@example.com",
        passwordHash: demoPassword,
        role: AdminRole.DEMO_ADMIN,
      },
    ],
  });

  // ============================================================
  // CATEGORIES
  // ============================================================

  const manga = await prisma.category.create({
    data: {
      name: "Manga",
      slug: "manga",
      description:
        "Japanese manga across action, adventure, fantasy, romance and more.",
    },
  });

  const lightNovel = await prisma.category.create({
    data: {
      name: "Light Novels",
      slug: "light-novels",
      description:
        "Japanese light novels featuring popular series and original stories.",
    },
  });

  const merch = await prisma.category.create({
    data: {
      name: "Merchandise",
      slug: "merchandise",
      description:
        "Figures, clothing, accessories and collectibles from popular series.",
    },
  });

  // ============================================================
  // GENRES
  // ============================================================

  const genreData = [
    ["Action", "action"],
    ["Adventure", "adventure"],
    ["Comedy", "comedy"],
    ["Drama", "drama"],
    ["Fantasy", "fantasy"],
    ["Horror", "horror"],
    ["Romance", "romance"],
    ["Sci-Fi", "sci-fi"],
    ["Slice of Life", "slice-of-life"],
    ["Mystery", "mystery"],
    ["Psychological", "psychological"],
    ["Supernatural", "supernatural"],
    ["Sports", "sports"],
    ["Isekai", "isekai"],
  ];

  const genres: Record<string, { id: string }> = {};

  for (const [name, slug] of genreData) {
    genres[slug] = await prisma.genre.create({
      data: {
        name,
        slug,
      },
    });
  }

  // ============================================================
  // AUTHORS
  // ============================================================

  const oda = await prisma.author.create({
    data: {
      name: "Eiichiro Oda",
      slug: "eiichiro-oda",
      bio: "Creator of One Piece.",
    },
  });

  const isayama = await prisma.author.create({
    data: {
      name: "Hajime Isayama",
      slug: "hajime-isayama",
      bio: "Creator of Attack on Titan.",
    },
  });

  const fujimoto = await prisma.author.create({
    data: {
      name: "Tatsuki Fujimoto",
      slug: "tatsuki-fujimoto",
      bio: "Creator of Chainsaw Man.",
    },
  });

  const horikoshi = await prisma.author.create({
    data: {
      name: "Kohei Horikoshi",
      slug: "kohei-horikoshi",
      bio: "Creator of My Hero Academia.",
    },
  });

  const akutami = await prisma.author.create({
    data: {
      name: "Gege Akutami",
      slug: "gege-akutami",
      bio: "Creator of Jujutsu Kaisen.",
    },
  });

  const isekaiAuthor = await prisma.author.create({
    data: {
      name: "Fictional Author",
      slug: "fictional-author",
      bio: "Demo author used for the portfolio catalogue.",
    },
  });

  // ============================================================
  // PUBLISHERS
  // ============================================================

  const shueisha = await prisma.publisher.create({
    data: {
      name: "Shueisha",
      slug: "shueisha",
      website: "https://www.shueisha.co.jp/",
    },
  });

  const kodansha = await prisma.publisher.create({
    data: {
      name: "Kodansha",
      slug: "kodansha",
      website: "https://www.kodansha.co.jp/",
    },
  });

  const demoPublisher = await prisma.publisher.create({
    data: {
      name: "Demo Publishing",
      slug: "demo-publishing",
    },
  });

  // ============================================================
  // HELPERS
  // ============================================================

  async function createBook({
    name,
    slug,
    type,
    categoryId,
    publisherId,
    authorIds,
    genreSlugs,
    volume,
    isbn,
    price,
    stock,
    lifetimeSales,
    image,
    releaseDate,
  }: {
    name: string;
    slug: string;
    type: ProductType;
    categoryId: string;
    publisherId: string;
    authorIds: string[];
    genreSlugs: string[];
    volume: number;
    isbn: string;
    price: number;
    stock: number;
    lifetimeSales: number;
    image: string;
    releaseDate: Date;
  }) {
    return prisma.product.create({
      data: {
        name,
        slug,
        type,
        status: ProductStatus.ACTIVE,

        summary: `A demo ${type === ProductType.MANGA ? "manga" : "light novel"} volume for the portfolio store.`,
        description:
          "This is demonstration catalogue data created specifically for the open-source ecommerce project.",

        categoryId,
        publisherId,

        releaseDate,
        lifetimeSales,
        price,

        bookMetadata: {
          create: {
            volume,
            isbn,
            language: "Japanese",
            pageCount: type === ProductType.MANGA ? 192 : 280,
            releaseDate,
          },
        },

        images: {
          create: [
            {
              url: image,
              alt: name,
              position: 0,
            },
            {
              url: image,
              alt: `${name} alternate view`,
              position: 1,
            },
          ],
        },

        variants: {
          create: {
            name: "Standard Edition",
            sku: `SKU-${slug.toUpperCase().replace(/-/g, "-")}`,
            price,
            inventory: {
              create: {
                quantity: stock,
                lowStockAt: 5,
              },
            },
          },
        },

        authors: {
          create: authorIds.map((authorId) => ({
            authorId,
          })),
        },

        genres: {
          create: genreSlugs.map((genreSlug) => ({
            genreId: genres[genreSlug].id,
          })),
        },
      },
    });
  }

  async function createMerch({
    name,
    slug,
    genreSlugs,
    price,
    stock,
    lifetimeSales,
    image,
    sizes,
    colors,
  }: {
    name: string;
    slug: string;
    genreSlugs: string[];
    price: number;
    stock: number;
    lifetimeSales: number;
    image: string;
    sizes: string[];
    colors: string[];
  }) {
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        type: ProductType.MERCH,
        status: ProductStatus.ACTIVE,

        summary: "Official-style merchandise for the demo ecommerce catalogue.",
        description:
          "Demo merchandise product used to demonstrate product variants, inventory management and ecommerce filtering.",

        categoryId: merch.id,

        lifetimeSales,
        price,

        images: {
          create: [
            {
              url: image,
              alt: name,
              position: 0,
            },
            {
              url: image,
              alt: `${name} alternate view`,
              position: 1,
            },
          ],
        },

        genres: {
          create: genreSlugs.map((genreSlug) => ({
            genreId: genres[genreSlug].id,
          })),
        },
      },
    });

    for (const size of sizes) {
      for (const color of colors) {
        const variantName = `${size} / ${color}`;

        await prisma.productVariant.create({
          data: {
            productId: product.id,
            name: variantName,
            sku: `MERCH-${slug.toUpperCase()}-${size}-${color
              .toUpperCase()
              .replace(/\s/g, "-")}`,
            price,
            size,
            color,

            inventory: {
              create: {
                quantity: stock,
                lowStockAt: 5,
              },
            },
          },
        });
      }
    }

    return product;
  }

  // ============================================================
  // MANGA
  // ============================================================

  const mangaProducts = [
    {
      name: "One Piece Vol. 1",
      slug: "one-piece-volume-1",
      publisherId: shueisha.id,
      authorIds: [oda.id],
      genreSlugs: ["action", "adventure", "comedy"],
      volume: 1,
      isbn: "9784088725093",
      price: 550,
      stock: 32,
      lifetimeSales: 1842,
      image: "https://placehold.co/800x1200/png?text=One+Piece+Vol.+1",
    },
    {
      name: "One Piece Vol. 2",
      slug: "one-piece-volume-2",
      publisherId: shueisha.id,
      authorIds: [oda.id],
      genreSlugs: ["action", "adventure", "comedy"],
      volume: 2,
      isbn: "9784088725444",
      price: 550,
      stock: 25,
      lifetimeSales: 1640,
      image: "https://placehold.co/800x1200/png?text=One+Piece+Vol.+2",
    },
    {
      name: "One Piece Vol. 3",
      slug: "one-piece-volume-3",
      publisherId: shueisha.id,
      authorIds: [oda.id],
      genreSlugs: ["action", "adventure", "comedy"],
      volume: 3,
      isbn: "9784088725697",
      price: 550,
      stock: 21,
      lifetimeSales: 1510,
      image: "https://placehold.co/800x1200/png?text=One+Piece+Vol.+3",
    },
    {
      name: "Attack on Titan Vol. 1",
      slug: "attack-on-titan-volume-1",
      publisherId: kodansha.id,
      authorIds: [isayama.id],
      genreSlugs: ["action", "drama", "horror"],
      volume: 1,
      isbn: "9784063842760",
      price: 550,
      stock: 18,
      lifetimeSales: 2105,
      image: "https://placehold.co/800x1200/png?text=Attack+on+Titan+Vol.+1",
    },
    {
      name: "Attack on Titan Vol. 2",
      slug: "attack-on-titan-volume-2",
      publisherId: kodansha.id,
      authorIds: [isayama.id],
      genreSlugs: ["action", "drama", "horror"],
      volume: 2,
      isbn: "9784063843385",
      price: 550,
      stock: 16,
      lifetimeSales: 1890,
      image: "https://placehold.co/800x1200/png?text=Attack+on+Titan+Vol.+2",
    },
    {
      name: "Chainsaw Man Vol. 1",
      slug: "chainsaw-man-volume-1",
      publisherId: shueisha.id,
      authorIds: [fujimoto.id],
      genreSlugs: ["action", "horror", "comedy"],
      volume: 1,
      isbn: "9784088817804",
      price: 550,
      stock: 28,
      lifetimeSales: 2380,
      image: "https://placehold.co/800x1200/png?text=Chainsaw+Man+Vol.+1",
    },
    {
      name: "Chainsaw Man Vol. 2",
      slug: "chainsaw-man-volume-2",
      publisherId: shueisha.id,
      authorIds: [fujimoto.id],
      genreSlugs: ["action", "horror", "comedy"],
      volume: 2,
      isbn: "9784088818313",
      price: 550,
      stock: 20,
      lifetimeSales: 2015,
      image: "https://placehold.co/800x1200/png?text=Chainsaw+Man+Vol.+2",
    },
    {
      name: "My Hero Academia Vol. 1",
      slug: "my-hero-academia-volume-1",
      publisherId: shueisha.id,
      authorIds: [horikoshi.id],
      genreSlugs: ["action", "comedy", "adventure"],
      volume: 1,
      isbn: "9784088801146",
      price: 550,
      stock: 24,
      lifetimeSales: 1720,
      image: "https://placehold.co/800x1200/png?text=My+Hero+Academia+Vol.+1",
    },
    {
      name: "Jujutsu Kaisen Vol. 1",
      slug: "jujutsu-kaisen-volume-1",
      publisherId: shueisha.id,
      authorIds: [akutami.id],
      genreSlugs: ["action", "horror", "supernatural"],
      volume: 1,
      isbn: "9784088815164",
      price: 550,
      stock: 31,
      lifetimeSales: 2520,
      image: "https://placehold.co/800x1200/png?text=Jujutsu+Kaisen+Vol.+1",
    },
  ];

  for (const book of mangaProducts) {
    await createBook({
      ...book,
      type: ProductType.MANGA,
      categoryId: manga.id,
      releaseDate: new Date("2025-01-01"),
    });
  }

  // ============================================================
  // LIGHT NOVELS
  // ============================================================

  const lightNovelProducts = [
    {
      name: "Re:Zero Vol. 1",
      slug: "re-zero-volume-1",
      publisherId: demoPublisher.id,
      authorIds: [isekaiAuthor.id],
      genreSlugs: ["fantasy", "isekai", "drama"],
      volume: 1,
      isbn: "9780000000001",
      price: 880,
      stock: 14,
      lifetimeSales: 1240,
      image: "https://placehold.co/800x1200/png?text=Re%3AZero+Vol.+1",
    },
    {
      name: "Re:Zero Vol. 2",
      slug: "re-zero-volume-2",
      publisherId: demoPublisher.id,
      authorIds: [isekaiAuthor.id],
      genreSlugs: ["fantasy", "isekai", "drama"],
      volume: 2,
      isbn: "9780000000002",
      price: 880,
      stock: 12,
      lifetimeSales: 1080,
      image: "https://placehold.co/800x1200/png?text=Re%3AZero+Vol.+2",
    },
    {
      name: "The Rising Hero Vol. 1",
      slug: "the-rising-hero-volume-1",
      publisherId: demoPublisher.id,
      authorIds: [isekaiAuthor.id],
      genreSlugs: ["fantasy", "action", "isekai"],
      volume: 1,
      isbn: "9780000000003",
      price: 920,
      stock: 18,
      lifetimeSales: 920,
      image: "https://placehold.co/800x1200/png?text=The+Rising+Hero+Vol.+1",
    },
    {
      name: "Moonlit Academy Vol. 1",
      slug: "moonlit-academy-volume-1",
      publisherId: demoPublisher.id,
      authorIds: [isekaiAuthor.id],
      genreSlugs: ["fantasy", "romance", "slice-of-life"],
      volume: 1,
      isbn: "9780000000004",
      price: 850,
      stock: 22,
      lifetimeSales: 840,
      image: "https://placehold.co/800x1200/png?text=Moonlit+Academy+Vol.+1",
    },
    {
      name: "Cyber Tokyo Vol. 1",
      slug: "cyber-tokyo-volume-1",
      publisherId: demoPublisher.id,
      authorIds: [isekaiAuthor.id],
      genreSlugs: ["sci-fi", "action", "psychological"],
      volume: 1,
      isbn: "9780000000005",
      price: 980,
      stock: 9,
      lifetimeSales: 730,
      image: "https://placehold.co/800x1200/png?text=Cyber+Tokyo+Vol.+1",
    },
  ];

  for (const book of lightNovelProducts) {
    await createBook({
      ...book,
      type: ProductType.LIGHT_NOVEL,
      categoryId: lightNovel.id,
      releaseDate: new Date("2025-03-01"),
    });
  }

  // ============================================================
  // MERCH
  // ============================================================

  await createMerch({
    name: "Jujutsu Sorcerer Hoodie",
    slug: "jujutsu-sorcerer-hoodie",
    genreSlugs: ["action"],
    price: 7800,
    stock: 12,
    lifetimeSales: 620,
    image: "https://placehold.co/800x800/png?text=Jujutsu+Hoodie",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black"],
  });

  await createMerch({
    name: "Pirate Crew T-Shirt",
    slug: "pirate-crew-tshirt",
    genreSlugs: ["action", "adventure"],
    price: 4200,
    stock: 20,
    lifetimeSales: 910,
    image: "https://placehold.co/800x800/png?text=Pirate+Crew+T-Shirt",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "White"],
  });

  await createMerch({
    name: "Anime Character Figure",
    slug: "anime-character-figure",
    genreSlugs: ["action", "fantasy"],
    price: 12500,
    stock: 7,
    lifetimeSales: 340,
    image: "https://placehold.co/800x800/png?text=Character+Figure",
    sizes: ["Standard"],
    colors: ["Default"],
  });

  await createMerch({
    name: "Manga Collector Tote Bag",
    slug: "manga-collector-tote-bag",
    genreSlugs: ["comedy", "slice-of-life"],
    price: 2800,
    stock: 30,
    lifetimeSales: 510,
    image: "https://placehold.co/800x800/png?text=Collector+Tote+Bag",
    sizes: ["Standard"],
    colors: ["Black", "White"],
  });

  // ============================================================
  // HERO SLIDES
  // ============================================================

  await prisma.heroSlide.createMany({
    data: [
      {
        title: "Discover Your Next Adventure",
        subtitle:
          "Explore manga, light novels and collectibles from your favorite worlds.",
        imageUrl: "https://placehold.co/1600x700/png?text=New+Arrivals",
        ctaText: "Shop New Arrivals",
        ctaUrl: "/search?sort=newest",
        position: 0,
        isActive: true,
      },
      {
        title: "Manga Collection",
        subtitle: "Build your shelf volume by volume.",
        imageUrl: "https://placehold.co/1600x700/png?text=Manga+Collection",
        ctaText: "Browse Manga",
        ctaUrl: "/manga",
        position: 1,
        isActive: true,
      },
      {
        title: "Light Novel Collection",
        subtitle: "Stories that take you beyond the page.",
        imageUrl: "https://placehold.co/1600x700/png?text=Light+Novels",
        ctaText: "Browse Light Novels",
        ctaUrl: "/light-novels",
        position: 2,
        isActive: true,
      },
      {
        title: "Collect Something Special",
        subtitle: "Figures, clothing and accessories for your collection.",
        imageUrl: "https://placehold.co/1600x700/png?text=Merchandise",
        ctaText: "Browse Merchandise",
        ctaUrl: "/merchandise",
        position: 3,
        isActive: true,
      },
    ],
  });

  console.log("✅ Database seed completed.");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:");
    console.error(error);

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
