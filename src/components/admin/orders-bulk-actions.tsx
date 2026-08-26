"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OrderStatus, PaymentStatus } from "@/generated/prisma/client";
import {
  bulkUpdateOrderPaymentStatusAction,
  bulkUpdateOrderStatusAction,
  type OrderBulkTarget,
} from "@/lib/actions/order-actions";

interface OrdersBulkActionsProps {
  selectedIds: string[];
  pageRowCount: number;
  filter: { status?: string; paymentStatus?: string; sort?: string };
  onClearSelection: () => void;
}

const ORDER_STATUS_OPTIONS: OrderStatus[] = [
  "PENDING",
  "PROCESSING",
  "READY_FOR_PICKUP",
  "SHIPPED",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
];

const PAYMENT_STATUS_OPTIONS: PaymentStatus[] = ["PENDING", "PAID", "FAILED", "REFUNDED"];

type OpenDialog = "orderStatus" | "paymentStatus" | null;

export function OrdersBulkActions({
  selectedIds,
  pageRowCount,
  filter,
  onClearSelection,
}: OrdersBulkActionsProps) {
  const router = useRouter();
  const [allMatching, setAllMatching] = useState(false);
  const [openDialog, setOpenDialog] = useState<OpenDialog>(null);
  const [orderStatusValue, setOrderStatusValue] = useState<OrderStatus>("PROCESSING");
  const [paymentStatusValue, setPaymentStatusValue] = useState<PaymentStatus>("PAID");
  const [pending, setPending] = useState(false);

  const hasSelection = selectedIds.length > 0 || allMatching;
  if (!hasSelection) return null;

  const target: OrderBulkTarget = allMatching
    ? { mode: "filter", filter }
    : { mode: "ids", ids: selectedIds };

  const selectionLabel = allMatching
    ? "All matching orders"
    : `${selectedIds.length} order${selectedIds.length === 1 ? "" : "s"} selected`;

  const closeDialog = () => setOpenDialog(null);

  const runAction = async (
    fn: () => Promise<{ ok?: boolean; count?: number; error?: string }>,
  ) => {
    setPending(true);
    try {
      const result = await fn();
      if (result.error || !result.ok) {
        toast.error(result.error ?? "Action failed");
        return;
      }
      toast.success(
        `Updated ${result.count} order${result.count === 1 ? "" : "s"}`,
      );
      router.refresh();
      onClearSelection();
      setAllMatching(false);
      closeDialog();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border bg-muted/40 p-2">
      <span className="text-sm font-medium">{selectionLabel}</span>

      {!allMatching && pageRowCount > selectedIds.length && (
        <Button
          variant="link"
          size="sm"
          className="h-7 px-2"
          onClick={() => setAllMatching(true)}
        >
          Select all matching
        </Button>
      )}
      {allMatching && (
        <Button
          variant="link"
          size="sm"
          className="h-7 px-2"
          onClick={() => setAllMatching(false)}
        >
          Clear all-matching
        </Button>
      )}

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-7"
          onClick={() => setOpenDialog("orderStatus")}
        >
          Update Status
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7"
          onClick={() => setOpenDialog("paymentStatus")}
        >
          Update Payment Status
        </Button>
      </div>

      <Dialog open={openDialog === "orderStatus"} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Set the order status for {selectionLabel.toLowerCase()}.
            </DialogDescription>
          </DialogHeader>
          <Select
            value={orderStatusValue}
            onValueChange={(value) => setOrderStatusValue(value as OrderStatus)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Order Status" />
            </SelectTrigger>
            <SelectContent>
              {ORDER_STATUS_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={pending}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                runAction(() =>
                  bulkUpdateOrderStatusAction(target, orderStatusValue),
                )
              }
              disabled={pending}
            >
              {pending && <Loader2Icon className="mr-2 size-4 animate-spin" />}
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openDialog === "paymentStatus"} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Payment Status</DialogTitle>
            <DialogDescription>
              Set the payment status for {selectionLabel.toLowerCase()}.
            </DialogDescription>
          </DialogHeader>
          <Select
            value={paymentStatusValue}
            onValueChange={(value) => setPaymentStatusValue(value as PaymentStatus)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Payment Status" />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_STATUS_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={pending}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                runAction(() =>
                  bulkUpdateOrderPaymentStatusAction(target, paymentStatusValue),
                )
              }
              disabled={pending}
            >
              {pending && <Loader2Icon className="mr-2 size-4 animate-spin" />}
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
