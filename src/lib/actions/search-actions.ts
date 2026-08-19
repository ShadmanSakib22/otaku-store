"use server";

import { requireAdmin } from "@/lib/auth/guard";
import { rebuildIndex, indexProduct } from "@/lib/search/sync";

export async function reindexCatalogue() {
  await requireAdmin();
  await rebuildIndex();
  return { ok: true };
}

export async function syncProduct(productId: string) {
  await requireAdmin();
  await indexProduct(productId);
  return { ok: true };
}
