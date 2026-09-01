import Link from "next/link";
import { X } from "lucide-react";
import { buildCatalogueUrl, type CatalogueParams } from "@/lib/catalogue-url";

export type ActiveFilter = {
  key: "genre" | "author" | "publisher" | "price";
  label: string;
};

export function buildActiveFilters(
  params: CatalogueParams,
  facets: {
    genres: { slug: string; name: string }[];
    authors: { slug: string; name: string }[];
    publishers: { slug: string; name: string }[];
  }
): ActiveFilter[] {
  const filters: ActiveFilter[] = [];
  if (params.genre) {
    const name = facets.genres.find((g) => g.slug === params.genre)?.name ?? params.genre;
    filters.push({ key: "genre", label: name });
  }
  if (params.author) {
    const name = facets.authors.find((a) => a.slug === params.author)?.name ?? params.author;
    filters.push({ key: "author", label: name });
  }
  if (params.publisher) {
    const name =
      facets.publishers.find((p) => p.slug === params.publisher)?.name ?? params.publisher;
    filters.push({ key: "publisher", label: name });
  }
  if (params.price) {
    const [min, max] = params.price.split("-");
    filters.push({ key: "price", label: `¥${min || 0} – ¥${max || "∞"}` });
  }
  return filters;
}

export function ActiveFilterChips({
  base,
  params,
  filters,
}: {
  base: string;
  params: CatalogueParams;
  filters: ActiveFilter[];
}) {
  if (filters.length === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {filters.map((filter) => {
        const href = buildCatalogueUrl(base, params, { [filter.key]: "" });
        return (
          <Link
            key={filter.key}
            href={href}
            className="group/chip flex items-center gap-1.5 border border-border bg-background px-2.5 py-1 text-xs text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <span>{filter.label}</span>
            <X className="size-3 text-muted-foreground group-hover/chip:text-primary" />
          </Link>
        );
      })}
      <Link
        href={base}
        className="px-2 py-1 text-xs text-muted-foreground underline-offset-2 hover:text-primary hover:underline"
      >
        Clear all
      </Link>
    </div>
  );
}
