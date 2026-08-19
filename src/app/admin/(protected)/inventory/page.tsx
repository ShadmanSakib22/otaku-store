import { getInventory } from "@/lib/admin-queries";
import { InventoryTable } from "@/components/admin/inventory-table";
import { parseCatalogueParams } from "@/lib/catalogue";
import { CataloguePagination } from "@/components/product/catalogue-pagination";

export const revalidate = 0;

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = parseCatalogueParams(await searchParams);
  const result = await getInventory({ page: params.page, q: params.q });

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-bold">Inventory</h1>
      <InventoryTable rows={result.rows} />
      <CataloguePagination
        totalPages={result.totalPages}
        currentPage={result.currentPage}
        base="/admin/inventory"
        params={params}
      />
    </div>
  );
}