import { prisma } from "@/lib/db/client";
import { deriveStockStatus } from "@/lib/stock";

const LOW_STOCK_THRESHOLD = 5;

export async function getDashboardStats() {
  const [orderCount, productCount, lowStockCount, pendingOrders, revenueAgg] =
    await Promise.all([
      prisma.order.count(),
      prisma.product.count(),
      prisma.inventory.count({
        where: { quantity: { lte: LOW_STOCK_THRESHOLD } },
      }),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.aggregate({
        where: { paymentStatus: "PAID" },
        _sum: { total: true },
      }),
    ]);

  return {
    orderCount,
    productCount,
    lowStockCount,
    pendingOrders,
    revenue: Number(revenueAgg._sum.total ?? 0),
  };
}

export async function getRecentOrders(limit = 8) {
  return prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      orderNumber: true,
      customerName: true,
      total: true,
      status: true,
      paymentStatus: true,
      createdAt: true,
    },
  });
}

const VALID_PRODUCT_SORT_FIELDS = ["name", "type", "status", "createdAt", "price"];
const VALID_ORDER_SORT_FIELDS = ["orderNumber", "customerName", "total", "status", "paymentStatus", "createdAt"];
const VALID_INVENTORY_SORT_FIELDS = ["quantity", "updatedAt"];

function parseSortParam(sort: string, validFields: string[]) {
  const [sortField, sortDir] = sort.split("-");
  if (validFields.includes(sortField)) {
    return { [sortField]: sortDir === "asc" ? "asc" as const : "desc" as const };
  }
  return { createdAt: "desc" as const };
}

export function buildProductWhere({
  q = "",
  status,
  type,
}: {
  q?: string;
  status?: string;
  type?: string;
} = {}) {
  const where: Record<string, unknown> = {};
  if (q) where.OR = [{ name: { contains: q, mode: "insensitive" } }, { slug: { contains: q, mode: "insensitive" } }];
  if (status) where.status = status;
  if (type) where.type = type;
  return where;
}

export async function getAdminProducts({
  page = 1,
  q = "",
  status,
  type,
  sort = "createdAt-desc",
  pageSize = 25,
}: {
  page?: number;
  q?: string;
  status?: string;
  type?: string;
  sort?: string;
  pageSize?: number;
}) {
  const where = buildProductWhere({ q, status, type });

  const orderBy = parseSortParam(sort, VALID_PRODUCT_SORT_FIELDS);
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { variants: { include: { inventory: true } } },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      type: p.type,
      status: p.status,
      price: Number(p.variants[0]?.price ?? 0),
      variants: p.variants.length,
      stock: Math.min(...p.variants.map((v) => v.inventory?.quantity ?? 0)),
    })),
    total,
    currentPage: page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getOrders({
  page = 1,
  status,
  paymentStatus,
  sort = "createdAt-desc",
  pageSize = 25,
}: {
  page?: number;
  status?: string;
  paymentStatus?: string;
  sort?: string;
  pageSize?: number;
}) {
  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (paymentStatus) where.paymentStatus = paymentStatus;

  const orderBy = parseSortParam(sort, VALID_ORDER_SORT_FIELDS);
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true, orderNumber: true, customerName: true, paymentMethod: true,
        total: true, status: true, paymentStatus: true, createdAt: true,
      },
    }),
    prisma.order.count({ where }),
  ]);
  return { orders, total, currentPage: page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getHeroSlidesAdmin() {
  return prisma.heroSlide.findMany({
    orderBy: { position: "asc" },
  });
}

export async function getInventory({
  page = 1,
  q = "",
  sort = "updatedAt-desc",
  pageSize = 25,
}: {
  page?: number;
  q?: string;
  sort?: string;
  pageSize?: number;
}) {
  const where = q
    ? { OR: [{ variant: { sku: { contains: q, mode: "insensitive" as const } } }, { variant: { product: { name: { contains: q, mode: "insensitive" as const } } } }] }
    : {};

  const orderBy = parseSortParam(sort, VALID_INVENTORY_SORT_FIELDS) as Record<string, "asc" | "desc">;
  const [rows, total] = await Promise.all([
    prisma.inventory.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { variant: { include: { product: true } } },
    }),
    prisma.inventory.count({ where }),
  ]);
  return {
    rows: rows.map((row) => ({
      variantId: row.variantId,
      sku: row.variant.sku,
      productName: row.variant.product.name,
      variantName: row.variant.name,
      quantity: row.quantity,
      lowStockAt: row.lowStockAt,
      status: deriveStockStatus(row.quantity, row.lowStockAt),
    })),
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    currentPage: page,
    pageSize,
  };
}


