"use client";

import { useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updatePaymentStatusAction } from "@/lib/actions/order-actions";
import type { PaymentStatus } from "@/generated/prisma/client";

export function PaymentStatusSelect({
  orderId,
  currentStatus,
  paymentStatuses,
}: {
  orderId: string;
  currentStatus: PaymentStatus;
  paymentStatuses: PaymentStatus[];
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      value={currentStatus}
      disabled={isPending}
      onValueChange={(value) => {
        startTransition(async () => {
          await updatePaymentStatusAction(orderId, value as PaymentStatus);
        });
      }}
    >
      <SelectTrigger className="min-w-40" aria-label="Payment status">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {paymentStatuses.map((status) => (
          <SelectItem key={status} value={status}>
            {status}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
