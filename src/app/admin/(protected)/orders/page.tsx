import { getOrders } from "@/lib/admin-queries";
import { OrdersTable } from "@/components/admin/orders-table";

export const revalidate = 0;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const raw = await searchParams;
  const page = typeof raw.page === "string" ? Number(raw.page) : 1;
  const pageSize = typeof raw.pageSize === "string" ? Number(raw.pageSize) : 25;
  const status = typeof raw.status === "string" ? raw.status : undefined;
  const paymentStatus = typeof raw.paymentStatus === "string" ? raw.paymentStatus : undefined;
  const sort = typeof raw.sort === "string" ? raw.sort : "createdAt-desc";

  const result = await getOrders({ page, pageSize, status, paymentStatus, sort });
  const orders = result.orders.map((o) => ({ ...o, total: Number(o.total) }));

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-bold">Orders</h1>
      <OrdersTable
        data={orders}
        pagination={{
          page: result.currentPage,
          pageSize: result.pageSize,
          total: result.total,
          totalPages: result.totalPages,
        }}
        searchParams={{
          ...(status ? { status } : {}),
          ...(paymentStatus ? { paymentStatus } : {}),
          ...(sort ? { sort } : {}),
        }}
      />
    </div>
  );
}
