"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";

export function AddToCart({ variantId, disabled }: { variantId: string; disabled?: boolean }) {
  return (
    <Button
      size="lg"
      disabled={disabled}
      onClick={() => {
        useCartStore.getState().addItem(variantId, 1);
        toast.success("Added to cart");
      }}
    >
      Add to cart
    </Button>
  );
}
