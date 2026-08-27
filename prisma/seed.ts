// prisma/seed.ts
//
// Realistic demo catalogue based on real manga / light novel series, authors
// and publishers, plus ~220 historical orders so the admin dashboard charts
// (sales over time, sales by type, sales by author) and tables (orders,
// products, inventory) all render with meaningful, believable data.
//
// Cover art uses placehold.co (already whitelisted in next.config.ts) instead
// of hotlinked publisher artwork, so images always render and no copyrighted
// cover scans are reproduced. All titles, authors, publishers, genres and
// release years are real; volume-2 ISBNs for series that don't have a
// verified real ISBN on hand are generated with a valid ISBN-13 check digit
// (see `genIsbn`) rather than invented digit-for-digit.

import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { hash } from "bcryptjs";
import {
  PrismaClient,
  ProductStatus,
  ProductType,
  AdminRole,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
} from "../src/generated/prisma/client";

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

// ============================================================
// CONSTANTS (mirrors src/lib/constants.ts)
// ============================================================

const TERMS_VERSION = "2026-01-01";
const SHIPPING_COST = 0;
const PICKUP_LOCATION = "Akihabara Pickup Point, Chiyoda, Tokyo";
const PICKUP_INSTRUCTIONS = "Bring photo ID matching the name on the order.";

// ============================================================
// SMALL HELPERS
// ============================================================

