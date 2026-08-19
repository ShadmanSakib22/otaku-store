import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface AdminOrderRow {
  id: string;
  orderNumber: string;
  customerName: string;
  paymentMethod: string;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: Date | string;
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "outline",
  PROCESSING: "secondary",
  READY_FOR_PICKUP: "secondary",
  SHIPPED: "secondary",
  DELIVERED: "default",
  COMPLETED: "default",
  CANCELLED: "destructive",
};

const paymentVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "outline",
  PAID: "default",
  FAILED: "destructive",
  REFUNDED: "secondary",
};

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function OrdersTable({ orders }: { orders: AdminOrderRow[] }) {
  if (orders.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No orders found.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Method</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Payment</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell>
              <Link
                href={`/admin/orders/${order.id}`}
                className="font-mono text-xs hover:underline"
              >
                {order.orderNumber}
              </Link>
            </TableCell>
            <TableCell>{order.customerName}</TableCell>
            <TableCell>{order.paymentMethod}</TableCell>
            <TableCell>{formatPrice(Number(order.total), "JPY")}</TableCell>
            <TableCell>
              <Badge variant={paymentVariant[order.paymentStatus] ?? "outline"}>
                {order.paymentStatus}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={statusVariant[order.status] ?? "outline"}>
                {order.status}
              </Badge>
            </TableCell>
            <TableCell>{formatDate(order.createdAt)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
