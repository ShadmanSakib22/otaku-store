"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/auth/guard";

export async function updateInventoryAction(
  variantId: string,
  quantity: number,
  lowStockAt: number
) {
  await requireRole("ADMIN");
  await prisma.inventory.update({
    where: { variantId },
    data: { quantity: Math.max(0, quantity), lowStockAt: Math.max(0, lowStockAt) },
  });
  revalidatePath("/admin/inventory");
}
