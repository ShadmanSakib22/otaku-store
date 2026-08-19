import { prisma } from "@/lib/db/client";
import { generateOrderNumber } from "@/lib/order-number";
import { SHIPPING_COST, TERMS_VERSION } from "@/lib/constants";
import type { CartLine } from "@/lib/cart";
import type { ShippingAddressInput } from "@/lib/validation/checkout";

export interface OrderCustomer {
  name: string;
  email?: string;
  phone: string;
}

export interface CreateOrderInput {
  lines: CartLine[];
  customer: OrderCustomer;
  method: "CASH" | "STRIPE";
  address?: ShippingAddressInput;
  pickup?: { location: string; instructions?: string };
  termsAcceptedAt?: Date;
}

export function isFinalized(order: { paymentStatus: string }) {
  return order.paymentStatus === "PAID";
}

export async function getOrderByNumber(orderNumber: string) {
  return prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: true,
      payment: true,
      shippingAddress: true,
      cashPickup: true,
    },
  });
}

export async function getOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      payment: true,
      shippingAddress: true,
      cashPickup: true,
    },
  });
}

export async function createOrder(input: CreateOrderInput) {
  const year = new Date().getFullYear();
  const yearPrefix = `ORD-${year}-`;

  return prisma.$transaction(async (tx) => {
    const count = await tx.order.count({
      where: { orderNumber: { startsWith: yearPrefix } },
    });
    const orderNumber = generateOrderNumber(year, count + 1);

    const subtotal = input.lines.reduce(
      (sum, line) => sum + line.unitPrice * line.quantity,
      0
    );

    const order = await tx.order.create({
      data: {
        orderNumber,
        customerName: input.customer.name,
        customerEmail: input.customer.email || null,
        customerPhone: input.customer.phone,
        paymentMethod: input.method,
        paymentStatus: "PENDING",
        currency: "JPY",
        subtotal,
        shippingCost: SHIPPING_COST,
        total: subtotal + SHIPPING_COST,
        termsAccepted: true,
        termsVersion: TERMS_VERSION,
        termsAcceptedAt: input.termsAcceptedAt ?? new Date(),

        items: {
          create: input.lines.map((line) => ({
            variantId: line.variantId,
            productName: line.productName,
            variantName: line.variantName,
            sku: line.sku,
            unitPrice: line.unitPrice,
            quantity: line.quantity,
            total: line.unitPrice * line.quantity,
          })),
        },

        ...(input.method === "CASH" && input.pickup
          ? {
              cashPickup: {
                create: {
                  pickupLocation: input.pickup.location,
                  instructions: input.pickup.instructions ?? null,
                },
              },
            }
          : {}),

        ...(input.method === "STRIPE" && input.address
          ? { shippingAddress: { create: input.address } }
          : {}),

        ...(input.method === "STRIPE"
          ? {
              payment: {
                create: {
                  provider: "STRIPE",
                  status: "PENDING",
                  amount: subtotal + SHIPPING_COST,
                  currency: "JPY",
                },
              },
            }
          : {}),
      },
    });

    if (input.method === "CASH") {
      for (const line of input.lines) {
        await tx.inventory.update({
          where: { variantId: line.variantId },
          data: { quantity: { decrement: line.quantity } },
        });
        await tx.product.update({
          where: { id: line.productId },
          data: { lifetimeSales: { increment: line.quantity } },
        });
      }
    }

    return order;
  });
}

export async function decrementInventoryAndSales(
  orderId: string,
  lines: CartLine[]
) {
  return prisma.$transaction(async (tx) => {
    for (const line of lines) {
      await tx.inventory.update({
        where: { variantId: line.variantId },
        data: { quantity: { decrement: line.quantity } },
      });
      await tx.product.update({
        where: { id: line.productId },
        data: { lifetimeSales: { increment: line.quantity } },
      });
    }
    const order = await tx.order.update({
      where: { id: orderId },
      data: { paymentStatus: "PAID", status: "PROCESSING" },
    });
    await tx.payment.update({
      where: { orderId },
      data: { status: "PAID", paidAt: new Date() },
    });
    return order;
  });
}

export async function markPickedUp(orderId: string) {
  return prisma.$transaction(async (tx) => {
    await tx.cashPickupDetails.update({
      where: { orderId },
      data: { pickedUpAt: new Date() },
    });
    return tx.order.update({
      where: { id: orderId },
      data: { status: "READY_FOR_PICKUP", paymentStatus: "PAID" },
    });
  });
}