import { resend, emailFrom } from "@/lib/email/client";
import { cashPickupEmail, orderConfirmationEmail } from "@/lib/email/templates";
import type { CartLine } from "@/lib/cart";

async function send({ to, subject, html }: { to: string; subject: string; html: string }) {
  try {
    await resend.emails.send({ from: emailFrom, to, subject, html });
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}

export function sendOrderConfirmation(input: {
  to: string;
  orderNumber: string;
  customerName: string;
  lines: CartLine[];
  total: number;
  shippingAddress?: { city: string; state: string; postalCode: string; country: string } | null;
}) {
  return send({
    to: input.to,
    subject: `Order ${input.orderNumber} confirmed`,
    html: orderConfirmationEmail(input),
  });
}

export function sendCashPickupReceipt(input: {
  to: string;
  orderNumber: string;
  customerName: string;
  lines: CartLine[];
  total: number;
  pickupLocation: string;
  instructions?: string | null;
}) {
  return send({
    to: input.to,
    subject: `Order ${input.orderNumber} — pickup receipt`,
    html: cashPickupEmail(input),
  });
}
