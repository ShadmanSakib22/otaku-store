import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/orders";
import { formatPrice } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { PaymentStatusSelect } from "@/components/admin/payment-status-select";
import { markPickedUpAction } from "@/lib/actions/order-actions";
import { OrderStatus, PaymentStatus } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

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

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  const isCash = order.paymentMethod === "CASH";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-mono text-2xl font-bold">
            {order.orderNumber}
          </h1>
          <p className="text-sm text-muted-foreground">
            Created {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={statusVariant[order.status] ?? "outline"}>
            {order.status}
          </Badge>
          <Badge variant={paymentVariant[order.paymentStatus] ?? "outline"}>
            {order.paymentStatus}
          </Badge>
          <OrderStatusSelect
            orderId={order.id}
            currentStatus={order.status}
            orderStatuses={Object.values(OrderStatus)}
          />
          <PaymentStatusSelect
            orderId={order.id}
            currentStatus={order.paymentStatus}
            paymentStatuses={Object.values(PaymentStatus)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="space-y-1 p-4 text-sm">
            <h2 className="font-semibold">Customer</h2>
            <p>{order.customerName}</p>
            {order.customerEmail && <p>{order.customerEmail}</p>}
            <p>{order.customerPhone}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-1 p-4 text-sm">
            <h2 className="font-semibold">Totals</h2>
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(Number(order.subtotal), "JPY")}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{formatPrice(Number(order.shippingCost), "JPY")}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatPrice(Number(order.total), "JPY")}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <p>{item.productName}</p>
                    {item.variantName && (
                      <p className="text-xs text-muted-foreground">
                        {item.variantName}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{item.sku}</TableCell>
                  <TableCell>{formatPrice(Number(item.unitPrice), "JPY")}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{formatPrice(Number(item.total), "JPY")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {isCash && order.cashPickup ? (
          <Card>
            <CardContent className="space-y-1 p-4 text-sm">
              <h2 className="font-semibold">Cash Pickup</h2>
              <p>{order.cashPickup.pickupLocation}</p>
              {order.cashPickup.instructions && (
                <p className="text-muted-foreground">
                  {order.cashPickup.instructions}
                </p>
              )}
              {order.cashPickup.pickedUpAt ? (
                <p className="text-muted-foreground">
                  Picked up {formatDate(order.cashPickup.pickedUpAt)}
                </p>
              ) : (
                <form action={markPickedUpAction.bind(null, order.id)}>
                  <Button type="submit" className="mt-2">
                    Mark picked up
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        ) : order.shippingAddress ? (
          <Card>
            <CardContent className="space-y-1 p-4 text-sm">
              <h2 className="font-semibold">Shipping Address</h2>
              <p>
                {order.shippingAddress.firstName} {order.shippingAddress.lastName}
              </p>
              <p>{order.shippingAddress.address1}</p>
              {order.shippingAddress.address2 && (
                <p>{order.shippingAddress.address2}</p>
              )}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
              <p>{order.shippingAddress.phone}</p>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}