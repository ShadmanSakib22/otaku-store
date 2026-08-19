import { NextRequest } from "next/server";
import { z } from "zod";
import { cartSchema } from "@/lib/validation/cart";
import { cashCheckoutSchema } from "@/lib/validation/checkout";
import { validateCartItems } from "@/lib/cart";
import { createOrder } from "@/lib/orders";
import { PICKUP_INSTRUCTIONS, PICKUP_LOCATION } from "@/lib/constants";
import { sendCashPickupReceipt } from "@/lib/email/send";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = z
    .object({
      items: cartSchema.shape.items,
      name: cashCheckoutSchema.shape.name,
      phone: cashCheckoutSchema.shape.phone,
      email: cashCheckoutSchema.shape.email,
      termsAccepted: cashCheckoutSchema.shape.termsAccepted,
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
    customer: { name: input.name, email: input.email || undefined, phone: input.phone },
    method: "CASH",
    pickup: { location: PICKUP_LOCATION, instructions: PICKUP_INSTRUCTIONS },
    termsAcceptedAt: new Date(),
  });

  if (input.email) {
    await sendCashPickupReceipt({
      to: input.email,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      lines,
      total: Number(order.total),
      pickupLocation: PICKUP_LOCATION,
      instructions: PICKUP_INSTRUCTIONS,
    });
  }

  return Response.json({ orderNumber: order.orderNumber }, { status: 201 });
}
