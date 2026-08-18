"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { buildCatalogueUrl, type CatalogueParams } from "@/lib/catalogue-url";
import { SORTS } from "@/lib/validation/search";

const SORT_LABELS: Record<string, string> = {
  relevance: "Relevance",
  newest: "Newest",
  "price-asc": "Price: Low → High",
  "price-desc": "Price: High → Low",
  "best-selling": "Best Selling",
};

export function SortSelect({
  params,
  base,
}: {
  params: CatalogueParams;
  base: string;
}) {
  const router = useRouter();

  return (
    <Select
      value={params.sort}
      onValueChange={(value) =>
        router.push(
          buildCatalogueUrl(base, params, { sort: value as (typeof SORTS)[number], page: 1 })
        )
      }
    >
      <SelectTrigger className="w-[180px]" aria-label="Sort products">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SORTS.map((sort) => (
          <SelectItem key={sort} value={sort}>
            {SORT_LABELS[sort]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}