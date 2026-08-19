import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { buildCatalogueUrl, type CatalogueParams } from "@/lib/catalogue";

export function CataloguePagination({
  totalPages,
  currentPage,
  base,
  params,
  extraParams = {},
}: {
  totalPages: number;
  currentPage: number;
  base: string;
  params: CatalogueParams;
  extraParams?: Record<string, string>;
}) {
  if (totalPages <= 1) return null;

  const pageUrl = (page: number) => {
    const url = new URL(buildCatalogueUrl(base, params, { page }), "http://local");
    for (const [key, value] of Object.entries(extraParams)) {
      if (value) url.searchParams.set(key, value);
    }
    return url.pathname + url.search;
  };

  return (
    <Pagination className="mt-8">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={pageUrl(Math.max(1, currentPage - 1))}
            aria-disabled={currentPage <= 1}
          />
        </PaginationItem>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
          .map((p) => (
            <PaginationItem key={p}>
              <PaginationLink href={pageUrl(p)} isActive={p === currentPage}>
                {p}
              </PaginationLink>
            </PaginationItem>
          ))}
        <PaginationItem>
          <PaginationNext
            href={pageUrl(Math.min(totalPages, currentPage + 1))}
            aria-disabled={currentPage >= totalPages}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}