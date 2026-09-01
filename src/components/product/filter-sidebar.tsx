import { buildCatalogueUrl, type CatalogueParams } from "@/lib/catalogue-url";
import { PriceRangeFilter } from "./price-range-filter";
import { FilterGroup } from "./filter-group";
import { FilterSection } from "./filter-section";
import { ActiveFilterChips, buildActiveFilters } from "./active-filter-chips";
import { MobileFilterSheet } from "./mobile-filter-sheet";

type Facets = {
  genres: { slug: string; name: string }[];
  authors: { slug: string; name: string }[];
  publishers: { slug: string; name: string }[];
  categories: { slug: string; name: string }[];
  languages: { value: string; label: string }[];
  sizes: { value: string; label: string }[];
  colors: { value: string; label: string }[];
};

export function FilterSidebar({
  facets,
  params,
  base,
  type,
}: {
  facets: Facets;
  params: CatalogueParams;
  base: string;
  type?: "MANGA" | "LIGHT_NOVEL" | "MERCH";
}) {
  const activeFilters = buildActiveFilters(params, facets);

  const isMerch = type === "MERCH";

  const panel = (
    <div>
      {isMerch ? (
        <>
          <FilterGroup
            title="Category"
            base={base}
            params={params}
            items={facets.categories.map((c) => ({ value: c.slug, label: c.name }))}
            active={params.genre}
            filterKey="genre"
            defaultOpen
          />
          <FilterGroup
            title="Size"
            base={base}
            params={params}
            items={facets.sizes}
            active={params.size}
            filterKey="size"
            defaultOpen={!!params.size}
          />
          <FilterGroup
            title="Color"
            base={base}
            params={params}
            items={facets.colors}
            active={params.color}
            filterKey="color"
            defaultOpen={!!params.color}
          />
        </>
      ) : (
        <>
          <FilterGroup
            title="Genre"
            base={base}
            params={params}
            items={facets.genres.map((g) => ({ value: g.slug, label: g.name }))}
            active={params.genre}
            filterKey="genre"
            defaultOpen
          />
          <FilterGroup
            title="Author"
            base={base}
            params={params}
            items={facets.authors.map((a) => ({ value: a.slug, label: a.name }))}
            active={params.author}
            filterKey="author"
            defaultOpen={!!params.author}
          />
          <FilterGroup
            title="Publisher"
            base={base}
            params={params}
            items={facets.publishers.map((p) => ({ value: p.slug, label: p.name }))}
            active={params.publisher}
            filterKey="publisher"
            defaultOpen={!!params.publisher}
          />
          <FilterGroup
            title="Language"
            base={base}
            params={params}
            items={facets.languages}
            active={params.language}
            filterKey="language"
            defaultOpen={!!params.language}
          />
        </>
      )}
      {!isMerch && !type && (
        <>
          <FilterGroup
            title="Category"
            base={base}
            params={params}
            items={facets.categories.map((c) => ({ value: c.slug, label: c.name }))}
            active={params.genre}
            filterKey="genre"
            defaultOpen={!!params.genre}
          />
          <FilterGroup
            title="Size"
            base={base}
            params={params}
            items={facets.sizes}
            active={params.size}
            filterKey="size"
            defaultOpen={!!params.size}
          />
          <FilterGroup
            title="Color"
            base={base}
            params={params}
            items={facets.colors}
            active={params.color}
            filterKey="color"
            defaultOpen={!!params.color}
          />
        </>
      )}
      <FilterSection
        title="Price Range"
        defaultOpen
        onClear={
          params.price
            ? buildCatalogueUrl(base, params, { price: "" })
            : undefined
        }
      >
        <PriceRangeFilter base={base} currentPrice={params.price ?? ""} />
      </FilterSection>
    </div>
  );

  return (
    <>
      {/* Mobile: trigger button + bottom sheet, shown below md */}
      <div className="md:hidden">
        <MobileFilterSheet activeCount={activeFilters.length}>
          {panel}
        </MobileFilterSheet>
        <ActiveFilterChips
          base={base}
          params={params}
          filters={activeFilters}
        />
      </div>

      {/* Desktop: sticky sidebar, shown at md and up */}
      <aside className="hidden text-sm md:block">
        <div className="sticky top-20">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground">
            Filters
          </h2>
          <ActiveFilterChips
            base={base}
            params={params}
            filters={activeFilters}
          />
          {panel}
        </div>
      </aside>
    </>
  );
}
