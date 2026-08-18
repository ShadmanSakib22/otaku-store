import { Badge } from "@/components/ui/badge";

export function StockBadge({ status }: { status: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" }) {
  const label =
    status === "IN_STOCK" ? "In stock"
    : status === "LOW_STOCK" ? "Low stock"
    : "Out of stock";
  const variant =
    status === "IN_STOCK" ? "default"
    : status === "LOW_STOCK" ? "secondary"
    : "destructive" as const;
  return <Badge variant={variant}>{label}</Badge>;
}
