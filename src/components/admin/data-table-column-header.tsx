"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ArrowDownIcon, ArrowUpIcon, ArrowUpDownIcon } from "lucide-react";

interface DataTableColumnHeaderProps {
  sortField: string;
  title: string;
  className?: string;
  sortable?: boolean;
}

export function DataTableColumnHeader({
  sortField,
  title,
  className,
  sortable = true,
}: DataTableColumnHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (!sortable) {
    return <div className={cn("flex items-center", className)}>{title}</div>;
  }

  const currentSort = searchParams.get("sort");
  const [field, direction] = currentSort?.split("-") ?? [];
  const isSorted = field === sortField;
  const isAsc = isSorted && direction === "asc";
  const isDesc = isSorted && direction === "desc";

  const handleSort = (newDirection: "asc" | "desc" | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newDirection) {
      params.set("sort", `${sortField}-${newDirection}`);
    } else {
      params.delete("sort");
    }
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className={cn("flex items-center", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent"
          >
            <span>{title}</span>
            {isDesc ? (
              <ArrowDownIcon className="ml-2 h-4 w-4" />
            ) : isAsc ? (
              <ArrowUpIcon className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDownIcon className="ml-2 h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => handleSort("asc")}>
            <ArrowUpIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSort("desc")}>
            <ArrowDownIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Desc
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleSort(null)}>
            <ArrowUpDownIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Reset
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
