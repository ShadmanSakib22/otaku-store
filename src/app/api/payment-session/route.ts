import { NextRequest } from "next/server";
import { z } from "zod";
import { cartSchema } from "@/lib/validation/cart";
import { stripeCheckoutSchema } from "@/lib/validation/checkout";
import { validateCartItems } from "@/lib/cart";
import { createOrder } from "@/lib/orders";
import { createCheckoutSession } from "@/lib/stripe/checkout";
import { prisma } from "@/lib/db/client";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = z
    .object({
      items: cartSchema.shape.items,
      customerName: stripeCheckoutSchema.shape.customerName,
      email: stripeCheckoutSchema.shape.email,
      phone: stripeCheckoutSchema.shape.phone,
      termsAccepted: stripeCheckoutSchema.shape.termsAccepted,
      shippingAddress: stripeCheckoutSchema.shape.shippingAddress,
    })
    .safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: "Invalid checkout payload" }, { status: 400 });
  }

  const input = parsed.data;
  const lines = await validateCartItems(input.items);
  if (lines.length === 0) {
    return Response.json({ error: "Your cart is empty or unavailable" }, { status: 400 });
  }

  const order = await createOrder({
    lines,
    customer: { name: input.customerName, email: input.email, phone: input.phone },
    method: "STRIPE",
    address: input.shippingAddress,
    termsAcceptedAt: new Date(),
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  let session;
  try {
    session = await createCheckoutSession({
      order,
      lines,
      customer: { name: input.customerName, email: input.email, phone: input.phone },
      shippingAddress: input.shippingAddress,
      successUrl: `${appUrl}/order/${order.orderNumber}`,
    });
  } catch (error) {
    await prisma.order.delete({ where: { id: order.id } });
    throw error;
  }

  await prisma.payment.update({
    where: { orderId: order.id },
    data: { stripeCheckoutSessionId: session.id },
  });

  return Response.json({ url: session.url }, { status: 200 });
}
