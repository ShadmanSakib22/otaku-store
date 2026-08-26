"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/client";
import { requireAdmin } from "@/lib/auth/guard";
import { markPickedUp } from "@/lib/orders";
import type { OrderStatus, PaymentStatus } from "@/generated/prisma/client";

export type OrderBulkTarget =
  | { mode: "ids"; ids: string[] }
  | {
      mode: "filter";
      filter: { status?: string; paymentStatus?: string; sort?: string };
    };

export async function updateOrderStatusAction(orderId: string, status: OrderStatus) {
  await requireAdmin();
  await prisma.order.update({ where: { id: orderId }, data: { status } });
  revalidatePath("/admin/orders");
}

export async function updatePaymentStatusAction(orderId: string, paymentStatus: PaymentStatus) {
  await requireAdmin();
  await prisma.order.update({ where: { id: orderId }, data: { paymentStatus } });
  revalidatePath("/admin/orders");
}

export async function markPickedUpAction(orderId: string) {
  await requireAdmin();
  await markPickedUp(orderId);
  revalidatePath("/admin/orders");
}

export async function bulkUpdateOrderPaymentStatusAction(
  target: OrderBulkTarget,
  paymentStatus: PaymentStatus,
) {
  await requireAdmin();

  const where: Record<string, unknown> = {};

  if (target.mode === "ids") {
    const ids = target.ids.filter(Boolean);
    if (ids.length === 0) return { error: "No orders selected" };
    where.id = { in: ids };
  } else {
    const { status, paymentStatus: currentPaymentStatus } = target.filter;
    if (status) where.status = status;
    if (currentPaymentStatus) where.paymentStatus = currentPaymentStatus;
  }

  const result = await prisma.order.updateMany({ where, data: { paymentStatus } });
  revalidatePath("/admin/orders");
  return { ok: true, count: result.count };
}

export async function bulkUpdateOrderStatusAction(
  target: OrderBulkTarget,
  status: OrderStatus,
) {
  await requireAdmin();

  const where: Record<string, unknown> = {};

  if (target.mode === "ids") {
    const ids = target.ids.filter(Boolean);
    if (ids.length === 0) return { error: "No orders selected" };
    where.id = { in: ids };
  } else {
    const { status: currentStatus, paymentStatus } = target.filter;
    if (currentStatus) where.status = currentStatus;
    if (paymentStatus) where.paymentStatus = paymentStatus;
  }

  const result = await prisma.order.updateMany({ where, data: { status } });
  revalidatePath("/admin/orders");
  return { ok: true, count: result.count };
}