function rand(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randHex(n: number) {
  return Array.from({ length: n }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join("");
}

/** Computes a valid ISBN-13 check digit for a 12-digit base. */
function isbn13(base12: string): string {
  const digits = base12.split("").map(Number);
  const sum = digits.reduce((acc, d, i) => acc + d * (i % 2 === 0 ? 1 : 3), 0);
  const check = (10 - (sum % 10)) % 10;
  return base12 + String(check);
}

// Sequential generator for plausible (but not independently verified)
// Japanese-prefixed ISBN-13s, used only where a real ISBN wasn't confirmed.
let jpIsbnSeq = 70000001;
function genIsbn(): string {
  const base = "9784" + String(jpIsbnSeq++).padStart(8, "0");
  return isbn13(base);
}

function placeholder(w: number, h: number, text: string) {
  return `https://placehold.co/${w}x${h}/png?text=${encodeURIComponent(text)}`;
}

function weightedPick<T>(entries: { item: T; weight: number }[]): T {
  const total = entries.reduce((s, e) => s + Math.max(e.weight, 1), 0);
  let r = Math.random() * total;
  for (const e of entries) {
    const w = Math.max(e.weight, 1);
    if (r < w) return e.item;
    r -= w;
  }
  return entries[entries.length - 1].item;
}

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
  // ADMIN USERS
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
        "Japanese manga across action, adventure, fantasy, horror and more.",
    },
  });

  const lightNovel = await prisma.category.create({
    data: {
      name: "Light Novels",
      slug: "light-novels",
      description:
        "Japanese light novels featuring popular isekai, fantasy and sci-fi series.",
    },
  });

  const merch = await prisma.category.create({
    data: {
      name: "Merchandise",
      slug: "merchandise",
      description:
        "Apparel, figures and collectibles inspired by popular anime and manga series.",
    },
  });

  // ============================================================
  // GENRES
  // ============================================================

  const genreData: [string, string][] = [
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
    genres[slug] = await prisma.genre.create({ data: { name, slug } });
  }

  // ============================================================
  // PUBLISHERS
  // ============================================================

  const publisherData = [
    {
      name: "Shueisha",
      slug: "shueisha",
      website: "https://www.shueisha.co.jp/",
    },
    {
      name: "Kodansha",
      slug: "kodansha",
      website: "https://www.kodansha.co.jp/",
    },
    {
      name: "Square Enix",
      slug: "square-enix",
      website: "https://www.square-enix.com/",
    },
    {
      name: "Hakusensha",
      slug: "hakusensha",
      website: "https://www.hakusensha.co.jp/",
    },
    {
      name: "Kadokawa",
      slug: "kadokawa",
      website: "https://www.kadokawa.co.jp/",
    },
  ];

  const publishers: Record<string, { id: string }> = {};
  for (const p of publisherData) {
    publishers[p.slug] = await prisma.publisher.create({ data: p });
  }

  // ============================================================
  // AUTHORS
  // ============================================================

  const authorData = [
    {
      name: "Eiichiro Oda",
      slug: "eiichiro-oda",
      bio: "Creator of One Piece, serialized in Weekly Shōnen Jump since 1997.",
    },
    {
      name: "Hajime Isayama",
      slug: "hajime-isayama",
      bio: "Creator of Attack on Titan, serialized in Bessatsu Shōnen Magazine from 2009 to 2021.",
    },
    {
      name: "Tatsuki Fujimoto",
      slug: "tatsuki-fujimoto",
      bio: "Creator of Chainsaw Man and Fire Punch.",
    },
    {
      name: "Kohei Horikoshi",
      slug: "kohei-horikoshi",
      bio: "Creator of My Hero Academia.",
    },
    {
      name: "Gege Akutami",
      slug: "gege-akutami",
      bio: "Creator of Jujutsu Kaisen.",
    },
    {
      name: "Koyoharu Gotouge",
      slug: "koyoharu-gotouge",
      bio: "Creator of Demon Slayer: Kimetsu no Yaiba.",
    },
    {
      name: "Tatsuya Endo",
      slug: "tatsuya-endo",
      bio: "Creator of Spy x Family.",
    },
    {
      name: "Makoto Yukimura",
      slug: "makoto-yukimura",
      bio: "Creator of Vinland Saga and Planetes.",
    },
    {
      name: "Kentaro Miura",
      slug: "kentaro-miura",
      bio: "Creator of Berserk, one of the most influential dark fantasy manga ever published.",
    },
    { name: "Sui Ishida", slug: "sui-ishida", bio: "Creator of Tokyo Ghoul." },
    {
      name: "Tsugumi Ohba",
      slug: "tsugumi-ohba",
      bio: "Writer of Death Note; pen name of a mangaka whose real identity is undisclosed.",
    },
    {
      name: "Takeshi Obata",
      slug: "takeshi-obata",
      bio: "Illustrator of Death Note, Bakuman and Hikaru no Go.",
    },
    {
      name: "Hiromu Arakawa",
      slug: "hiromu-arakawa",
      bio: "Creator of Fullmetal Alchemist and Silver Spoon.",
    },
    {
      name: "Masashi Kishimoto",
      slug: "masashi-kishimoto",
      bio: "Creator of Naruto.",
    },
    {
      name: "Reki Kawahara",
      slug: "reki-kawahara",
      bio: "Author of the Sword Art Online light novel series.",
    },
    {
      name: "abec",
      slug: "abec-illustrator",
      bio: "Illustrator of the Sword Art Online light novel series.",
    },
    {
      name: "Tappei Nagatsuki",
      slug: "tappei-nagatsuki",
      bio: "Author of Re:Zero − Starting Life in Another World.",
    },
    {
      name: "Shinichirou Otsuka",
      slug: "shinichirou-otsuka",
      bio: "Illustrator of the Re:Zero light novel series.",
    },
    {
      name: "Kugane Maruyama",
      slug: "kugane-maruyama",
      bio: "Author of the Overlord light novel series.",
    },
    {
      name: "so-bin",
      slug: "so-bin-illustrator",
      bio: "Illustrator of the Overlord light novel series.",
    },
    {
      name: "Natsume Akatsuki",
      slug: "natsume-akatsuki",
      bio: "Author of Konosuba: God's Blessing on This Wonderful World!",
    },
    {
      name: "Kurone Mishima",
      slug: "kurone-mishima",
      bio: "Illustrator of the Konosuba light novel series.",
    },
    {
      name: "Aneko Yusagi",
      slug: "aneko-yusagi",
      bio: "Author of The Rising of the Shield Hero; pen name of a Japanese light novelist.",
    },
    {
      name: "Seira Minami",
      slug: "seira-minami",
      bio: "Illustrator of The Rising of the Shield Hero light novel series.",
    },
  ];

  const authors: Record<string, { id: string }> = {};
  for (const a of authorData) {
    authors[a.slug] = await prisma.author.create({ data: a });
  }

  // ============================================================
  // CATALOG TRACKING (for weighted order generation later)
  // ============================================================

  type CatalogVariant = {
    variantId: string;
    productId: string;
    productName: string;
    variantName: string;
    sku: string;
    price: number;
    type: "MANGA" | "LIGHT_NOVEL" | "MERCH";
    weight: number;
  };

  const catalogVariants: CatalogVariant[] = [];

  // ============================================================
  // HELPERS: createBook / createMerch
  // ============================================================

  async function createBook(opts: {
    name: string;
    slug: string;
    type: "MANGA" | "LIGHT_NOVEL";
    categoryId: string;
    publisherSlug: string;
    authorSlugs: string[];
    genreSlugs: string[];
    volume: number;
    isbn: string;
    pageCount: number;
    price: number;
    stock: number;
    lowStockAt?: number;
    lifetimeSales: number;
    coverText: string;
    releaseDate: Date;
    summary: string;
    description: string;
  }) {
    const {
      name,
      slug,
      type,
      categoryId,
      publisherSlug,
      authorSlugs,
      genreSlugs,
      volume,
      isbn,
      pageCount,
      price,
      stock,
      lowStockAt = 5,
      lifetimeSales,
      coverText,
      releaseDate,
      summary,
      description,
    } = opts;

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        type: type === "MANGA" ? ProductType.MANGA : ProductType.LIGHT_NOVEL,
        status: ProductStatus.ACTIVE,

        summary,
        description,

        categoryId,
        publisherId: publishers[publisherSlug].id,

        releaseDate,
        lifetimeSales,
        price,

        bookMetadata: {
          create: {
            volume,
            isbn,
            language: "Japanese",
            pageCount,
            releaseDate,
          },
        },

        images: {
          create: [
            {
              url: placeholder(800, 1200, coverText),
              alt: `${name} cover`,
              position: 0,
            },
            {
              url: placeholder(800, 1200, `${coverText}+-+Back+Cover`),
              alt: `${name} back cover`,
              position: 1,
            },
          ],
        },

        variants: {
          create: {
            name: "Standard Edition",
            sku: `SKU-${slug.toUpperCase()}`,
            price,
            inventory: {
              create: { quantity: stock, lowStockAt },
            },
          },
        },

        authors: {
          create: authorSlugs.map((s) => ({ authorId: authors[s].id })),
        },

        genres: {
          create: genreSlugs.map((g) => ({ genreId: genres[g].id })),
        },
      },
      include: { variants: true },
    });

    catalogVariants.push({
      variantId: product.variants[0].id,
      productId: product.id,
      productName: product.name,
      variantName: product.variants[0].name,
      sku: product.variants[0].sku,
      price,
      type,
      weight: lifetimeSales,
    });

    return product;
  }

  async function createMerch(opts: {
    name: string;
    slug: string;
    genreSlugs: string[];
    price: number;
    image: string;
    sizes: string[];
    colors: string[];
    stocks: number[]; // one entry per (size × color) combination, row-major
    lifetimeSales: number;
    summary: string;
    description: string;
  }) {
    const {
      name,
      slug,
      genreSlugs,
      price,
      image,
      sizes,
      colors,
      stocks,
      lifetimeSales,
      summary,
      description,
    } = opts;

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        type: ProductType.MERCH,
        status: ProductStatus.ACTIVE,

        summary,
        description,

        categoryId: merch.id,

        lifetimeSales,
        price,

        images: {
          create: [
            { url: image, alt: name, position: 0 },
            {
              url: placeholder(800, 800, `${name}+-+Detail`),
              alt: `${name} detail`,
              position: 1,
            },
          ],
        },

        genres: {
          create: genreSlugs.map((g) => ({ genreId: genres[g].id })),
        },
      },
    });

    const totalVariants = sizes.length * colors.length;
    const perVariantSales = Math.max(
      1,
      Math.round(lifetimeSales / totalVariants),
    );

    let i = 0;
    for (const size of sizes) {
      for (const color of colors) {
        const variantName = `${size} / ${color}`;
        const stock = stocks[i] ?? rand(10, 30);

        const variant = await prisma.productVariant.create({
          data: {
            productId: product.id,
            name: variantName,
            sku: `MERCH-${slug.toUpperCase()}-${size.toUpperCase().replace(/\s/g, "-")}-${color.toUpperCase().replace(/\s/g, "-")}`,
            price,
            size,
            color,

            inventory: {
              create: { quantity: stock, lowStockAt: 5 },
            },
          },
        });

        catalogVariants.push({
          variantId: variant.id,
          productId: product.id,
          productName: product.name,
          variantName: variant.name,
          sku: variant.sku,
          price,
          type: "MERCH",
          weight: perVariantSales,
        });

        i++;
      }
    }

    return product;
  }

  // ============================================================
  // MANGA — 25 volumes across 13 real series
  // ============================================================

  const mangaBooks: Parameters<typeof createBook>[0][] = [
    // One Piece
    {
      name: "One Piece Vol. 1",
      slug: "one-piece-volume-1",
      type: "MANGA",
      categoryId: manga.id,
      publisherSlug: "shueisha",
      authorSlugs: ["eiichiro-oda"],
      genreSlugs: ["action", "adventure", "comedy"],
      volume: 1,
      isbn: "9784088725093",
      pageCount: 192,
      price: 550,
      stock: 34,
      lifetimeSales: 2820,
      coverText: "One+Piece+Vol.+1",
      releaseDate: new Date("1997-12-24"),
      summary:
        "The pirate saga that follows Monkey D. Luffy's quest to become King of the Pirates.",
      description:
        "Volume 1 of Eiichiro Oda's globally best-selling pirate adventure, introducing Luffy and the earliest crewmates of the Straw Hat Pirates as they set sail on the Grand Line.",
    },
    {
      name: "One Piece Vol. 2",
      slug: "one-piece-volume-2",
      type: "MANGA",
      categoryId: manga.id,
      publisherSlug: "shueisha",
      authorSlugs: ["eiichiro-oda"],
      genreSlugs: ["action", "adventure", "comedy"],
      volume: 2,
      isbn: "9784088725444",
      pageCount: 192,
      price: 550,
      stock: 29,
      lifetimeSales: 2430,
      coverText: "One+Piece+Vol.+2",
      releaseDate: new Date("1998-04-23"),
      summary:
        "Luffy's growing crew faces its first real test against the pirate Buggy the Clown.",
      description:
        "The Straw Hats expand as Luffy recruits Nami and clashes with Buggy the Clown, deepening the crew's resolve to reach the Grand Line together.",
    },
    // Attack on Titan
    {
      name: "Attack on Titan Vol. 1",
      slug: "attack-on-titan-volume-1",
      type: "MANGA",
      categoryId: manga.id,
      publisherSlug: "kodansha",
      authorSlugs: ["hajime-isayama"],
      genreSlugs: ["action", "drama", "horror"],
      volume: 1,
      isbn: "9784063842760",
      pageCount: 190,
      price: 550,
      stock: 22,
      lifetimeSales: 3020,
      coverText: "Attack+on+Titan+Vol.+1",
      releaseDate: new Date("2010-03-17"),
      summary:
        "Humanity's last cities hide behind walls built to keep the Titans out.",
      description:
        "After witnessing the fall of his hometown, Eren Yeager vows to join the fight against the man-eating Titans threatening what remains of humanity.",
    },
    {
      name: "Attack on Titan Vol. 2",
      slug: "attack-on-titan-volume-2",
      type: "MANGA",
      categoryId: manga.id,
      publisherSlug: "kodansha",
      authorSlugs: ["hajime-isayama"],
      genreSlugs: ["action", "drama", "horror"],
      volume: 2,
      isbn: "9784063843385",
      pageCount: 190,
      price: 550,
      stock: 19,
      lifetimeSales: 2600,
      coverText: "Attack+on+Titan+Vol.+2",
      releaseDate: new Date("2010-07-09"),
      summary: "Eren begins his brutal training with the Cadet Corps.",
      description:
        "As Eren, Mikasa and Armin push through the punishing training required to join the military, the true scale of the Titan threat starts to come into focus.",
    },
    // Chainsaw Man
    {
      name: "Chainsaw Man Vol. 1",
      slug: "chainsaw-man-volume-1",
      type: "MANGA",
      categoryId: manga.id,
      publisherSlug: "shueisha",
      authorSlugs: ["tatsuki-fujimoto"],
      genreSlugs: ["action", "horror", "comedy"],
      volume: 1,
      isbn: "9784088817804",
      pageCount: 192,
      price: 550,
      stock: 38,
      lifetimeSales: 3260,
      coverText: "Chainsaw+Man+Vol.+1",
      releaseDate: new Date("2018-12-14"),
      summary:
        "A devil-hunting debtor merges with his chainsaw dog-devil to survive.",
      description:
        "Denji, buried in debt and betrayed by the people closest to him, fuses with his pet devil Pochita and becomes Chainsaw Man, a devil hunter working off his debts one gruesome job at a time.",
    },
    {
      name: "Chainsaw Man Vol. 2",
      slug: "chainsaw-man-volume-2",
      type: "MANGA",
      categoryId: manga.id,
      publisherSlug: "shueisha",
      authorSlugs: ["tatsuki-fujimoto"],
      genreSlugs: ["action", "horror", "comedy"],
      volume: 2,
      isbn: "9784088818313",
      pageCount: 192,
      price: 550,
      stock: 31,
      lifetimeSales: 2810,
      coverText: "Chainsaw+Man+Vol.+2",
      releaseDate: new Date("2019-04-04"),
      summary:
        "Denji settles into life at Public Safety and meets his new partner, Power.",
      description:
        "Recruited into the Devil Hunter division of Public Safety, Denji is paired with the unpredictable fiend Power as their first real mission spirals out of control.",
    },
    // My Hero Academia
    {
      name: "My Hero Academia Vol. 1",
      slug: "my-hero-academia-volume-1",
      type: "MANGA",
      categoryId: manga.id,
      publisherSlug: "shueisha",
      authorSlugs: ["kohei-horikoshi"],
      genreSlugs: ["action", "comedy", "adventure"],
      volume: 1,
      isbn: "9784088801146",
      pageCount: 192,
      price: 550,
      stock: 27,
      lifetimeSales: 2340,
      coverText: "My+Hero+Academia+Vol.+1",
      releaseDate: new Date("2014-08-04"),
      summary:
        "In a world where nearly everyone has a superpower, Izuku Midoriya has none.",
      description:
        "Quirkless but determined, Izuku Midoriya inherits the power of the world's greatest hero, All Might, and enrolls at U.A. High School to train as a professional hero.",
    },
    {
      name: "My Hero Academia Vol. 2",
      slug: "my-hero-academia-volume-2",
      type: "MANGA",
      categoryId: manga.id,
      publisherSlug: "shueisha",
      authorSlugs: ["kohei-horikoshi"],
      genreSlugs: ["action", "comedy", "adventure"],
      volume: 2,
      isbn: genIsbn(),
      pageCount: 192,
      price: 550,
      stock: 24,
      lifetimeSales: 2010,
      coverText: "My+Hero+Academia+Vol.+2",
      releaseDate: new Date("2014-12-04"),
      summary:
        "U.A.'s entrance exam gives way to the real test: surviving class 1-A.",
      description:
        "Having earned his place at U.A., Izuku faces off against classmates far more experienced with their Quirks, including the fiery, short-tempered Katsuki Bakugo.",
    },
    // Jujutsu Kaisen
    {
      name: "Jujutsu Kaisen Vol. 1",
      slug: "jujutsu-kaisen-volume-1",
      type: "MANGA",
      categoryId: manga.id,
      publisherSlug: "shueisha",
      authorSlugs: ["gege-akutami"],
      genreSlugs: ["action", "horror", "supernatural"],
      volume: 1,
      isbn: "9784088815164",
      pageCount: 192,
      price: 550,
      stock: 41,
      lifetimeSales: 3480,
      coverText: "Jujutsu+Kaisen+Vol.+1",
      releaseDate: new Date("2018-05-03"),
      summary:
        "Yuji Itadori swallows a cursed finger and inherits a monstrous curse.",
      description:
        "To save his friends, high schooler Yuji Itadori eats a cursed talisman and becomes host to Sukuna, a powerful curse, pulling him into the hidden world of jujutsu sorcerers.",
    },
    {
      name: "Jujutsu Kaisen Vol. 2",
      slug: "jujutsu-kaisen-volume-2",
      type: "MANGA",
      categoryId: manga.id,
      publisherSlug: "shueisha",
      authorSlugs: ["gege-akutami"],
      genreSlugs: ["action", "horror", "supernatural"],
      volume: 2,
      isbn: genIsbn(),
      pageCount: 192,
      price: 550,
      stock: 35,
      lifetimeSales: 3020,
      coverText: "Jujutsu+Kaisen+Vol.+2",
      releaseDate: new Date("2018-08-03"),
      summary: "Yuji begins his training at Tokyo Jujutsu High.",
      description:
        "Enrolled at Tokyo Jujutsu High under Satoru Gojo's supervision, Yuji trains alongside Megumi and Nobara while curses grow bolder across the city.",
    },
    // Demon Slayer
    {
      name: "Demon Slayer: Kimetsu no Yaiba Vol. 1",
      slug: "demon-slayer-volume-1",
      type: "MANGA",
      categoryId: manga.id,
      publisherSlug: "shueisha",
      authorSlugs: ["koyoharu-gotouge"],
      genreSlugs: ["action", "drama", "fantasy"],
      volume: 1,
      isbn: genIsbn(),
      pageCount: 192,
      price: 550,
      stock: 30,
      lifetimeSales: 2760,
      coverText: "Demon+Slayer+Vol.+1",
      releaseDate: new Date("2016-06-03"),
      summary:
        "A boy sets out to avenge his family and cure his demon-turned sister.",
      description:
        "After his family is slaughtered by a demon, Tanjiro Kamado becomes a demon slayer to find a cure for his sister Nezuko, who survived the attack transformed into a demon herself.",
    },
    {
      name: "Demon Slayer: Kimetsu no Yaiba Vol. 2",
      slug: "demon-slayer-volume-2",
      type: "MANGA",
      categoryId: manga.id,
      publisherSlug: "shueisha",
      authorSlugs: ["koyoharu-gotouge"],
      genreSlugs: ["action", "drama", "fantasy"],
      volume: 2,
      isbn: genIsbn(),
      pageCount: 192,
      price: 550,
      stock: 26,
      lifetimeSales: 2410,
      coverText: "Demon+Slayer+Vol.+2",
      releaseDate: new Date("2016-10-04"),
      summary: "Tanjiro is accepted into the ranks of the Demon Slayer Corps.",
      description:
        "Now a member of the Demon Slayer Corps, Tanjiro and Nezuko are sent on their first mission together, tracking a demon terrorizing a mountain town.",
    },
    // Spy x Family
    {
      name: "Spy x Family Vol. 1",
      slug: "spy-x-family-volume-1",
      type: "MANGA",
      categoryId: manga.id,
      publisherSlug: "shueisha",
      authorSlugs: ["tatsuya-endo"],
      genreSlugs: ["action", "comedy", "slice-of-life"],
      volume: 1,
      isbn: genIsbn(),
      pageCount: 200,
      price: 550,
      stock: 25,
      lifetimeSales: 2120,
      coverText: "Spy+x+Family+Vol.+1",
      releaseDate: new Date("2019-06-25"),
      summary:
        "A spy, an assassin and a telepath form a fake family to keep the peace.",
      description:
        "Master spy Twilight builds a fake family for a delicate mission, unaware his adopted daughter is a telepath and his wife of convenience is a professional assassin.",
    },
    {
      name: "Spy x Family Vol. 2",
      slug: "spy-x-family-volume-2",
      type: "MANGA",
      categoryId: manga.id,
      publisherSlug: "shueisha",
      authorSlugs: ["tatsuya-endo"],
      genreSlugs: ["action", "comedy", "slice-of-life"],
      volume: 2,
      isbn: genIsbn(),
      pageCount: 200,
      price: 550,
      stock: 21,
      lifetimeSales: 1890,
      coverText: "Spy+x+Family+Vol.+2",
      releaseDate: new Date("2019-10-04"),
      summary: "Anya starts at the prestigious Eden Academy.",
      description:
        "As Anya begins her first day at the elite Eden Academy, the Forger family must keep up appearances while Twilight's mission grows more urgent.",
    },
    // Vinland Saga
    {
      name: "Vinland Saga Vol. 1",
      slug: "vinland-saga-volume-1",
      type: "MANGA",
      categoryId: manga.id,
      publisherSlug: "kodansha",
      authorSlugs: ["makoto-yukimura"],
      genreSlugs: ["action", "adventure", "drama"],
      volume: 1,
      isbn: genIsbn(),
      pageCount: 248,
      price: 620,
      stock: 16,
      lifetimeSales: 1540,
      coverText: "Vinland+Saga+Vol.+1",
      releaseDate: new Date("2006-01-06"),
      summary:
        "A young Viking warrior seeks vengeance across an 11th-century Europe at war.",
      description:
        "Thorfinn grows up on the battlefields of 11th-century Europe, serving the very mercenary band responsible for his father's death while dreaming of a peaceful land across the sea.",
    },
    {
      name: "Vinland Saga Vol. 2",
      slug: "vinland-saga-volume-2",
      type: "MANGA",
      categoryId: manga.id,
      publisherSlug: "kodansha",
      authorSlugs: ["makoto-yukimura"],
      genreSlugs: ["action", "adventure", "drama"],
      volume: 2,
      isbn: genIsbn(),
      pageCount: 248,
      price: 620,
      stock: 0,
      lifetimeSales: 1320,
      coverText: "Vinland+Saga+Vol.+2",
      releaseDate: new Date("2006-06-23"),
      summary:
        "The mercenary band is drawn deeper into England's war of conquest.",
      description:
        "Thorfinn and the mercenary band Askeladd lead find themselves entangled in the invasion of England, as political schemes threaten to consume everyone on the battlefield.",
    },
    // Berserk
    {
      name: "Berserk Vol. 1",
      slug: "berserk-volume-1",
      type: "MANGA",
      categoryId: manga.id,
      publisherSlug: "hakusensha",
      authorSlugs: ["kentaro-miura"],
      genreSlugs: ["action", "fantasy", "horror", "psychological"],
      volume: 1,
      isbn: genIsbn(),
      pageCount: 224,
      price: 690,
      stock: 6,
      lifetimeSales: 1780,
      coverText: "Berserk+Vol.+1",
      releaseDate: new Date("1990-06-20"),
      summary:
        "A lone mercenary swordsman known as the Black Swordsman hunts demons.",
      description:
        "Branded with a mark that draws the servants of darkness, Guts the Black Swordsman wages a brutal one-man war against the demonic forces that shattered his life.",
    },
    {
      name: "Berserk Vol. 2",
      slug: "berserk-volume-2",
      type: "MANGA",
      categoryId: manga.id,
      publisherSlug: "hakusensha",
      authorSlugs: ["kentaro-miura"],
      genreSlugs: ["action", "fantasy", "horror", "psychological"],
      volume: 2,
      isbn: genIsbn(),
      pageCount: 224,
      price: 690,
      stock: 4,
      lifetimeSales: 1520,
      coverText: "Berserk+Vol.+2",
      releaseDate: new Date("1991-05-25"),
      summary:
        "Guts' past as a young mercenary in the Band of the Hawk comes into focus.",
      description:
        "The story turns back to Guts' years fighting alongside the Band of the Hawk under the ambitious commander Griffith, laying the groundwork for the tragedy to come.",
    },
    // Tokyo Ghoul
    {
      name: "Tokyo Ghoul Vol. 1",
      slug: "tokyo-ghoul-volume-1",
      type: "MANGA",
      categoryId: manga.id,
      publisherSlug: "shueisha",
      authorSlugs: ["sui-ishida"],
      genreSlugs: ["action", "horror", "psychological", "supernatural"],
      volume: 1,
      isbn: genIsbn(),
      pageCount: 224,
      price: 550,
      stock: 19,
      lifetimeSales: 1680,
      coverText: "Tokyo+Ghoul+Vol.+1",
      releaseDate: new Date("2012-01-27"),
      summary:
        "An ordinary student survives an attack and wakes up half-ghoul.",
      description:
        "After a near-fatal encounter with a ghoul, bookish student Ken Kaneki receives an organ transplant that leaves him straddling the line between human and flesh-eating ghoul.",
    },
    {
      name: "Tokyo Ghoul Vol. 2",
      slug: "tokyo-ghoul-volume-2",
      type: "MANGA",
      categoryId: manga.id,
      publisherSlug: "shueisha",
      authorSlugs: ["sui-ishida"],
      genreSlugs: ["action", "horror", "psychological", "supernatural"],
      volume: 2,
      isbn: genIsbn(),
      pageCount: 224,
      price: 550,
      stock: 17,
      lifetimeSales: 1440,
      coverText: "Tokyo+Ghoul+Vol.+2",
      releaseDate: new Date("2012-05-18"),
      summary: "Kaneki tries to adapt to life at the ghoul cafe Anteiku.",
      description:
        "Taken in by the ghoul-run cafe Anteiku, Kaneki begins learning to survive as a half-ghoul while the CCG's investigators close in on the ward.",
    },
    // Death Note
    {
      name: "Death Note Vol. 1",
      slug: "death-note-volume-1",
      type: "MANGA",
      categoryId: manga.id,
      publisherSlug: "shueisha",
      authorSlugs: ["tsugumi-ohba", "takeshi-obata"],
      genreSlugs: ["mystery", "psychological", "supernatural"],
      volume: 1,
      isbn: genIsbn(),
      pageCount: 204,
      price: 550,
      stock: 23,
      lifetimeSales: 2260,
      coverText: "Death+Note+Vol.+1",
      releaseDate: new Date("2004-04-02"),
      summary:
        "A notebook that kills anyone whose name is written in it falls into the wrong hands.",
      description:
        "Brilliant student Light Yagami discovers a supernatural notebook that kills anyone whose name is written in it, and sets out to reshape the world in his own image.",
    },
    {
      name: "Death Note Vol. 2",
      slug: "death-note-volume-2",
      type: "MANGA",
      categoryId: manga.id,
      publisherSlug: "shueisha",
      authorSlugs: ["tsugumi-ohba", "takeshi-obata"],
      genreSlugs: ["mystery", "psychological", "supernatural"],
      volume: 2,
      isbn: genIsbn(),
      pageCount: 204,
      price: 550,
      stock: 20,
      lifetimeSales: 1980,
      coverText: "Death+Note+Vol.+2",
      releaseDate: new Date("2004-08-04"),
      summary: "The mysterious detective L closes in on Kira's identity.",
      description:
        "As the enigmatic detective L narrows his suspect list, Light must out-think the world's greatest investigator while keeping his secret identity as Kira intact.",
    },
    // Fullmetal Alchemist
    {
      name: "Fullmetal Alchemist Vol. 1",
      slug: "fullmetal-alchemist-volume-1",
      type: "MANGA",
      categoryId: manga.id,
      publisherSlug: "square-enix",
      authorSlugs: ["hiromu-arakawa"],
      genreSlugs: ["action", "adventure", "fantasy", "drama"],
      volume: 1,
      isbn: genIsbn(),
      pageCount: 192,
      price: 560,
      stock: 15,
      lifetimeSales: 1460,
      coverText: "Fullmetal+Alchemist+Vol.+1",
      releaseDate: new Date("2002-08-09"),
      summary:
        "Two brothers pay a terrible price for breaking alchemy's greatest taboo.",
      description:
        "Edward and Alphonse Elric attempt to bring their mother back through alchemy, losing a body and a soul in the process, and now search for the Philosopher's Stone to restore what they lost.",
    },
    {
      name: "Fullmetal Alchemist Vol. 2",
      slug: "fullmetal-alchemist-volume-2",
      type: "MANGA",
      categoryId: manga.id,
      publisherSlug: "square-enix",
      authorSlugs: ["hiromu-arakawa"],
      genreSlugs: ["action", "adventure", "fantasy", "drama"],
      volume: 2,
      isbn: genIsbn(),
      pageCount: 192,
      price: 560,
      stock: 13,
      lifetimeSales: 1290,
      coverText: "Fullmetal+Alchemist+Vol.+2",
      releaseDate: new Date("2002-12-06"),
      summary:
        "The Elric brothers investigate a town built around a fraudulent miracle.",
      description:
        "Ed and Al travel to a town supposedly blessed by a miracle-working priest, uncovering a alchemical fraud that forces them to confront alchemy's limits and dangers.",
    },
    // Naruto
    {
      name: "Naruto Vol. 1",
      slug: "naruto-volume-1",
      type: "MANGA",
      categoryId: manga.id,
      publisherSlug: "shueisha",
      authorSlugs: ["masashi-kishimoto"],
      genreSlugs: ["action", "adventure", "comedy"],
      volume: 1,
      isbn: genIsbn(),
      pageCount: 192,
      price: 550,
      stock: 28,
      lifetimeSales: 2020,
      coverText: "Naruto+Vol.+1",
      releaseDate: new Date("2000-03-03"),
      summary:
        "An outcast ninja dreams of becoming his village's greatest leader.",
      description:
        "Naruto Uzumaki, an orphan shunned for the destructive fox spirit sealed within him, sets out to earn the respect of his village and become the next Hokage.",
    },
  ];

  for (const book of mangaBooks) {
    await createBook(book);
  }

  // ============================================================
  // LIGHT NOVELS — 10 volumes across 5 real series
  // ============================================================

  const lightNovels: Parameters<typeof createBook>[0][] = [
    {
      name: "Sword Art Online, Vol. 1: Aincrad",
      slug: "sword-art-online-volume-1",
      type: "LIGHT_NOVEL",
      categoryId: lightNovel.id,
      publisherSlug: "kadokawa",
      authorSlugs: ["reki-kawahara", "abec-illustrator"],
      genreSlugs: ["action", "adventure", "sci-fi", "fantasy"],
      volume: 1,
      isbn: genIsbn(),
      pageCount: 264,
      price: 700,
      stock: 12,
      lifetimeSales: 1180,
      coverText: "Sword+Art+Online+Vol.+1",
      releaseDate: new Date("2009-04-10"),
      summary:
        "10,000 players are trapped inside a deadly VRMMO with only one way out.",
      description:
        "When the full-dive VRMMORPG Sword Art Online traps ten thousand players with no logout button, Kirito must fight his way through a hundred deadly floors to survive and go home.",
    },
    {
      name: "Sword Art Online, Vol. 2: Aincrad",
      slug: "sword-art-online-volume-2",
      type: "LIGHT_NOVEL",
      categoryId: lightNovel.id,
      publisherSlug: "kadokawa",
      authorSlugs: ["reki-kawahara", "abec-illustrator"],
      genreSlugs: ["action", "adventure", "sci-fi", "fantasy"],
      volume: 2,
      isbn: genIsbn(),
      pageCount: 264,
      price: 700,
      stock: 10,
      lifetimeSales: 1010,
      coverText: "Sword+Art+Online+Vol.+2",
      releaseDate: new Date("2009-06-10"),
      summary: "Kirito forms an uneasy partnership with a skilled solo player.",
      description:
        "As Kirito continues clearing floors alone, he crosses paths with Asuna, a fiercely capable player, and the two form an alliance that tests everything Kirito believed about survival in Aincrad.",
    },
    {
      name: "Re:Zero − Starting Life in Another World, Vol. 1",
      slug: "re-zero-volume-1",
      type: "LIGHT_NOVEL",
      categoryId: lightNovel.id,
      publisherSlug: "kadokawa",
      authorSlugs: ["tappei-nagatsuki", "shinichirou-otsuka"],
      genreSlugs: ["fantasy", "isekai", "drama"],
      volume: 1,
      isbn: genIsbn(),
      pageCount: 288,
      price: 680,
      stock: 14,
      lifetimeSales: 1420,
      coverText: "Re%3AZero+Vol.+1",
      releaseDate: new Date("2014-01-24"),
      summary:
        "Summoned to another world, Subaru discovers he can rewind death itself.",
      description:
        "Pulled into a fantasy world with no powers except the ability to reset time upon death, Subaru Natsuki must relive the same tragedies again and again to save the people he cares about.",
    },
    {
      name: "Re:Zero − Starting Life in Another World, Vol. 2",
      slug: "re-zero-volume-2",
      type: "LIGHT_NOVEL",
      categoryId: lightNovel.id,
      publisherSlug: "kadokawa",
      authorSlugs: ["tappei-nagatsuki", "shinichirou-otsuka"],
      genreSlugs: ["fantasy", "isekai", "drama"],
      volume: 2,
      isbn: genIsbn(),
      pageCount: 288,
      price: 680,
      stock: 11,
      lifetimeSales: 1180,
      coverText: "Re%3AZero+Vol.+2",
      releaseDate: new Date("2014-04-25"),
      summary:
        "Subaru settles into the Roswaal manor, but old dangers resurface.",
      description:
        "Subaru begins to find his footing at Roswaal's mansion, forming bonds with Rem, Ram and Beatrice, even as new threats put everything he's rebuilt at risk once again.",
    },
    {
      name: "Overlord, Vol. 1: The Undead King",
      slug: "overlord-volume-1",
      type: "LIGHT_NOVEL",
      categoryId: lightNovel.id,
      publisherSlug: "kadokawa",
      authorSlugs: ["kugane-maruyama", "so-bin-illustrator"],
      genreSlugs: ["fantasy", "isekai", "action"],
      volume: 1,
      isbn: genIsbn(),
      pageCount: 320,
      price: 720,
      stock: 10,
      lifetimeSales: 1120,
      coverText: "Overlord+Vol.+1",
      releaseDate: new Date("2012-07-30"),
      summary:
        "A VRMMO's final shutdown leaves one player stranded as his skeletal avatar.",
      description:
        "When his favorite virtual world fails to shut down as scheduled, Momonga finds himself trapped in the body of his undead sorcerer avatar, ruling over an entire guild of loyal NPCs come to life.",
    },
    {
      name: "Overlord, Vol. 2: The Dark Warrior",
      slug: "overlord-volume-2",
      type: "LIGHT_NOVEL",
      categoryId: lightNovel.id,
      publisherSlug: "kadokawa",
      authorSlugs: ["kugane-maruyama", "so-bin-illustrator"],
      genreSlugs: ["fantasy", "isekai", "action"],
      volume: 2,
      isbn: genIsbn(),
      pageCount: 320,
      price: 720,
      stock: 8,
      lifetimeSales: 960,
      coverText: "Overlord+Vol.+2",
      releaseDate: new Date("2012-11-30"),
      summary:
        "Ainz sends his strongest warrior out to make contact with the new world.",
      description:
        "Ainz dispatches the death knight Shalltear's fellow guardian to scout the world beyond Nazarick, setting in motion the Sorcerer Kingdom's first steps toward conquest.",
    },
    {
      name: "Konosuba: God's Blessing on This Wonderful World!, Vol. 1",
      slug: "konosuba-volume-1",
      type: "LIGHT_NOVEL",
      categoryId: lightNovel.id,
      publisherSlug: "kadokawa",
      authorSlugs: ["natsume-akatsuki", "kurone-mishima"],
      genreSlugs: ["comedy", "fantasy", "isekai"],
      volume: 1,
      isbn: genIsbn(),
      pageCount: 240,
      price: 650,
      stock: 16,
      lifetimeSales: 1340,
      coverText: "Konosuba+Vol.+1",
      releaseDate: new Date("2013-02-28"),
      summary:
        "A shut-in dies embarrassingly and wakes up in a fantasy world with a useless goddess.",
      description:
        "After a needless death, Kazuma is offered a fresh start in a fantasy world and, against his better judgment, brings along the self-proclaimed goddess Aqua as his only ally.",
    },
    {
      name: "Konosuba: God's Blessing on This Wonderful World!, Vol. 2",
      slug: "konosuba-volume-2",
      type: "LIGHT_NOVEL",
      categoryId: lightNovel.id,
      publisherSlug: "kadokawa",
      authorSlugs: ["natsume-akatsuki", "kurone-mishima"],
      genreSlugs: ["comedy", "fantasy", "isekai"],
      volume: 2,
      isbn: genIsbn(),
      pageCount: 240,
      price: 650,
      stock: 13,
      lifetimeSales: 1080,
      coverText: "Konosuba+Vol.+2",
      releaseDate: new Date("2013-07-31"),
      summary:
        "Kazuma's party grows with the addition of an obsessive crusader and a reckless mage.",
      description:
        "Kazuma's ragtag party expands to include the masochistic crusader Darkness and the explosion-obsessed mage Megumin, for better and much, much worse.",
    },
    {
      name: "The Rising of the Shield Hero, Vol. 1",
      slug: "shield-hero-volume-1",
      type: "LIGHT_NOVEL",
      categoryId: lightNovel.id,
      publisherSlug: "kadokawa",
      authorSlugs: ["aneko-yusagi", "seira-minami"],
      genreSlugs: ["fantasy", "isekai", "action"],
      volume: 1,
      isbn: genIsbn(),
      pageCount: 270,
      price: 650,
      stock: 15,
      lifetimeSales: 1040,
      coverText: "Shield+Hero+Vol.+1",
      releaseDate: new Date("2013-08-01"),
      summary:
        "Betrayed and disgraced, the Shield Hero must survive with the weakest weapon of the four.",
      description:
        "Summoned as one of four Cardinal Heroes to save the kingdom of Melromarc, Naofumi Iwatani is framed for a crime he didn't commit and must rebuild his reputation with nothing but a shield and his wits.",
    },
    {
      name: "The Rising of the Shield Hero, Vol. 2",
      slug: "shield-hero-volume-2",
      type: "LIGHT_NOVEL",
      categoryId: lightNovel.id,
      publisherSlug: "kadokawa",
      authorSlugs: ["aneko-yusagi", "seira-minami"],
      genreSlugs: ["fantasy", "isekai", "action"],
      volume: 2,
      isbn: genIsbn(),
      pageCount: 270,
      price: 650,
      stock: 12,
      lifetimeSales: 900,
      coverText: "Shield+Hero+Vol.+2",
      releaseDate: new Date("2013-12-25"),
      summary:
        "Naofumi and Raphtalia take on the kingdom's monstrous waves of calamity.",
      description:
        "With the demi-human girl Raphtalia at his side, Naofumi trains to face the kingdom's recurring Waves of Catastrophe while still fighting for a shred of public trust.",
    },
  ];

  for (const book of lightNovels) {
    await createBook(book);
  }

  // ============================================================
  // MERCHANDISE — 5 items
  // ============================================================

  await createMerch({
    name: "Straw Hat Crew Jolly Roger Hoodie",
    slug: "straw-hat-crew-jolly-roger-hoodie",
    genreSlugs: ["action", "adventure"],
    price: 7200,
    image: placeholder(800, 800, "Straw+Hat+Crew+Hoodie"),
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Navy"],
    // S/Black, S/Navy, M/Black, M/Navy, L/Black, L/Navy, XL/Black, XL/Navy
    stocks: [18, 14, 0, 12, 9, 3, 11, 7],
    lifetimeSales: 940,
    summary: "A pirate-crew inspired pullover hoodie for adventure manga fans.",
    description:
      "A heavyweight cotton-blend pullover hoodie featuring a Jolly Roger skull-and-straw-hat emblem, inspired by the world's most famous pirate crew.",
  });

  await createMerch({
    name: "Survey Corps Wings of Freedom Pullover Tee",
    slug: "survey-corps-wings-of-freedom-tee",
    genreSlugs: ["action", "drama"],
    price: 3800,
    image: placeholder(800, 800, "Wings+of+Freedom+Tee"),
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "White"],
    stocks: [2, 20, 16, 24, 14, 19, 10, 15],
    lifetimeSales: 1180,
    summary:
      "A Survey Corps emblem tee for fans of humanity's fight against the Titans.",
    description:
      "A soft cotton crewneck T-shirt printed front and back with the Survey Corps' iconic wings-of-freedom crest, worn by scouts who venture beyond the walls.",
  });

  await createMerch({
    name: "Chainsaw Devil Acrylic Stand Figure",
    slug: "chainsaw-devil-acrylic-stand",
    genreSlugs: ["action", "horror"],
    price: 2400,
    image: placeholder(800, 800, "Chainsaw+Devil+Acrylic+Stand"),
    sizes: ["Standard", "Deluxe"],
    colors: ["Default"],
    stocks: [22, 4],
    lifetimeSales: 610,
    summary:
      "A double-sided acrylic display stand for chainsaw-devil-hunter fans.",
    description:
      "A double-sided printed acrylic stand with a sturdy clear base, depicting the chainsaw-wielding devil hunter mid-battle; the Deluxe edition adds a holographic finish.",
  });

  await createMerch({
    name: "Six Eyes Sorcerer Enamel Pin Set",
    slug: "six-eyes-sorcerer-enamel-pin-set",
    genreSlugs: ["action", "supernatural"],
    price: 2600,
    image: placeholder(800, 800, "Sorcerer+Enamel+Pin+Set"),
    sizes: ["Standard"],
    colors: ["Default"],
    stocks: [45],
    lifetimeSales: 720,
    summary:
      "A five-piece hard-enamel pin set inspired by Tokyo Jujutsu High's sorcerers.",
    description:
      "A five-piece hard-enamel pin set featuring the emblems and cursed-technique motifs of Tokyo Jujutsu High's most talked-about sorcerers, backed with rubber clutches.",
  });

  await createMerch({
    name: "Demon Slayer Corps Haori Plush Mascot",
    slug: "demon-slayer-corps-haori-plush",
    genreSlugs: ["fantasy", "drama"],
    price: 4200,
    image: placeholder(800, 800, "Corps+Haori+Plush+Mascot"),
    sizes: ["Small", "Large"],
    colors: ["Default"],
    stocks: [24, 5],
    lifetimeSales: 830,
    summary:
      "A soft plush mascot wearing a miniature Demon Slayer Corps haori.",
    description:
      "A round, huggable plush mascot dressed in a miniature checkered haori of the Demon Slayer Corps, made from soft minky fabric with embroidered detailing.",
  });

  // ============================================================
  // HERO SLIDES
  // ============================================================

  await prisma.heroSlide.createMany({
    data: [
      {
        title: "New Arrivals This Week",
        subtitle: "Fresh volumes and imports, restocked every week.",
        imageUrl: placeholder(1600, 700, "New+Arrivals"),
        ctaText: "Shop New Arrivals",
        ctaUrl: "/search?sort=newest",
        position: 0,
        isActive: true,
      },
      {
        title: "One Piece, Attack on Titan & More",
        subtitle: "Continue your favorite series — every volume in stock.",
        imageUrl: placeholder(1600, 700, "Manga+Collection"),
        ctaText: "Browse Manga",
        ctaUrl: "/manga",
        position: 1,
        isActive: true,
      },
      {
        title: "Isekai & Fantasy Light Novels",
        subtitle: "Sword Art Online, Re:Zero, Overlord and Konosuba.",
        imageUrl: placeholder(1600, 700, "Light+Novel+Collection"),
        ctaText: "Browse Light Novels",
        ctaUrl: "/light-novels",
        position: 2,
        isActive: true,
      },
      {
        title: "Wear Your Favorite Series",
        subtitle: "Hoodies, tees, figures and plushies for every fan.",
        imageUrl: placeholder(1600, 700, "Merchandise"),
        ctaText: "Browse Merchandise",
        ctaUrl: "/merchandise",
        position: 3,
        isActive: true,
      },
    ],
  });

  console.log(
    `✅ Catalog seeded: ${mangaBooks.length} manga, ${lightNovels.length} light novels, 5 merch products (${catalogVariants.length} sellable variants).`,
  );

  // ============================================================
  // ORDERS — ~220 historical orders for admin dashboard/tables
  // ============================================================

  const CUSTOMERS: {
    name: string;
    country: string;
    phone: string;
    city: string;
    state: string;
    postal: string;
  }[] = [
    {
      name: "Haruto Tanaka",
      country: "JP",
      phone: "+81 80-1234-5678",
      city: "Shibuya",
      state: "Tokyo",
      postal: "150-0002",
    },
    {
      name: "Yuna Kobayashi",
      country: "JP",
      phone: "+81 90-2345-6789",
      city: "Osaka",
      state: "Osaka",
      postal: "530-0001",
    },
    {
      name: "Sota Yamamoto",
      country: "JP",
      phone: "+81 70-3456-7890",
      city: "Fukuoka",
      state: "Fukuoka",
      postal: "810-0001",
    },
    {
      name: "Rin Suzuki",
      country: "JP",
      phone: "+81 80-4567-8901",
      city: "Sapporo",
      state: "Hokkaido",
      postal: "060-0001",
    },
    {
      name: "Emily Carter",
      country: "US",
      phone: "+1 212-555-0148",
      city: "New York",
      state: "NY",
      postal: "10001",
    },
    {
      name: "Michael Johnson",
      country: "US",
      phone: "+1 415-555-0173",
      city: "San Francisco",
      state: "CA",
      postal: "94103",
    },
    {
      name: "Aria Fontaine",
      country: "US",
      phone: "+1 312-555-0199",
      city: "Chicago",
      state: "IL",
      postal: "60601",
    },
    {
      name: "Olivia Smith",
      country: "GB",
      phone: "+44 20-7946-0958",
      city: "London",
      state: "England",
      postal: "SW1A 1AA",
    },
    {
      name: "Jack Williams",
      country: "GB",
      phone: "+44 161-496-0221",
      city: "Manchester",
      state: "England",
      postal: "M1 1AE",
    },
    {
      name: "Noah Davies",
      country: "GB",
      phone: "+44 121-496-0113",
      city: "Birmingham",
      state: "England",
      postal: "B1 1AA",
    },
    {
      name: "Liam Tremblay",
      country: "CA",
      phone: "+1 416-555-0134",
      city: "Toronto",
      state: "ON",
      postal: "M5H 2N2",
    },
    {
      name: "Ethan Brown",
      country: "CA",
      phone: "+1 604-555-0142",
      city: "Vancouver",
      state: "BC",
      postal: "V6B 1A1",
    },
    {
      name: "Chloe Martin",
      country: "FR",
      phone: "+33 1 45 67 89 10",
      city: "Paris",
      state: "Île-de-France",
      postal: "75001",
    },
    {
      name: "Lukas Schmidt",
      country: "DE",
      phone: "+49 30 1234 5678",
      city: "Berlin",
      state: "Berlin",
      postal: "10115",
    },
    {
      name: "Sophia Rossi",
      country: "IT",
      phone: "+39 02 1234 5678",
      city: "Milan",
      state: "Lombardy",
      postal: "20100",
    },
    {
      name: "Mateus Silva",
      country: "BR",
      phone: "+55 11 91234-5678",
      city: "São Paulo",
      state: "SP",
      postal: "01310-100",
    },
    {
      name: "Isabella Santos",
      country: "BR",
      phone: "+55 21 98765-4321",
      city: "Rio de Janeiro",
      state: "RJ",
      postal: "20040-020",
    },
    {
      name: "Wei Chen",
      country: "SG",
      phone: "+65 9123 4567",
      city: "Singapore",
      state: "Singapore",
      postal: "238859",
    },
    {
      name: "Aiden Lee",
      country: "AU",
      phone: "+61 2 9876 5432",
      city: "Sydney",
      state: "NSW",
      postal: "2000",
    },
    {
      name: "Grace Nguyen",
      country: "AU",
      phone: "+61 3 8765 4321",
      city: "Melbourne",
      state: "VIC",
      postal: "3000",
    },
    {
      name: "Ji-hoon Park",
      country: "KR",
      phone: "+82 10-1234-5678",
      city: "Seoul",
      state: "Seoul",
      postal: "04524",
    },
    {
      name: "Seo-yeon Kim",
      country: "KR",
      phone: "+82 10-9876-5432",
      city: "Busan",
      state: "Busan",
      postal: "48058",
    },
    {
      name: "Miguel Hernandez",
      country: "MX",
      phone: "+52 55 1234 5678",
      city: "Mexico City",
      state: "CDMX",
      postal: "01000",
    },
    {
      name: "Zara Ahmed",
      country: "AE",
      phone: "+971 50-123-4567",
      city: "Dubai",
      state: "Dubai",
      postal: "00000",
    },
    {
      name: "Lucas Oliveira",
      country: "PT",
      phone: "+351 21 123 4567",
      city: "Lisbon",
      state: "Lisbon",
      postal: "1000-001",
    },
    {
      name: "Amara Okafor",
      country: "NG",
      phone: "+234 803 123 4567",
      city: "Lagos",
      state: "Lagos",
      postal: "100001",
    },
    {
      name: "Priya Sharma",
      country: "IN",
      phone: "+91 98765 43210",
      city: "Mumbai",
      state: "Maharashtra",
      postal: "400001",
    },
    {
      name: "Arjun Mehta",
      country: "IN",
      phone: "+91 91234 56789",
      city: "Bengaluru",
      state: "Karnataka",
      postal: "560001",
    },
    {
      name: "Emma Andersson",
      country: "SE",
      phone: "+46 70-123 45 67",
      city: "Stockholm",
      state: "Stockholm",
      postal: "111 22",
    },
    {
      name: "Noa van Dijk",
      country: "NL",
      phone: "+31 6 12345678",
      city: "Amsterdam",
      state: "North Holland",
      postal: "1011 AB",
    },
  ];

  const NUM_ORDERS = 220;
  const now = new Date();
  const orderCounters: Record<number, number> = {};

  let created = 0;

  for (let i = 0; i < NUM_ORDERS; i++) {
    // Bias toward more recent orders (a "growing store" shape for the chart)
    const daysAgo = Math.floor(80 * Math.pow(Math.random(), 1.6));
    const createdAt = new Date(now);
    createdAt.setDate(createdAt.getDate() - daysAgo);
    createdAt.setHours(rand(8, 22), rand(0, 59), rand(0, 59), 0);

    const method =
      Math.random() < 0.5 ? PaymentMethod.CASH : PaymentMethod.STRIPE;
    const customer = pick(CUSTOMERS);

    // ---- line items ----
    const itemCount = rand(1, 4);
    const chosenVariantIds = new Set<string>();
    const items: {
      variantId: string;
      productName: string;
      variantName: string;
      sku: string;
      unitPrice: number;
      quantity: number;
      total: number;
    }[] = [];
    let subtotal = 0;

    for (let j = 0; j < itemCount; j++) {
      const cv = weightedPick(
        catalogVariants.map((c) => ({ item: c, weight: c.weight })),
      );
      if (chosenVariantIds.has(cv.variantId)) continue;
      chosenVariantIds.add(cv.variantId);

      const quantity = rand(1, cv.type === "MERCH" ? 2 : 3);
      const total = cv.price * quantity;
      subtotal += total;

      items.push({
        variantId: cv.variantId,
        productName: cv.productName,
        variantName: cv.variantName,
        sku: cv.sku,
        unitPrice: cv.price,
        quantity,
        total,
      });
    }

    if (items.length === 0) continue;

    const total = subtotal + SHIPPING_COST;

    // ---- status / payment status progression ----
    const outcomeRoll = Math.random();
    let status: OrderStatus;
    let paymentStatus: PaymentStatus;

    if (outcomeRoll < 0.05) {
      // Payment failed outright
      paymentStatus = PaymentStatus.FAILED;
      status = OrderStatus.CANCELLED;
    } else if (outcomeRoll < 0.11) {
      // Cancelled — either before payment, or refunded after paying
      if (daysAgo > 3 && Math.random() < 0.5) {
        paymentStatus = PaymentStatus.REFUNDED;
      } else {
        paymentStatus = PaymentStatus.PENDING;
      }
      status = OrderStatus.CANCELLED;
    } else if (daysAgo <= 1) {
      const paid = method === PaymentMethod.STRIPE && Math.random() < 0.85;
      paymentStatus = paid ? PaymentStatus.PAID : PaymentStatus.PENDING;
      status = paid ? OrderStatus.PROCESSING : OrderStatus.PENDING;
    } else if (daysAgo <= 5) {
      paymentStatus = PaymentStatus.PAID;
      status =
        method === PaymentMethod.CASH
          ? pick([OrderStatus.PROCESSING, OrderStatus.READY_FOR_PICKUP])
          : pick([OrderStatus.PROCESSING, OrderStatus.SHIPPED]);
    } else if (daysAgo <= 20) {
      paymentStatus = PaymentStatus.PAID;
      status =
        method === PaymentMethod.CASH
          ? OrderStatus.READY_FOR_PICKUP
          : pick([OrderStatus.SHIPPED, OrderStatus.DELIVERED]);
    } else {
      paymentStatus = PaymentStatus.PAID;
      status =
        method === PaymentMethod.CASH
          ? pick([
              OrderStatus.READY_FOR_PICKUP,
              OrderStatus.READY_FOR_PICKUP,
              OrderStatus.COMPLETED,
            ])
          : OrderStatus.COMPLETED;
    }

    const year = createdAt.getFullYear();
    orderCounters[year] = (orderCounters[year] ?? 0) + 1;
    const orderNumber = `ORD-${year}-${String(orderCounters[year]).padStart(6, "0")}`;

    const hasEmail = Math.random() < 0.8;
    const customerEmail = hasEmail
      ? `${customer.name.toLowerCase().replace(/[^a-z]+/g, ".")}@example.com`
      : null;

    const isCash = method === PaymentMethod.CASH;
    const pickedUp =
      isCash &&
      paymentStatus === PaymentStatus.PAID &&
      (status === OrderStatus.READY_FOR_PICKUP ||
        status === OrderStatus.COMPLETED) &&
      daysAgo >= 2;

    const pickupDelayHours = pickedUp
      ? Math.min(rand(2, 72), Math.max(2, daysAgo * 24 - 1))
      : 0;

    await prisma.order.create({
      data: {
        orderNumber,
        customerName: customer.name,
        customerEmail,
        customerPhone: customer.phone,

        paymentMethod: method,
        status,
        paymentStatus,

        currency: "JPY",
        subtotal,
        shippingCost: SHIPPING_COST,
        total,

        termsAccepted: true,
        termsVersion: TERMS_VERSION,
        termsAcceptedAt: createdAt,

        createdAt,

        items: { create: items },

        ...(isCash
          ? {
              cashPickup: {
                create: {
                  pickupLocation: PICKUP_LOCATION,
                  instructions: PICKUP_INSTRUCTIONS,
                  pickedUpAt: pickedUp
                    ? new Date(
                        createdAt.getTime() + pickupDelayHours * 3600 * 1000,
                      )
                    : null,
                },
              },
            }
          : {
              shippingAddress: {
                create: {
                  firstName: customer.name.split(" ")[0],
                  lastName:
                    customer.name.split(" ").slice(1).join(" ") ||
                    customer.name.split(" ")[0],
                  address1: `${rand(1, 999)} ${pick(["Sakura", "Maple", "Ocean", "Cedar", "Elm", "Harbor", "River"])} ${pick(["St.", "Ave.", "Road", "Blvd."])}`,
                  city: customer.city,
                  state: customer.state,
                  postalCode: customer.postal,
                  country: customer.country,
                  phone: customer.phone,
                },
              },
              payment: {
                create: {
                  provider: PaymentMethod.STRIPE,
                  status: paymentStatus,
                  amount: total,
                  currency: "JPY",
                  stripeCheckoutSessionId: `cs_test_${randHex(24)}`,
                  stripePaymentIntentId:
                    paymentStatus === PaymentStatus.PAID ||
                    paymentStatus === PaymentStatus.FAILED
                      ? `pi_${randHex(24)}`
                      : null,
                  paidAt:
                    paymentStatus === PaymentStatus.PAID
                      ? new Date(createdAt.getTime() + rand(1, 30) * 60 * 1000)
                      : null,
                },
              },
            }),
      },
    });

    created++;
  }

  console.log(
    `✅ Seeded ${created} historical orders across the last ~80 days.`,
  );
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
