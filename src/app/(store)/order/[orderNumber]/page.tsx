import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOrderByNumber } from "@/lib/orders";
import { formatPrice } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PrintButton } from "@/components/checkout/print-button";
import { ClipboardCopyIcon } from "lucide-react";

export const metadata: Metadata = { title: "Order Confirmation" };

export default async function OrderPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const order = await getOrderByNumber(orderNumber);
  if (!order) notFound();

  const isPaid = order.paymentStatus === "PAID";
  const isCashPickup = order.paymentMethod === "CASH";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 print:py-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Order {order.orderNumber}
          </h1>
          <div className="mt-2 flex items-center gap-2">
            <Badge>{order.paymentStatus}</Badge>
            <Badge variant="secondary">{order.status}</Badge>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 sm:mt-0 print:hidden">
          <PrintButton />
        </div>
      </div>

      {isCashPickup ? (
        <div className="mt-6 flex items-start gap-3 border border-primary/20 bg-primary/5 p-4">
          <ClipboardCopyIcon className="mt-0.5 size-5 shrink-0 text-primary" />
          <div className="text-sm">
            <p className="font-medium">Bring a printout or digital copy</p>
            <p className="mt-1 text-muted-foreground">
              Present this order confirmation on your phone or as a printout
              when you arrive for pickup.
            </p>
          </div>
        </div>
      ) : null}

      {!isPaid && order.paymentMethod === "STRIPE" ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Your payment is being confirmed. Please check your email for the
          confirmation.
        </p>
      ) : null}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Customer</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <p className="font-medium">{order.customerName}</p>
          {order.customerEmail ? (
            <p className="text-sm text-muted-foreground">
              {order.customerEmail}
            </p>
          ) : null}
          <p className="text-sm text-muted-foreground">{order.customerPhone}</p>

          {order.cashPickup ? (
            <>
              <Separator className="my-2" />
              <div className="rounded-lg bg-muted p-4 text-sm">
                <p className="font-medium">Pickup Location</p>
                <p>{order.cashPickup.pickupLocation}</p>
                {order.cashPickup.instructions ? (
                  <p className="text-muted-foreground">
                    {order.cashPickup.instructions}
                  </p>
                ) : null}
              </div>
            </>
          ) : null}
          {order.shippingAddress ? (
            <>
              <Separator className="my-2" />
              <div className="rounded-lg bg-muted p-4 text-sm">
                <p className="font-medium">Shipping Address</p>
                <p>
                  {order.shippingAddress.firstName}{" "}
                  {order.shippingAddress.lastName}
                </p>
                <p>{order.shippingAddress.address1}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.postalCode}
                </p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-col divide-y">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between px-6 py-4 text-sm"
              >
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
            <div className="flex items-center justify-between px-6 py-4 text-sm">
              <span className="font-medium">Total</span>
              <span className="font-semibold">
                {formatPrice(Number(order.total), "JPY")}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
