import { Badge } from "@/components/ui/badge";

const STYLES = {
  IN_STOCK: "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 border-emerald-500/20",
  LOW_STOCK: "bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 border-amber-500/20",
  OUT_OF_STOCK: "bg-destructive/10 text-destructive border-destructive/20",
} as const;

const LABELS = {
  IN_STOCK: "In stock",
  LOW_STOCK: "Low stock",
  OUT_OF_STOCK: "Out of stock",
} as const;

export function StockBadge({
  status,
}: {
  status: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
}) {
  return (
    <Badge variant="outline" className={STYLES[status]}>
      {LABELS[status]}
    </Badge>
  );
}
