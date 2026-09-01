"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

export function FilterSection({
  title,
  defaultOpen = true,
  onClear,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  /** href to clear this section's filter; omitted when nothing is active */
  onClear?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="border-b border-border py-4 first:pt-0 last:border-b-0"
    >
      <div className="flex items-center justify-between gap-2">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="group/trigger flex flex-1 items-center justify-between gap-2 text-left"
            aria-expanded={open}
          >
            <span className="font-medium">{title}</span>
            <ChevronDown
              className={cn(
                "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                open && "rotate-180"
              )}
            />
          </button>
        </CollapsibleTrigger>
        {onClear ? (
          <a
            href={onClear}
            className="shrink-0 text-xs text-muted-foreground underline-offset-2 hover:text-primary hover:underline"
          >
            Clear
          </a>
        ) : null}
      </div>
      <CollapsibleContent className="overflow-hidden transition-[height] duration-200 ease-out data-[state=closed]:h-0 data-[state=open]:h-[var(--radix-collapsible-content-height)]">
        <div className="pt-3">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}
