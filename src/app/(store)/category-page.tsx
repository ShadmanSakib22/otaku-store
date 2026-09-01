import { getCatalogue, getFacets, parseCatalogueParams } from "@/lib/catalogue";
import { ProductGrid } from "@/components/product/product-grid";
import { FilterSidebar } from "@/components/product/filter-sidebar";
import { SortSelect } from "@/components/product/sort-select";
import { CataloguePagination } from "@/components/product/catalogue-pagination";

export default async function CategoryPage({
  base,
  categorySlug,
  title,
  type,
  searchParams,
}: {
  base: string;
  categorySlug: string;
  title: string;
  type?: "MANGA" | "LIGHT_NOVEL" | "MERCH";
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = parseCatalogueParams(await searchParams);
  const [result, facets] = await Promise.all([
    getCatalogue(params, categorySlug),
    getFacets(type),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <SortSelect params={params} base={base} />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-[220px_1fr]">
        <FilterSidebar facets={facets} params={params} base={base} type={type} />
        <div>
          <p className="mb-4 text-sm text-muted-foreground">
            {result.total} result{result.total === 1 ? "" : "s"}
          </p>
          <ProductGrid products={result.products} />
          <CataloguePagination
            totalPages={result.totalPages}
            currentPage={result.currentPage}
            base={base}
            params={params}
          />
        </div>
      </div>
    </div>
  );
}
