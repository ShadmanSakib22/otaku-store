import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOrderByNumber } from "@/lib/orders";
import { formatPrice } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Order Confirmation" };

export default async function OrderPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const order = await getOrderByNumber(orderNumber);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-heading text-3xl font-bold">Order {order.orderNumber}</h1>
      <div className="mt-2 flex items-center gap-2">
        <Badge>{order.paymentStatus}</Badge>
        <Badge variant="secondary">{order.status}</Badge>
      </div>
      {order.paymentMethod === "STRIPE" && order.paymentStatus !== "PAID" ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Your payment is being confirmed. Please check your email for the
          confirmation.
        </p>
      ) : null}

      <Card className="mt-6">
        <CardContent className="space-y-3 p-6">
          <p className="font-medium">{order.customerName}</p>
          {order.customerEmail ? (
            <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
          ) : null}
          <p className="text-sm text-muted-foreground">{order.customerPhone}</p>

          {order.cashPickup ? (
            <div className="rounded-lg bg-muted p-4 text-sm">
              <p className="font-medium">Pickup</p>
              <p>{order.cashPickup.pickupLocation}</p>
              {order.cashPickup.instructions ? (
                <p className="text-muted-foreground">{order.cashPickup.instructions}</p>
              ) : null}
            </div>
          ) : null}
          {order.shippingAddress ? (
            <div className="rounded-lg bg-muted p-4 text-sm">
              <p className="font-medium">Shipping to</p>
              <p>
                {order.shippingAddress.firstName} {order.shippingAddress.lastName}
              </p>
              <p>{order.shippingAddress.address1}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardContent className="divide-y p-0">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 text-sm">
              <div>
                <p className="font-medium">{item.productName}</p>
                <p className="text-muted-foreground">
                  {item.variantName} × {item.quantity}
                </p>
              </div>
              <p className="font-semibold">
                {formatPrice(Number(item.total), "JPY")}
              </p>
            </div>
          ))}
          <div className="flex items-center justify-between p-4 text-sm">
            <span>Total</span>
            <span className="font-semibold">{formatPrice(Number(order.total), "JPY")}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
