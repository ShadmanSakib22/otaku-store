"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FilterSection } from "./filter-section";
import { buildCatalogueUrl, type CatalogueParams } from "@/lib/catalogue-url";

const SEARCHABLE_THRESHOLD = 8;

export function FilterGroup({
  title,
  base,
  params,
  items,
  active,
  filterKey,
  defaultOpen = true,
}: {
  title: string;
  base: string;
  params: CatalogueParams;
  items: { value: string; label: string }[];
  active: string;
  filterKey: "genre" | "author" | "publisher";
  defaultOpen?: boolean;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.trim().toLowerCase();
    return items.filter((item) => item.label.toLowerCase().includes(q));
  }, [items, query]);

  const clearHref = active
    ? buildCatalogueUrl(base, params, { [filterKey]: "" })
    : undefined;

  if (items.length === 0) return null;

  return (
    <FilterSection title={title} defaultOpen={defaultOpen} onClear={clearHref}>
      {items.length > SEARCHABLE_THRESHOLD ? (
        <div className="relative mb-2.5">
          <Search className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${title.toLowerCase()}...`}
            className="h-8 rounded-none pl-7 text-xs"
            aria-label={`Search ${title}`}
          />
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <p className="text-xs text-muted-foreground">No matches.</p>
      ) : (
        <ScrollArea className={filtered.length > SEARCHABLE_THRESHOLD ? "h-72" : ""}>
          <ul className="space-y-0.5">
            {filtered.map((item) => {
            const isActive = active === item.value;
            const href = buildCatalogueUrl(base, params, {
              [filterKey]: isActive ? "" : item.value,
            });
            return (
              <li key={item.value}>
                <Link
                  href={href}
                  aria-current={isActive ? "true" : undefined}
                  className={
                    "group/option flex items-center gap-2 rounded-none px-1.5 py-1.5 text-sm transition-colors hover:bg-muted " +
                    (isActive
                      ? "font-medium text-primary"
                      : "text-muted-foreground hover:text-foreground")
                  }
                >
                  <span
                    aria-hidden
                    className={
                      "flex size-3.5 shrink-0 items-center justify-center border " +
                      (isActive
                        ? "border-primary bg-primary"
                        : "border-border bg-transparent group-hover/option:border-foreground/40")
                    }
                  >
                    {isActive ? (
                      <span className="size-1.5 bg-primary-foreground" />
                    ) : null}
                  </span>
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
          </ul>
        </ScrollArea>
      )}
    </FilterSection>
  );
}
