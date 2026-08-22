"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/admin/data-table";
import { DataTableColumnHeader } from "@/components/admin/data-table-column-header";
import { updateInventoryAction } from "@/lib/actions/inventory-actions";
import type { StockStatus } from "@/lib/stock";
import type { DataTableConfig, PaginationState } from "@/lib/admin-table-types";

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

function QuantityCell({ row }: { row: InventoryRow }) {
  const [isPending, startTransition] = useTransition();

  const commit = (quantity: number, lowStockAt: number) => {
    startTransition(async () => {
      await updateInventoryAction(row.variantId, quantity, lowStockAt);
    });
  };

  return (
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
  );
}

function LowStockCell({ row }: { row: InventoryRow }) {
  const [isPending, startTransition] = useTransition();
  const [draft, setDraft] = useState(String(row.lowStockAt));

  const commit = (quantity: number, lowStockAt: number) => {
    startTransition(async () => {
      await updateInventoryAction(row.variantId, quantity, lowStockAt);
    });
  };

  return (
    <Input
      type="number"
      min={0}
      className="w-20"
      value={draft}
      disabled={isPending}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        const parsed = Number.parseInt(draft, 10);
        const next = Number.isNaN(parsed) ? row.lowStockAt : Math.max(0, parsed);
        setDraft(String(next));
        if (next !== row.lowStockAt) commit(row.quantity, next);
      }}
    />
  );
}

const columns = [
  {
    accessorKey: "sku",
    header: "SKU",
    cell: ({ row }: { row: { original: InventoryRow } }) => <span className="font-medium">{row.original.sku}</span>,
  },
  {
    accessorKey: "productName",
    header: "Product",
  },
  { accessorKey: "variantName", header: "Variant" },
  {
    accessorKey: "quantity",
    header: () => <DataTableColumnHeader sortField="quantity" title="Quantity" />,
    cell: ({ row }: { row: { original: InventoryRow } }) => <QuantityCell row={row.original} />,
  },
  {
    accessorKey: "lowStockAt",
    header: "Low Stock At",
    cell: ({ row }: { row: { original: InventoryRow } }) => <LowStockCell row={row.original} />,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: { row: { original: InventoryRow } }) => (
      <Badge variant={statusVariant[row.original.status]}>{row.original.status}</Badge>
    ),
  },
];

interface InventoryTableProps {
  data: InventoryRow[];
  pagination: PaginationState;
  searchParams: Record<string, string>;
}

export function InventoryTable({ data, pagination }: InventoryTableProps) {
  const config: DataTableConfig<InventoryRow> = {
    columns,
    data,
    pagination,
    searchKey: "q",
    searchPlaceholder: "Search by SKU or product name...",
    basePath: "/admin/inventory",
  };

  return <DataTable config={config} />;
}
