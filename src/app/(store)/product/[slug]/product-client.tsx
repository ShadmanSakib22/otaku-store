"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/format";
import { deriveStockStatus } from "@/lib/stock";
import { VariantPicker } from "@/components/product/variant-picker";
import { AddToCart } from "@/components/product/add-to-cart";
import { StockBadge } from "@/components/product/stock-badge";

export function ProductVariantClient({
  variants,
  defaultVariantId,
}: {
  variants: { id: string; name: string; size: string | null; color: string | null; price: number; quantity: number; lowStockAt: number }[];
  defaultVariantId: string;
}) {
  const [variantId, setVariantId] = useState(defaultVariantId);
  const variant = variants.find((v) => v.id === variantId) ?? variants[0];
  const status = variant
    ? deriveStockStatus(variant.quantity, variant.lowStockAt)
    : "OUT_OF_STOCK";

  if (!variant) {
    return <StockBadge status="OUT_OF_STOCK" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-2xl font-bold">{formatPrice(variant.price, "JPY")}</p>
        <StockBadge status={status} />
      </div>
      <VariantPicker
        variants={variants}
        selectedId={variant.id}
        onSelect={setVariantId}
      />
      <AddToCart variantId={variant.id} disabled={status === "OUT_OF_STOCK"} />
    </div>
  );
}
