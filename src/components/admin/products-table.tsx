"use client";

import Link from "next/link";
import { flexRender } from "@tanstack/react-table";
import { useLegacyTable, getCoreRowModel, type LegacyColumnDef } from "@tanstack/react-table/legacy";
import { formatPrice } from "@/lib/format";
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
  { accessorKey: "name", header: "Name" },
  { accessorKey: "type", header: "Type" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <Badge variant="outline">{row.original.status}</Badge>,
  },
  {
    accessorKey: "price",
    header: "Price",
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

export function ProductsTable({ data }: { data: AdminProductRow[] }) {
  const table = useLegacyTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
