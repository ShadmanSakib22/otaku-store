export function generateOrderNumber(year: number, seq: number): string {
  return `ORD-${year}-${String(seq).padStart(6, "0")}`;
}
