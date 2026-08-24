"use client";

import { Button } from "@/components/ui/button";
import { deriveStockStatus } from "@/lib/stock";

export interface VariantOption {
  id: string;
  name: string;
  size: string | null;
  color: string | null;
  price: number;
  quantity: number;
  lowStockAt: number;
}

export function VariantPicker({
  variants,
  selectedId,
  onSelect,
}: {
  variants: VariantOption[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  if (variants.length <= 1) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Edition</p>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => {
          const disabled =
            deriveStockStatus(variant.quantity, variant.lowStockAt) ===
            "OUT_OF_STOCK";
          const selected = variant.id === selectedId;
          return (
            <Button
              key={variant.id}
              type="button"
              variant={selected ? "default" : "outline"}
              disabled={disabled}
              onClick={() => onSelect(variant.id)}
              className="min-w-[4rem]"
            >
              {variant.name}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
