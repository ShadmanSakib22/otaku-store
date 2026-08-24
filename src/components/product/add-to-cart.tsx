"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";
import { ShoppingCart } from "lucide-react";

export function AddToCart({
  variantId,
  disabled,
}: {
  variantId: string;
  disabled?: boolean;
}) {
  return (
    <Button
      size="lg"
      disabled={disabled}
      className="w-full text-base"
      onClick={() => {
        useCartStore.getState().addItem(variantId, 1);
        toast.success("Added to cart");
      }}
    >
      <ShoppingCart className="mr-2 size-4" />
      Add to cart
    </Button>
  );
}
