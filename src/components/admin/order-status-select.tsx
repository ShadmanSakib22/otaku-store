"use client";

import { useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateOrderStatusAction } from "@/lib/actions/order-actions";
import type { OrderStatus } from "@/generated/prisma/client";

export function OrderStatusSelect({
  orderId,
  currentStatus,
  orderStatuses,
}: {
  orderId: string;
  currentStatus: OrderStatus;
  orderStatuses: OrderStatus[];
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      value={currentStatus}
      disabled={isPending}
      onValueChange={(value) => {
        startTransition(async () => {
          await updateOrderStatusAction(orderId, value as OrderStatus);
        });
      }}
    >
      <SelectTrigger className="min-w-40" aria-label="Order status">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {orderStatuses.map((status) => (
          <SelectItem key={status} value={status}>
            {status}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}