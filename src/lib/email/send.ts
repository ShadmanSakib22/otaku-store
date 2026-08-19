export async function sendCashPickupReceipt(_: {
  to: string;
  orderNumber: string;
  customerName: string;
  lines: unknown[];
  total: number;
}) {
  void _;
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
  void _;
  return null; // implemented in Task D7
}
