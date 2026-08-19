import Link from "next/link";
import { getOrders } from "@/lib/admin-queries";
import { parseCatalogueParams } from "@/lib/catalogue";
import { OrdersTable } from "@/components/admin/orders-table";
import { CataloguePagination } from "@/components/product/catalogue-pagination";
import { Button } from "@/components/ui/button";
import { OrderStatus, PaymentStatus } from "@/generated/prisma/client";

export const revalidate = 0;

function ordersUrl(status?: string, paymentStatus?: string, page = 1) {
  const query = new URLSearchParams();
  if (status) query.set("status", status);
  if (paymentStatus) query.set("paymentStatus", paymentStatus);
  if (page > 1) query.set("page", String(page));
  const qs = query.toString();
  return qs ? `/admin/orders?${qs}` : "/admin/orders";
}

function FilterPill({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Button asChild variant={active ? "default" : "outline"} size="sm">
      <Link href={href}>{label}</Link>
    </Button>
  );
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const raw = await searchParams;
  const params = parseCatalogueParams(raw);
  const status = typeof raw.status === "string" ? raw.status : undefined;
  const paymentStatus =
    typeof raw.paymentStatus === "string" ? raw.paymentStatus : undefined;
  const result = await getOrders({ page: params.page, status, paymentStatus });
  const orders = result.orders.map((o) => ({ ...o, total: Number(o.total) }));

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-bold">Orders</h1>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Status</span>
        <FilterPill
          href={ordersUrl(undefined, paymentStatus)}
          label="All"
          active={!status}
        />
        {Object.values(OrderStatus).map((s) => (
          <FilterPill
            key={s}
            href={ordersUrl(s, paymentStatus)}
            label={s}
            active={status === s}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Payment</span>
        <FilterPill
          href={ordersUrl(status, undefined)}
          label="All"
          active={!paymentStatus}
        />
        {Object.values(PaymentStatus).map((s) => (
          <FilterPill
            key={s}
            href={ordersUrl(status, s)}
            label={s}
            active={paymentStatus === s}
          />
        ))}
      </div>

      <OrdersTable orders={orders} />

      <CataloguePagination
        totalPages={result.totalPages}
        currentPage={result.currentPage}
        base="/admin/orders"
        params={params}
        extraParams={{
          ...(status ? { status } : {}),
          ...(paymentStatus ? { paymentStatus } : {}),
        }}
      />
    </div>
  );
}