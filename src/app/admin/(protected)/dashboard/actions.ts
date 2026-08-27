"use server";

import { requireAdmin } from "@/lib/auth/guard";
import { deleteOldOrders } from "@/lib/admin-queries";
import { revalidatePath } from "next/cache";

export async function cleanupOldOrdersAction(olderThanDays = 90) {
  await requireAdmin();
  const result = await deleteOldOrders(olderThanDays);
  revalidatePath("/admin/dashboard");
  return result;
}
