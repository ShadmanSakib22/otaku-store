import { getInventory } from "@/lib/admin-queries";
import { InventoryTable } from "@/components/admin/inventory-table";

export const revalidate = 0;

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const raw = await searchParams;
  const page = typeof raw.page === "string" ? Number(raw.page) : 1;
  const pageSize = typeof raw.pageSize === "string" ? Number(raw.pageSize) : 25;
  const q = typeof raw.q === "string" ? raw.q : "";
  const sort = typeof raw.sort === "string" ? raw.sort : "updatedAt-desc";

  const result = await getInventory({ page, pageSize, q, sort });

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-bold">Inventory</h1>
      <InventoryTable
        data={result.rows}
        pagination={{
          page: result.currentPage,
          pageSize: result.pageSize,
          total: result.total,
          totalPages: result.totalPages,
        }}
        searchParams={{
          ...(q ? { q } : {}),
          ...(sort ? { sort } : {}),
        }}
      />
    </div>
  );
}
