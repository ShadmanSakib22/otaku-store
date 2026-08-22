"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import type { PaginationState } from "@/lib/admin-table-types";

interface DataTablePaginationProps {
  pagination: PaginationState;
  basePath: string;
  pageSizeOptions?: number[];
}

export function DataTablePagination({
  pagination,
  basePath,
  pageSizeOptions = [10, 25, 50, 100],
}: DataTablePaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { page, pageSize, total, totalPages } = pagination;

  const createPageUrl = (newPage: number, newPageSize?: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newPage > 1) {
      params.set("page", String(newPage));
    } else {
      params.delete("page");
    }
    if (newPageSize !== undefined) {
      if (newPageSize !== 25) {
        params.set("pageSize", String(newPageSize));
      } else {
        params.delete("pageSize");
      }
    }
    return `${basePath}?${params.toString()}`;
  };

  const handlePageSizeChange = (value: string) => {
    const newPageSize = Number(value);
    router.replace(createPageUrl(1, newPageSize));
  };

  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex-1 text-sm text-muted-foreground">
        {total} total row{total !== 1 ? "s" : ""}
      </div>
      <div className="flex items-center gap-6 lg:gap-8">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={String(pageSize)} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {page} of {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => router.push(createPageUrl(page - 1))}
            disabled={page <= 1}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => router.push(createPageUrl(page + 1))}
            disabled={page >= totalPages}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
