import Link from "next/link";
import { getAdminProducts } from "@/lib/admin-queries";
import { ProductsTable } from "@/components/admin/products-table";
import { Button } from "@/components/ui/button";
import { CataloguePagination } from "@/components/product/catalogue-pagination";
import { parseCatalogueParams } from "@/lib/catalogue";

export const revalidate = 0;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = parseCatalogueParams(await searchParams);
  const result = await getAdminProducts({ page: params.page, q: params.q });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Products</h1>
        <Button asChild>
          <Link href="/admin/products/new">New Product</Link>
        </Button>
      </div>
      <ProductsTable data={result.products} />
      <CataloguePagination
        totalPages={result.totalPages}
        currentPage={result.currentPage}
        base="/admin/products"
        params={params}
      />
    </div>
  );
}
