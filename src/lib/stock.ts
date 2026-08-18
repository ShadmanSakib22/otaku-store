export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export function deriveStockStatus(
  quantity: number,
  lowStockAt: number
): StockStatus {
  if (quantity <= 0) return "OUT_OF_STOCK";
  if (quantity <= lowStockAt) return "LOW_STOCK";
  return "IN_STOCK";
}
