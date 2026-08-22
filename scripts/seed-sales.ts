import fs from "node:fs"
import path from "node:path"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

function loadEnv() {
  if (process.env.DATABASE_URL) return
  const envPath = path.resolve(process.cwd(), ".env")
  if (!fs.existsSync(envPath)) return
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const idx = trimmed.indexOf("=")
    if (idx === -1) continue
    const key = trimmed.slice(0, idx).trim()
    let value = trimmed.slice(idx + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    process.env[key] = value
  }
}
loadEnv()

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set")
}

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const SEED_ORDER = "SEED-"
const SEED_PRODUCT = "seed-"

const rand = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1))
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

function priceFor(type: string): number {
  if (type === "MERCH") return rand(1500, 5000)
  return rand(400, 1200)
}

async function main() {
  // Clean previous seed data (safe: only our prefixed records)
  const prevOrders = await prisma.order.findMany({
    where: { orderNumber: { startsWith: SEED_ORDER } },
    select: { id: true },
  })
  if (prevOrders.length) {
    await prisma.order.deleteMany({ where: { orderNumber: { startsWith: SEED_ORDER } } })
    console.log(`Removed ${prevOrders.length} previous seed orders`)
  }
  const prevProducts = await prisma.product.findMany({
    where: { slug: { startsWith: SEED_PRODUCT } },
    select: { id: true },
  })
  if (prevProducts.length) {
    await prisma.product.deleteMany({ where: { slug: { startsWith: SEED_PRODUCT } } })
    console.log(`Removed ${prevProducts.length} previous seed products`)
  }

  const authorNames = [
    "Hajime Isayama",
    "Eiichiro Oda",
    "Kohei Horikoshi",
    "Yukito Ayatsuji",
    "Satoshi Ozaki",
    "Kumo Kagyu",
  ]
  const authors = []
  for (const name of authorNames) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
    authors.push(
      await prisma.author.upsert({
        where: { slug },
        update: {},
        create: { name, slug },
      }),
    )
  }

  const category = await prisma.category.upsert({
    where: { slug: "manga-books" },
    update: {},
    create: {
      name: "Manga & Light Novels",
      slug: "manga-books",
      description: "Seed category",
    },
  })

  const typeDefs = [
    { type: "MANGA", names: ["Attack on Titan", "One Piece", "My Hero Academia"] },
    { type: "LIGHT_NOVEL", names: ["Sword Art Online", "Re:Zero", "Overlord"] },
    { type: "MERCH", names: ["Anime Figure Deluxe", "Acrylic Stand", "Poster Collection"] },
  ]

  const products = []
  let sku = 1
  for (const def of typeDefs) {
    for (const name of def.names) {
      const slug = `${SEED_PRODUCT}${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${rand(1000, 9999)}`
      const price = priceFor(def.type)
      const authorSubset = def.type === "MERCH" ? authors.slice(0, 1) : [pick(authors), pick(authors)]
      const product = await prisma.product.create({
        data: {
          name,
          slug,
          type: def.type,
          status: "ACTIVE",
          description: `${name} - high quality ${def.type} product.`,
          categoryId: category.id,
          price,
          authors: {
            create: authorSubset.map((a) => ({ author: { connect: { id: a.id } } })),
          },
          variants: {
            create: [
              {
                name: "Default",
                sku: `SKU-${sku++}`,
                price,
                inventory: { create: { quantity: rand(20, 150), lowStockAt: 5 } },
              },
            ],
          },
        },
        include: { variants: true },
      })
      products.push(product)
    }
  }
  console.log(`Created ${products.length} seed products`)

  const ORDER_COUNT = 45
  const now = new Date()
  for (let i = 0; i < ORDER_COUNT; i++) {
    const daysAgo = rand(0, 29)
    const createdAt = new Date(now)
    createdAt.setDate(now.getDate() - daysAgo)
    createdAt.setHours(rand(0, 23), rand(0, 59), 0, 0)

    const itemCount = rand(1, 3)
    const items = []
    let subtotal = 0
    for (let j = 0; j < itemCount; j++) {
      const product = pick(products)
      const variant = product.variants[0]
      const qty = rand(1, 4)
      const unit = Number(variant.price)
      const lineTotal = unit * qty
      subtotal += lineTotal
      items.push({
        variantId: variant.id,
        productName: product.name,
        variantName: variant.name,
        sku: variant.sku,
        unitPrice: unit,
        quantity: qty,
        total: lineTotal,
      })
    }
    const shipping = 500
    const total = subtotal + shipping
    await prisma.order.create({
      data: {
        orderNumber: `${SEED_ORDER}${i + 1}-${Date.now()}`,
        customerName: `Customer ${i + 1}`,
        customerPhone: "000-000-0000",
        paymentMethod: Math.random() > 0.5 ? "STRIPE" : "CASH",
        status: "COMPLETED",
        paymentStatus: "PAID",
        currency: "JPY",
        subtotal,
        shippingCost: shipping,
        total,
        termsAccepted: true,
        termsVersion: "1.0",
        termsAcceptedAt: createdAt,
        createdAt,
        items: { create: items },
      },
    })
  }
  console.log(`Created ${ORDER_COUNT} seed orders across the last 30 days`)
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
