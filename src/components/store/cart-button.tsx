"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";

export function CartButton({
  onClick,
}: {
  onClick: () => void;
}) {
  const count = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0)
  );

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      aria-label={`Cart (${count})`}
      onClick={onClick}
    >
      <ShoppingCart />
      {count > 0 ? (
        <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
          {count > 9 ? "9+" : count}
        </span>
      ) : null}
    </Button>
  );
}