export interface DashboardSales {
  byType: { type: string; revenue: number }[];
  byDay: { date: string; revenue: number }[];
  byAuthor: { id: string; name: string; revenue: number }[];
  byDayType: { date: string; type: string; revenue: number }[];
  byDayAuthor: { date: string; authorId: string; authorName: string; revenue: number }[];
}

export async function getDashboardSales(days = 90): Promise<DashboardSales> {
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  since.setHours(0, 0, 0, 0);

  const orders = await prisma.order.findMany({
    where: {
      paymentStatus: "PAID",
      createdAt: { gte: since },
    },
    select: {
      createdAt: true,
      items: {
        select: {
          quantity: true,
          unitPrice: true,
          variant: {
            select: {
              product: {
                select: {
                  type: true,
                  authors: {
                    select: { author: { select: { id: true, name: true } } },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  const types = ["LIGHT_NOVEL", "MANGA", "MERCH"] as const;
  const byType = types.map((type) => ({ type, revenue: 0 }));
  const typeMap = new Map(byType.map((t) => [t.type, t]));

  const dayMap = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    dayMap.set(d.toISOString().slice(0, 10), 0);
  }

  const byAuthor = new Map<string, { id: string; name: string; revenue: number }>();
  const byDayType = new Map<string, number>();
  const byDayAuthor = new Map<string, number>();

  for (const order of orders) {
    const dayKey = order.createdAt?.toISOString().slice(0, 10);
    for (const item of order.items) {
      const revenue = Number(item.unitPrice ?? 0) * item.quantity;
      const product = item.variant?.product;
      if (product?.type && typeMap.has(product.type)) {
        typeMap.get(product.type)!.revenue += revenue;
        const dtKey = `${dayKey}:${product.type}`;
        byDayType.set(dtKey, (byDayType.get(dtKey) ?? 0) + revenue);
      }
      if (dayKey && dayMap.has(dayKey)) {
        dayMap.set(dayKey, dayMap.get(dayKey)! + revenue);
      }
      for (const { author } of product?.authors ?? []) {
        const existing =
          byAuthor.get(author.id) ??
          { id: author.id, name: author.name, revenue: 0 };
        existing.revenue += revenue;
        byAuthor.set(author.id, existing);
        const daKey = `${dayKey}:${author.id}`;
        byDayAuthor.set(daKey, (byDayAuthor.get(daKey) ?? 0) + revenue);
      }
    }
  }

  const byDay = [...dayMap.entries()].map(([date, revenue]) => ({ date, revenue }));
  const byAuthorArr = [...byAuthor.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  const byDayTypeArr = [...byDayType.entries()].map(([key, revenue]) => {
    const [date, type] = key.split(":");
    return { date, type, revenue };
  });

  const byDayAuthorArr = [...byDayAuthor.entries()].map(([key, revenue]) => {
    const [date, authorId] = key.split(":");
    const author = byAuthor.get(authorId);
    return { date, authorId, authorName: author?.name ?? "", revenue };
  });

  return { byType, byDay, byAuthor: byAuthorArr, byDayType: byDayTypeArr, byDayAuthor: byDayAuthorArr };
}

export async function deleteOldOrders(olderThanDays = 90) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - olderThanDays);
  cutoff.setHours(0, 0, 0, 0);

  const oldOrders = await prisma.order.findMany({
    where: { createdAt: { lt: cutoff } },
    select: {
      id: true,
      items: {
        select: {
          variantId: true,
          quantity: true,
        },
      },
    },
  });

  if (oldOrders.length === 0) {
    return { deleted: 0, salesRestored: 0 };
  }

  const variantSalesDelta = new Map<string, number>();
  for (const order of oldOrders) {
    for (const item of order.items) {
      if (item.variantId) {
        variantSalesDelta.set(
          item.variantId,
          (variantSalesDelta.get(item.variantId) ?? 0) + item.quantity,
        );
      }
    }
  }

  await prisma.order.deleteMany({
    where: { createdAt: { lt: cutoff } },
  });

  let salesRestored = 0;
  for (const [variantId, qty] of variantSalesDelta) {
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      select: { productId: true },
    });
    if (variant) {
      await prisma.product.update({
        where: { id: variant.productId },
        data: { lifetimeSales: { decrement: qty } },
      });
      salesRestored += qty;
    }
  }

  return { deleted: oldOrders.length, salesRestored };
}