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
  return (
    <div className="flex flex-wrap gap-2">
      {variants.map((variant) => {
        const disabled = deriveStockStatus(variant.quantity, variant.lowStockAt) === "OUT_OF_STOCK";
        return (
          <Button
            key={variant.id}
            type="button"
            variant={variant.id === selectedId ? "default" : "outline"}
            disabled={disabled}
            onClick={() => onSelect(variant.id)}
          >
            {variant.name}
          </Button>
        );
      })}
    </div>
  );
}
