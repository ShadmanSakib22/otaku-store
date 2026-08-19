import { prisma } from "@/lib/db/client";
import { SHIPPING_COST } from "@/lib/constants";
import { deriveStockStatus } from "@/lib/stock";

export interface CartLine {
  variantId: string;
  sku: string;
  productId: string;
  productSlug: string;
  productName: string;
  variantName: string;
  unitPrice: number;
  quantity: number;
  image: string | null;
  stockStatus: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
}

export async function validateCartItems(
  items: { variantId: string; quantity: number }[]
): Promise<CartLine[]> {
  if (items.length === 0) return [];

  const ids = items.map((item) => item.variantId);
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: ids } },
    include: {
      inventory: true,
      product: { include: { images: { orderBy: { position: "asc" }, take: 1 } } },
    },
  });

  const byId = new Map(variants.map((v) => [v.id, v]));
  const lines: CartLine[] = [];

  for (const item of items) {
    const variant = byId.get(item.variantId);
    if (!variant) continue;
    if (variant.product.status !== "ACTIVE") continue;

    const inventory = variant.inventory?.quantity ?? 0;
    const quantity = Math.max(0, Math.min(item.quantity, inventory));
    if (quantity <= 0) continue;

    lines.push({
      variantId: variant.id,
      sku: variant.sku,
      productId: variant.productId,
      productSlug: variant.product.slug,
      productName: variant.product.name,
      variantName: variant.name,
      unitPrice: Number(variant.price),
      quantity,
      image: variant.product.images[0]?.url ?? null,
      stockStatus: deriveStockStatus(inventory, variant.inventory?.lowStockAt ?? 0),
    });
  }

  return lines;
}

export function cartTotals(lines: CartLine[], shippingCost = SHIPPING_COST) {
  const subtotal = lines.reduce(
    (sum, line) => sum + line.unitPrice * line.quantity,
    0
  );
  return {
    subtotal,
    shippingCost,
    total: subtotal + shippingCost,
  };
}
