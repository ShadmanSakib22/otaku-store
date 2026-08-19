"use server";

import { cartTotals, validateCartItems } from "@/lib/cart";

export async function previewCart(
  items: { variantId: string; quantity: number }[]
) {
  const lines = await validateCartItems(items);
  return { lines, totals: cartTotals(lines) };
}