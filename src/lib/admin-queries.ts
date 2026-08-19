import { prisma } from "@/lib/db/client";

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
