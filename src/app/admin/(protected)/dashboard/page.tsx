import { getDashboardStats, getRecentOrders } from "@/lib/admin-queries";
import { formatPrice } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const revalidate = 30;

export default async function AdminDashboardPage() {
  const [stats, orders] = await Promise.all([getDashboardStats(), getRecentOrders()]);

  const cards = [
    { label: "Orders", value: String(stats.orderCount) },
    { label: "Revenue", value: formatPrice(stats.revenue, "JPY") },
    { label: "Products", value: String(stats.productCount) },
    { label: "Low stock", value: String(stats.lowStockCount) },
    { label: "Pending", value: String(stats.pendingOrders) },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className="mt-1 text-xl font-bold">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">{order.orderNumber}</TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>{formatPrice(Number(order.total), "JPY")}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{order.paymentStatus}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
