import { searchProducts } from "@/lib/search/search";
import { parseCatalogueParams } from "@/lib/catalogue";
import { getFacets } from "@/lib/catalogue";
import { SearchInput } from "./search-input";
import { ProductGrid } from "@/components/product/product-grid";
import { FilterSidebar } from "@/components/product/filter-sidebar";
import { SortSelect } from "@/components/product/sort-select";
import { CataloguePagination } from "@/components/product/catalogue-pagination";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = parseCatalogueParams(await searchParams);
  const [result, facets] = await Promise.all([
    searchProducts(params),
    getFacets(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-3xl font-bold">Search</h1>
        <SearchInput />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-[220px_1fr]">
        <FilterSidebar facets={facets} params={params} base="/search" />
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {result.total} result{result.total === 1 ? "" : "s"}
            </p>
            <SortSelect params={params} base="/search" />
          </div>
          <ProductGrid products={result.products} />
          <CataloguePagination
            totalPages={result.totalPages}
            currentPage={result.currentPage}
            base="/search"
            params={params}
          />
        </div>
      </div>
    </div>
  );
}
