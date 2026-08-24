import Link from "next/link";
import { buildCatalogueUrl, type CatalogueParams } from "@/lib/catalogue";
import { PriceRangeFilter } from "./price-range-filter";

export function FilterSidebar({
  facets,
  params,
  base,
}: {
  facets: { genres: { slug: string; name: string }[]; authors: { slug: string; name: string }[]; publishers: { slug: string; name: string }[] };
  params: CatalogueParams;
  base: string;
}) {
  return (
    <aside className="space-y-6 text-sm">
      <FilterGroup
        title="Genre"
        base={base}
        params={params}
        items={facets.genres.map((g) => ({ value: g.slug, label: g.name }))}
        active={params.genre}
        filterKey="genre"
      />
      <FilterGroup
        title="Author"
        base={base}
        params={params}
        items={facets.authors.map((a) => ({ value: a.slug, label: a.name }))}
        active={params.author}
        filterKey="author"
      />
      <FilterGroup
        title="Publisher"
        base={base}
        params={params}
        items={facets.publishers.map((p) => ({ value: p.slug, label: p.name }))}
        active={params.publisher}
        filterKey="publisher"
      />
      <div className="space-y-2">
        <h3 className="font-medium">Price Range</h3>
        <PriceRangeFilter base={base} currentPrice={params.price ?? ""} />
      </div>
    </aside>
  );
}

function FilterGroup({
  title,
  base,
  params,
  items,
  active,
  filterKey,
}: {
  title: string;
  base: string;
  params: CatalogueParams;
  items: { value: string; label: string }[];
  active: string;
  filterKey: "genre" | "author" | "publisher";
}) {
  return (
    <div className="space-y-2">
      <h3 className="font-medium">{title}</h3>
      <ul className="space-y-1">
        {items.map((item) => {
          const isActive = active === item.value;
          const href = buildCatalogueUrl(base, params, {
            ...(filterKey === "genre" ? { genre: isActive ? "" : item.value } : {}),
            ...(filterKey === "author" ? { author: isActive ? "" : item.value } : {}),
            ...(filterKey === "publisher" ? { publisher: isActive ? "" : item.value } : {}),
          });
          return (
            <li key={item.value}>
              <Link
                href={href}
                className={isActive ? "font-semibold text-primary" : "text-muted-foreground hover:text-foreground"}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
