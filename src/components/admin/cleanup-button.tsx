"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cleanupOldOrdersAction } from "@/app/admin/(protected)/dashboard/actions";
import { toast } from "sonner";

export function CleanupButton() {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<{
    deleted: number;
    salesRestored: number;
  } | null>(null);

  async function handleCleanup() {
    setLoading(true);
    try {
      const res = await cleanupOldOrdersAction(90);
      setResult(res);
      toast.success(
        `Deleted ${res.deleted} orders, restored ${res.salesRestored} lifetime sales`,
      );
    } catch {
      toast.error("Failed to clean up old orders");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setResult(null);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Trash2 className="mr-2 size-4" />
          Cleanup Old Orders
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Orders Older Than 3 Months</DialogTitle>
          <DialogDescription>
            This will permanently remove all orders placed before{" "}
            {new Date(
              Date.now() - 90 * 24 * 60 * 60 * 1000,
            ).toLocaleDateString()}
            . Product lifetime sales will be adjusted accordingly. This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {result ? (
          <div className="rounded-lg border p-4 text-sm">
            <p>
              Deleted <strong>{result.deleted}</strong> orders.
            </p>
            <p>
              Restored <strong>{result.salesRestored}</strong> lifetime sales
              units.
            </p>
          </div>
        ) : (
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={handleCleanup}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete Old Orders"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
