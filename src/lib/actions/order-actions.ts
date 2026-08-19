"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/client";
import { requireAdmin } from "@/lib/auth/guard";
import { markPickedUp } from "@/lib/orders";
import type { OrderStatus } from "@/generated/prisma/client";

export async function updateOrderStatusAction(orderId: string, status: OrderStatus) {
  await requireAdmin();
  await prisma.order.update({ where: { id: orderId }, data: { status } });
  revalidatePath("/admin/orders");
}

export async function markPickedUpAction(orderId: string) {
  await requireAdmin();
  await markPickedUp(orderId);
  revalidatePath("/admin/orders");
}
