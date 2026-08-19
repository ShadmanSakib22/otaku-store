import { formatPrice } from "@/lib/format";
import type { CartLine } from "@/lib/cart";
import { SUPPORT_EMAIL, SUPPORT_PHONE } from "@/lib/constants";

function lineRows(lines: CartLine[], currency: string) {
  return lines
    .map(
      (line) =>
        `<tr><td>${line.productName} — ${line.variantName} × ${line.quantity}</td><td>${formatPrice(line.unitPrice * line.quantity, currency)}</td></tr>`
    )
    .join("");
}

export function orderConfirmationEmail({
  orderNumber,
  customerName,
  lines,
  total,
  shippingAddress,
}: {
  orderNumber: string;
  customerName: string;
  lines: CartLine[];
  total: number;
  shippingAddress?: { city: string; state: string; postalCode: string; country: string } | null;
}) {
  const address = shippingAddress
    ? `${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}, ${shippingAddress.country}`
    : "";
  return `
  <h1>Order ${orderNumber} confirmed</h1>
  <p>Hi ${customerName}, your order has been paid and is being processed.</p>
  <table><thead><tr><th>Item</th><th>Total</th></tr></thead><tbody>${lineRows(lines, "JPY")}</tbody></table>
  <p><strong>Total: ${formatPrice(total, "JPY")}</strong></p>
  ${address ? `<p>Shipping to: ${address}</p>` : ""}
  <p>Support: ${SUPPORT_EMAIL} · ${SUPPORT_PHONE}</p>`;
}

export function cashPickupEmail({
  orderNumber,
  customerName,
  lines,
  total,
  pickupLocation,
  instructions,
}: {
  orderNumber: string;
  customerName: string;
  lines: CartLine[];
  total: number;
  pickupLocation: string;
  instructions?: string | null;
}) {
  return `
  <h1>Order ${orderNumber} — pickup receipt</h1>
  <p>Hi ${customerName}, thank you for your order. Pay on pickup.</p>
  <table><thead><tr><th>Item</th><th>Total</th></tr></thead><tbody>${lineRows(lines, "JPY")}</tbody></table>
  <p><strong>Total: ${formatPrice(total, "JPY")}</strong></p>
  <p>Pickup location: ${pickupLocation}</p>
  ${instructions ? `<p>${instructions}</p>` : ""}
  <p>Support: ${SUPPORT_EMAIL} · ${SUPPORT_PHONE}</p>`;
}
