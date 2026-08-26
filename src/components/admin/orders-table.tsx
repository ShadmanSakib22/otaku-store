"use client";

import Link from "next/link";
import { useState } from "react";
import { formatPrice } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/admin/data-table";
import { DataTableColumnHeader } from "@/components/admin/data-table-column-header";
import { OrdersBulkActions } from "@/components/admin/orders-bulk-actions";
import type { DataTableConfig, PaginationState, DataTableFilter } from "@/lib/admin-table-types";
import type { LegacyColumnDef } from "@tanstack/react-table/legacy";
import type { RowSelectionState } from "@tanstack/react-table";

export interface AdminOrderRow {
  id: string;
  orderNumber: string;
  customerName: string;
  paymentMethod: string;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: Date | string;
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "outline",
  PROCESSING: "secondary",
  READY_FOR_PICKUP: "secondary",
  SHIPPED: "secondary",
  DELIVERED: "default",
  COMPLETED: "default",
  CANCELLED: "destructive",
};

const paymentVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "outline",
  PAID: "default",
  FAILED: "destructive",
  REFUNDED: "secondary",
};

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

const columns: LegacyColumnDef<AdminOrderRow>[] = [
  {
    accessorKey: "orderNumber",
    header: () => <DataTableColumnHeader sortField="orderNumber" title="Order" />,
    cell: ({ row }) => (
      <Link
        href={`/admin/orders/${row.original.id}`}
        className="font-mono text-xs hover:underline"
      >
        {row.original.orderNumber}
      </Link>
    ),
  },
  {
    accessorKey: "customerName",
    header: () => <DataTableColumnHeader sortField="customerName" title="Customer" />,
  },
  { accessorKey: "paymentMethod", header: "Method" },
  {
    accessorKey: "total",
    header: () => <DataTableColumnHeader sortField="total" title="Total" />,
    cell: ({ row }) => formatPrice(Number(row.original.total), "JPY"),
  },
  {
    accessorKey: "paymentStatus",
    header: () => <DataTableColumnHeader sortField="paymentStatus" title="Payment" />,
    cell: ({ row }) => (
      <Badge variant={paymentVariant[row.original.paymentStatus] ?? "outline"}>
        {row.original.paymentStatus}
      </Badge>
    ),
  },
  {
    accessorKey: "status",
    header: () => <DataTableColumnHeader sortField="status" title="Status" />,
    cell: ({ row }) => (
      <Badge variant={statusVariant[row.original.status] ?? "outline"}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: () => <DataTableColumnHeader sortField="createdAt" title="Created" />,
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
];

interface OrdersTableProps {
  data: AdminOrderRow[];
  pagination: PaginationState;
  searchParams: Record<string, string>;
}

const filters: DataTableFilter[] = [
  {
    id: "status",
    label: "Status",
    options: [
      { label: "Pending", value: "PENDING" },
      { label: "Processing", value: "PROCESSING" },
      { label: "Ready for Pickup", value: "READY_FOR_PICKUP" },
      { label: "Shipped", value: "SHIPPED" },
      { label: "Delivered", value: "DELIVERED" },
      { label: "Completed", value: "COMPLETED" },
      { label: "Cancelled", value: "CANCELLED" },
    ],
  },
  {
    id: "paymentStatus",
    label: "Payment",
    options: [
      { label: "Pending", value: "PENDING" },
      { label: "Paid", value: "PAID" },
      { label: "Failed", value: "FAILED" },
      { label: "Refunded", value: "REFUNDED" },
    ],
  },
];

export function OrdersTable({ data, pagination, searchParams }: OrdersTableProps) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id]);

  const config: DataTableConfig<AdminOrderRow> = {
    columns,
    data,
    pagination,
    filters,
    activeFilters: {
      ...(searchParams.status ? { status: searchParams.status } : {}),
      ...(searchParams.paymentStatus ? { paymentStatus: searchParams.paymentStatus } : {}),
    },
    basePath: "/admin/orders",
    enableBulkActions: true,
  };

  return (
    <div className="space-y-4">
      <OrdersBulkActions
        selectedIds={selectedIds}
        pageRowCount={data.length}
        filter={{
          ...(searchParams.status ? { status: searchParams.status } : {}),
          ...(searchParams.paymentStatus ? { paymentStatus: searchParams.paymentStatus } : {}),
          ...(searchParams.sort ? { sort: searchParams.sort } : {}),
        }}
        onClearSelection={() => setRowSelection({})}
      />
      <DataTable
        config={config}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
      />
    </div>
  );
}
