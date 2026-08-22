"use client";

import Link from "next/link";
import { useState } from "react";
import { formatPrice } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/admin/data-table";
import { DataTableColumnHeader } from "@/components/admin/data-table-column-header";
import { ProductsBulkActions } from "@/components/admin/products-bulk-actions";
import type { DataTableConfig, PaginationState, DataTableFilter } from "@/lib/admin-table-types";
import type { LegacyColumnDef } from "@tanstack/react-table/legacy";
import type { RowSelectionState } from "@tanstack/react-table";

export interface AdminProductRow {
  id: string;
  name: string;
  slug: string;
  type: string;
  status: string;
  price: number;
  variants: number;
  stock: number;
}

const columns: LegacyColumnDef<AdminProductRow>[] = [
  {
    accessorKey: "name",
    header: () => <DataTableColumnHeader sortField="name" title="Name" />,
  },
  {
    accessorKey: "type",
    header: () => <DataTableColumnHeader sortField="type" title="Type" />,
  },
  {
    accessorKey: "status",
    header: () => <DataTableColumnHeader sortField="status" title="Status" />,
    cell: ({ row }) => <Badge variant="outline">{row.original.status}</Badge>,
  },
  {
    accessorKey: "price",
    header: () => <DataTableColumnHeader sortField="price" title="Price" />,
    cell: ({ row }) => formatPrice(row.original.price, "JPY"),
  },
  { accessorKey: "variants", header: "Variants" },
  { accessorKey: "stock", header: "Stock" },
  {
    id: "actions",
    cell: ({ row }) => (
      <Button asChild variant="outline" size="sm">
        <Link href={`/admin/products/${row.original.id}/edit`}>Edit</Link>
      </Button>
    ),
  },
];

interface ProductsTableProps {
  data: AdminProductRow[];
  pagination: PaginationState;
  searchParams: Record<string, string>;
}

const filters: DataTableFilter[] = [
  {
    id: "status",
    label: "Status",
    options: [
      { label: "Draft", value: "DRAFT" },
      { label: "Active", value: "ACTIVE" },
      { label: "Archived", value: "ARCHIVED" },
    ],
  },
  {
    id: "type",
    label: "Type",
    options: [
      { label: "Manga", value: "MANGA" },
      { label: "Light Novel", value: "LIGHT_NOVEL" },
      { label: "Merch", value: "MERCH" },
    ],
  },
];

export function ProductsTable({ data, pagination, searchParams }: ProductsTableProps) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id]);

  const config: DataTableConfig<AdminProductRow> = {
    columns,
    data,
    pagination,
    filters,
    activeFilters: {
      ...(searchParams.status ? { status: searchParams.status } : {}),
      ...(searchParams.type ? { type: searchParams.type } : {}),
    },
    searchKey: "q",
    searchPlaceholder: "Search products...",
    basePath: "/admin/products",
    enableBulkActions: true,
  };

  return (
    <div className="space-y-4">
      <ProductsBulkActions
        selectedIds={selectedIds}
        pageRowCount={data.length}
        filter={{
          ...(searchParams.q ? { q: searchParams.q } : {}),
          ...(searchParams.status ? { status: searchParams.status } : {}),
          ...(searchParams.type ? { type: searchParams.type } : {}),
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
