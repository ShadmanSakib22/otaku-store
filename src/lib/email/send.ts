export async function sendCashPickupReceipt(_: {
  to: string;
  orderNumber: string;
  customerName: string;
  lines: unknown[];
  total: number;
}) {
  return null; // implemented in Task D7
}

export async function sendOrderConfirmation(_: {
  to: string;
  orderNumber: string;
  customerName: string;
  lines: unknown[];
  total: number;
  shippingAddress?: unknown;
}) {
  return null; // implemented in Task D7
}
