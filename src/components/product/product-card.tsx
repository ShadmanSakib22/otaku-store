import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";

export interface ProductListItem {
  id: string;
  slug: string;
  name: string;
  type: string;
  summary: string | null;
  price: number;
  stockStatus: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
  image: string | null;
  alt: string;
  categorySlug: string;
  lifetimeSales: number;
  releaseDate: Date | null;
}

const STOCK_LABEL: Record<string, string> = {
  IN_STOCK: "In stock",
  LOW_STOCK: "Low stock",
  OUT_OF_STOCK: "Sold out",
};

const STOCK_COLOR: Record<string, string> = {
  IN_STOCK: "bg-emerald-500/90",
  LOW_STOCK: "bg-amber-500/90",
  OUT_OF_STOCK: "bg-zinc-800/90",
};

export function ProductCard({ product }: { product: ProductListItem }) {
  const isOut = product.stockStatus === "OUT_OF_STOCK";

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group relative flex flex-col"
    >
      <div className="relative aspect-[3/4] overflow-[var(--radius)] bg-muted">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.alt}
            fill
            sizes="(min-width: 1280px) 20vw, (min-width: 768px) 30vw, 50vw"
            className={`object-cover transition-transform duration-300 ease-out group-hover:scale-105 ${isOut ? "opacity-60" : ""}`}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No image
          </div>
        )}

        {/* Category pill */}
        <span className="absolute top-2 left-2 rounded-none bg-background/80 px-2 py-0.5 text-[11px] font-medium backdrop-blur-sm">
          {product.categorySlug}
        </span>

        {/* Stock badge */}
        <span
          className={`absolute top-2 right-2 rounded-none px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm ${STOCK_COLOR[product.stockStatus]}`}
        >
          {STOCK_LABEL[product.stockStatus]}
        </span>

        {/* Name + price overlay */}
        <div className="absolute inset-x-0 bottom-0 bg-background px-3 py-2.5">
          <h3 className="text-sm font-semibold leading-snug line-clamp-2">
            {product.name}
          </h3>
          <p className="mt-0.5 text-base font-bold tabular-nums">
            {formatPrice(product.price, "JPY")}
          </p>
        </div>

        {/* Out-of-stock overlay bar */}
        {isOut ? (
          <div className="absolute inset-x-0 bottom-0 bg-zinc-900/80 py-1.5 text-center text-xs font-medium text-white backdrop-blur-sm">
            Sold out
          </div>
        ) : null}
      </div>
    </Link>
  );
}
