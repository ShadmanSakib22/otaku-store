"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import type { ProductStatus } from "@/generated/prisma/client";
import {
  bulkDeleteProductsAction,
  bulkSetProductStatusAction,
  bulkSetProductStockAction,
  type BulkTarget,
} from "@/lib/actions/product-actions";

interface ProductsBulkActionsProps {
  selectedIds: string[];
  pageRowCount: number;
  filter: { q?: string; status?: string; type?: string; sort?: string };
  onClearSelection: () => void;
}

const STATUS_OPTIONS: ProductStatus[] = ["DRAFT", "ACTIVE", "ARCHIVED"];

type OpenDialog = "delete" | "stock" | "status" | null;

export function ProductsBulkActions({
  selectedIds,
  pageRowCount,
  filter,
  onClearSelection,
}: ProductsBulkActionsProps) {
  const router = useRouter();
  const [allMatching, setAllMatching] = useState(false);
  const [openDialog, setOpenDialog] = useState<OpenDialog>(null);
  const [stockValue, setStockValue] = useState("");
  const [statusValue, setStatusValue] = useState<ProductStatus>("ACTIVE");
  const [pending, setPending] = useState(false);

  const hasSelection = selectedIds.length > 0 || allMatching;
  if (!hasSelection) return null;

  const target: BulkTarget = allMatching
    ? { mode: "filter", filter }
    : { mode: "ids", ids: selectedIds };

  const selectionLabel = allMatching
    ? "All matching products"
    : `${selectedIds.length} product${selectedIds.length === 1 ? "" : "s"} selected`;

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
        `Updated ${result.count} product${result.count === 1 ? "" : "s"}`,
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
          onClick={() => setOpenDialog("stock")}
        >
          Update Stock
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7"
          onClick={() => setOpenDialog("status")}
        >
          Update Status
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className="h-7"
          onClick={() => setOpenDialog("delete")}
        >
          Delete
        </Button>
      </div>

      <Dialog
        open={openDialog === "delete"}
        onOpenChange={(o) => !o && closeDialog()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete products</DialogTitle>
            <DialogDescription>
              This permanently deletes {selectionLabel.toLowerCase()}. This
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={pending}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => runAction(() => bulkDeleteProductsAction(target))}
              disabled={pending}
            >
              {pending && <Loader2Icon className="mr-2 size-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={openDialog === "stock"}
        onOpenChange={(o) => !o && closeDialog()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Stock</DialogTitle>
            <DialogDescription>
              Set every variant&apos;s quantity to the same value for{" "}
              {selectionLabel.toLowerCase()}.
            </DialogDescription>
          </DialogHeader>
          <Input
            type="number"
            min={0}
            placeholder="Quantity"
            value={stockValue}
            onChange={(e) => setStockValue(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={pending}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                runAction(() =>
                  bulkSetProductStockAction(target, Number(stockValue)),
                )
              }
              disabled={pending || stockValue === ""}
            >
              {pending && <Loader2Icon className="mr-2 size-4 animate-spin" />}
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={openDialog === "status"}
        onOpenChange={(o) => !o && closeDialog()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Status</DialogTitle>
            <DialogDescription>
              Set the status for {selectionLabel.toLowerCase()}.
            </DialogDescription>
          </DialogHeader>
          <Select
            value={statusValue}
            onValueChange={(value) => setStatusValue(value as ProductStatus)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((status) => (
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
                runAction(() => bulkSetProductStatusAction(target, statusValue))
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
