import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import { StockBadge } from "./stock-badge";

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

export function ProductCard({ product }: { product: ProductListItem }) {
  return (
    <Link href={`/product/${product.slug}`} className="group">
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative aspect-[3/4] bg-muted">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.alt}
              fill
              sizes="(min-width: 1280px) 20vw, (min-width: 768px) 30vw, 50vw"
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : null}
        </div>
        <CardContent className="space-y-1 p-4">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="outline">{product.categorySlug}</Badge>
            <StockBadge status={product.stockStatus} />
          </div>
          <h3 className="font-medium leading-tight">{product.name}</h3>
          <p className="font-semibold">{formatPrice(product.price, "JPY")}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
