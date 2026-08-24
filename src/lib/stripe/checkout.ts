import { stripe } from "@/lib/stripe/client";
import type { Order } from "@/generated/prisma/client";
import type { CartLine } from "@/lib/cart";
import type { ShippingAddressInput } from "@/lib/validation/checkout";

export async function createCheckoutSession({
  order,
  lines,
  customer,
  shippingAddress,
  successUrl,
}: {
  order: Order;
  lines: CartLine[];
  customer: { name: string; email: string; phone: string };
  shippingAddress: ShippingAddressInput;
  successUrl: string;
}) {
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: customer.email,
    payment_intent_data: { shipping: { name: customer.name, address: stripeAddress(shippingAddress) } },
    line_items: lines.map((line) => ({
      quantity: line.quantity,
      price_data: {
        currency: "jpy",
        unit_amount: Math.round(line.unitPrice),
        product_data: {
          name: line.productName,
          description: line.variantName,
        },
      },
    })),
    metadata: { orderId: order.id },
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/`,
  });

  return session;
}

function stripeAddress(address: ShippingAddressInput) {
  return {
    line1: address.address1,
    line2: address.address2 || undefined,
    city: address.city,
    state: address.state,
    postal_code: address.postalCode,
    country: address.country,
  };
}
