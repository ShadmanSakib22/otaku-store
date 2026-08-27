import { getDashboardStats, getDashboardSales } from "@/lib/admin-queries";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  CircleDollarSign,
  Package,
  Boxes,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { SalesByTypeChart } from "@/components/admin/dashboard/sales-by-type-chart";
import { SalesOverTimeChart } from "@/components/admin/dashboard/sales-over-time-chart";
import { SalesByAuthorChart } from "@/components/admin/dashboard/sales-by-author-chart";
import { CleanupButton } from "@/components/admin/cleanup-button";

export const revalidate = 30;

export default async function AdminDashboardPage() {
  const [stats, sales] = await Promise.all([
    getDashboardStats(),
    getDashboardSales(),
  ]);

  const cards = [
    {
      label: "Orders",
      value: String(stats.orderCount),
      icon: Package,
      tint: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    },
    {
      label: "Revenue",
      value: formatPrice(stats.revenue, "JPY"),
      icon: CircleDollarSign,
      tint: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Products",
      value: String(stats.productCount),
      icon: Boxes,
      tint: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    },
    {
      label: "Low stock",
      value: String(stats.lowStockCount),
      icon: AlertTriangle,
      tint: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    {
      label: "Pending",
      value: String(stats.pendingOrders),
      icon: Clock,
      tint: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
        <CleanupButton />
      </div>
      <div className="flex flex-wrap items-center gap-6 md:gap-10 mx-2">
        {cards.map((card) => (
          <div key={card.label} className="flex items-center gap-4">
            <div
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-none",
                card.tint,
              )}
            >
              <card.icon className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {card.label}
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums">
                {card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <SalesOverTimeChart data={sales.byDay} />

      <div className="grid gap-4 md:grid-cols-2">
        <SalesByTypeChart data={sales.byType} dayData={sales.byDayType} allDays={sales.byDay} />
        <SalesByAuthorChart data={sales.byAuthor} dayData={sales.byDayAuthor} allDays={sales.byDay} />
      </div>
    </div>
  );
}
