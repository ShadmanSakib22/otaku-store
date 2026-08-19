import { stripe } from "@/lib/stripe/client";
import { prisma } from "@/lib/db/client";
import { decrementInventoryAndSales } from "@/lib/orders";
import { sendOrderConfirmation } from "@/lib/email/send";
import type { CartLine } from "@/lib/cart";

export function isIdempotent(order: { paymentStatus: string }) {
  return order.paymentStatus === "PAID";
}

export function verifyWebhookSignature(rawBody: string, signature: string) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");
  const event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  return event;
}

export async function handleCheckoutSessionCompleted(sessionId: string) {
  const payment = await prisma.payment.findUnique({
    where: { stripeCheckoutSessionId: sessionId },
    include: { order: { include: { items: true, shippingAddress: true } } },
  });

  if (!payment) return { processed: false, reason: "no_payment" };
  if (isIdempotent(payment.order)) {
    return { processed: false, reason: "already_processed" };
  }

  const order = payment.order;
  const variantIds = order.items
    .map((item) => item.variantId)
    .filter((id): id is string => Boolean(id));
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: { product: { select: { id: true } } },
  });
  const variantById = new Map(variants.map((v) => [v.id, v]));

  const lines: CartLine[] = order.items.map((item) => {
    const variant = variantById.get(item.variantId ?? "");
    return {
      variantId: item.variantId ?? "",
      sku: item.sku,
      productId: variant?.product.id ?? "",
      productSlug: "", // not needed by decrementInventoryAndSales
      productName: item.productName,
      variantName: item.variantName,
      unitPrice: Number(item.unitPrice),
      quantity: item.quantity,
      image: null,
      stockStatus: "IN_STOCK" as const,
    };
  });

  await decrementInventoryAndSales(order.id, lines);

  if (order.customerEmail) {
    await sendOrderConfirmation({
      to: order.customerEmail,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      lines,
      total: Number(order.total),
      shippingAddress: order.shippingAddress,
    });
  }

  return { processed: true };
}