"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";
import type { DataTableFilter } from "@/lib/admin-table-types";
import { useState, useRef, useCallback, useEffect } from "react";

interface DataTableToolbarProps {
  filters?: DataTableFilter[];
  activeFilters?: Record<string, string>;
  searchKey?: string;
  searchPlaceholder?: string;
}

export function DataTableToolbar({
  filters,
  activeFilters = {},
  searchKey,
  searchPlaceholder = "Search...",
}: DataTableToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialValue = searchParams.get(searchKey ?? "q") ?? "";
  const [searchValue, setSearchValue] = useState(initialValue);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const urlValue = searchParams.get(searchKey ?? "q") ?? "";
    // Sync the input with external URL changes (back button, manual nav).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchValue((prev) => (prev === urlValue ? prev : urlValue));
  }, [searchParams, searchKey]);

  const pushSearch = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(searchKey ?? "q", value);
      } else {
        params.delete(searchKey ?? "q");
      }
      params.delete("page");
      router.replace(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams, searchKey]
  );

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      pushSearch(value);
    }, 300);
  };

  const handleFilterChange = (filterId: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(filterId, value);
    } else {
      params.delete(filterId);
    }
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`);
  };

  const hasActiveFilters = Object.keys(activeFilters).length > 0 || searchValue;

  const clearFilters = () => {
    setSearchValue("");
    router.replace(pathname);
  };

  return (
    <div className="flex items-center gap-2">
      {searchKey && (
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />
      )}
      {filters?.map((filter) => (
        <Select
          key={filter.id}
          value={activeFilters[filter.id] ?? "all"}
          onValueChange={(value) => handleFilterChange(filter.id, value)}
        >
          <SelectTrigger className="h-8 w-[130px]">
            <SelectValue placeholder={filter.label} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All {filter.label}</SelectItem>
            {filter.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
      {hasActiveFilters && (
        <Button variant="ghost" onClick={clearFilters} className="h-8 px-2 lg:px-3">
          Reset
          <XIcon className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
