"use client";

import { useState } from "react";
import { flexRender, type RowSelectionState } from "@tanstack/react-table";
import { useLegacyTable, getCoreRowModel } from "@tanstack/react-table/legacy";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";
import type { DataTableConfig } from "@/lib/admin-table-types";

interface DataTableProps<TData> {
  config: DataTableConfig<TData>;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: React.Dispatch<React.SetStateAction<RowSelectionState>>;
}

export function DataTable<TData>({ config, rowSelection: controlledSelection, onRowSelectionChange }: DataTableProps<TData>) {
  const {
    columns,
    data,
    pagination,
    filters,
    activeFilters,
    searchKey,
    searchPlaceholder,
    basePath,
    enableBulkActions = false,
  } = config;

  const [internalSelection, setInternalSelection] = useState<RowSelectionState>({});
  const rowSelection = controlledSelection ?? internalSelection;
  const setRowSelection = onRowSelectionChange ?? setInternalSelection;

  const tableColumns = enableBulkActions
    ? [
        {
          id: "select",
          header: ({
            table,
          }: {
            table: {
              getIsAllPageRowsSelected: () => boolean;
              getIsSomePageRowsSelected: () => boolean;
              toggleAllPageRowsSelected: (value: boolean) => void;
            };
          }) => (
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && "indeterminate")
              }
              onCheckedChange={(value) =>
                table.toggleAllPageRowsSelected(!!value)
              }
              aria-label="Select all"
            />
          ),
          cell: ({
            row,
          }: {
            row: {
              getIsSelected: () => boolean;
              toggleSelected: (value: boolean) => void;
            };
          }) => (
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
            />
          ),
          enableSorting: false,
          enableHiding: false,
        },
        ...columns,
      ]
    : columns;

  const table = useLegacyTable({
    data: data as never,
    columns: tableColumns as never,
    state: {
      rowSelection,
    },
    getRowId: (row: { id: string }) => row.id,
    enableRowSelection: enableBulkActions,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    // manualPagination: true,
  });

  return (
    <div className="space-y-4">
      <DataTableToolbar
        filters={filters}
        activeFilters={activeFilters}
        searchKey={searchKey}
        searchPlaceholder={searchPlaceholder}
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={tableColumns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination pagination={pagination} basePath={basePath} />
    </div>
  );
}
