"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export function MobileFilterSheet({
  activeCount,
  children,
}: {
  activeCount: number;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Close the drawer whenever the URL (filters/sort/page) changes, since
  // selecting a filter navigates rather than mutating local state.
  useEffect(() => {
    setOpen(false);
  }, [pathname, searchParams]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full justify-center gap-2 sm:w-auto"
        onClick={() => setOpen(true)}
      >
        <SlidersHorizontal className="size-3.5" />
        Filters
        {activeCount > 0 ? (
          <span className="ml-0.5 flex size-4 items-center justify-center bg-primary text-[10px] font-semibold text-primary-foreground">
            {activeCount}
          </span>
        ) : null}
      </Button>
      <SheetContent side="bottom" className="flex max-h-[85vh] flex-col rounded-none p-0">
        <SheetHeader className="shrink-0 border-b border-border px-4 py-3">
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
