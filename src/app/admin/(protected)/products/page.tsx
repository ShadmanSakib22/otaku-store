import Link from "next/link";
import { getAdminProducts } from "@/lib/admin-queries";
import { ProductsTable } from "@/components/admin/products-table";
import { Button } from "@/components/ui/button";

export const revalidate = 0;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const raw = await searchParams;
  const page = typeof raw.page === "string" ? Number(raw.page) : 1;
  const pageSize = typeof raw.pageSize === "string" ? Number(raw.pageSize) : 25;
  const q = typeof raw.q === "string" ? raw.q : "";
  const status = typeof raw.status === "string" ? raw.status : undefined;
  const type = typeof raw.type === "string" ? raw.type : undefined;
  const sort = typeof raw.sort === "string" ? raw.sort : "createdAt-desc";

  const result = await getAdminProducts({ page, pageSize, q, status, type, sort });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Products</h1>
        <Button asChild>
          <Link href="/admin/products/new">New Product</Link>
        </Button>
      </div>
      <ProductsTable
        data={result.products}
        pagination={{
          page: result.currentPage,
          pageSize: result.pageSize,
          total: result.total,
          totalPages: result.totalPages,
        }}
        searchParams={{
          ...(q ? { q } : {}),
          ...(status ? { status } : {}),
          ...(type ? { type } : {}),
          ...(sort ? { sort } : {}),
        }}
      />
    </div>
  );
}
