"use client";

import { useState, useTransition } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateInventoryAction } from "@/lib/actions/inventory-actions";
import type { StockStatus } from "@/lib/stock";

export interface InventoryRow {
  variantId: string;
  sku: string;
  productName: string;
  variantName: string;
  quantity: number;
  lowStockAt: number;
  status: StockStatus;
}

const statusVariant: Record<StockStatus, "outline" | "default" | "destructive"> = {
  IN_STOCK: "default",
  LOW_STOCK: "outline",
  OUT_OF_STOCK: "destructive",
};

function InventoryRowItem({ row }: { row: InventoryRow }) {
  const [isPending, startTransition] = useTransition();

  const commit = (quantity: number, lowStockAt: number) => {
    startTransition(async () => {
      await updateInventoryAction(row.variantId, quantity, lowStockAt);
    });
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{row.sku}</TableCell>
      <TableCell>{row.productName}</TableCell>
      <TableCell>{row.variantName}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="icon-xs"
            variant="outline"
            aria-label="Decrease quantity"
            disabled={isPending || row.quantity <= 0}
            onClick={() => commit(row.quantity - 1, row.lowStockAt)}
          >
            -
          </Button>
          <span className="w-10 text-center tabular-nums">{row.quantity}</span>
          <Button
            type="button"
            size="icon-xs"
            variant="outline"
            aria-label="Increase quantity"
            disabled={isPending}
            onClick={() => commit(row.quantity + 1, row.lowStockAt)}
          >
            +
          </Button>
        </div>
      </TableCell>
      <TableCell>
        <LowStockInput
          value={row.lowStockAt}
          disabled={isPending}
          onCommit={(lowStockAt) => commit(row.quantity, lowStockAt)}
        />
      </TableCell>
      <TableCell>
        <Badge variant={statusVariant[row.status]}>{row.status}</Badge>
      </TableCell>
    </TableRow>
  );
}

function LowStockInput({
  value,
  disabled,
  onCommit,
}: {
  value: number;
  disabled?: boolean;
  onCommit: (value: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));

  return (
    <Input
      type="number"
      min={0}
      className="w-20"
      value={draft}
      disabled={disabled}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        const parsed = Number.parseInt(draft, 10);
        const next = Number.isNaN(parsed) ? value : Math.max(0, parsed);
        setDraft(String(next));
        if (next !== value) onCommit(next);
      }}
    />
  );
}

export function InventoryTable({ rows }: { rows: InventoryRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No inventory found.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>SKU</TableHead>
          <TableHead>Product</TableHead>
          <TableHead>Variant</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Low Stock At</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <InventoryRowItem key={row.variantId} row={row} />
        ))}
      </TableBody>
    </Table>
  );
}