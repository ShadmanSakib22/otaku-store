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

export async function getAdminProducts({
  page = 1,
  q = "",
  status,
  type,
}: {
  page?: number;
  q?: string;
  status?: string;
  type?: string;
}) {
  const where: Record<string, unknown> = {};
  if (q) where.OR = [{ name: { contains: q } }, { slug: { contains: q } }];
  if (status) where.status = status;
  if (type) where.type = type;

  const pageSize = 25;
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
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

export async function getOrders({ page = 1, status, paymentStatus }: { page?: number; status?: string; paymentStatus?: string }) {
  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (paymentStatus) where.paymentStatus = paymentStatus;
  const pageSize = 25;
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
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

export async function getInventory({ page = 1, q = "" }: { page?: number; q?: string }) {
  const where = q
    ? { OR: [{ variant: { sku: { contains: q } } }, { variant: { product: { name: { contains: q } } } }] }
    : {};
  const pageSize = 50;
  const [rows, total] = await Promise.all([
    prisma.inventory.findMany({
      where,
      orderBy: { updatedAt: "desc" },
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
