"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { previewCart } from "@/lib/actions/checkout";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerBody,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import type { CartLine } from "@/lib/cart";

export function CartDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const [lines, setLines] = useState<CartLine[]>([]);
  const [loading, setLoading] = useState(false);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);

  useEffect(() => {
    if (!open) return;
    if (items.length === 0) {
      setLines([]);
      return;
    }
    let active = true;
    setLoading(true);
    previewCart(items)
      .then(({ lines }) => {
        if (active) setLines(lines);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const displayLines = items.length === 0 ? [] : lines;

  const subtotal = displayLines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);

  function handleUpdateQuantity(variantId: string, qty: number) {
    if (qty <= 0) {
      removeItem(variantId);
      setLines((prev) => prev.filter((l) => l.variantId !== variantId));
    } else {
      updateQuantity(variantId, qty);
      setLines((prev) =>
        prev.map((l) => (l.variantId === variantId ? { ...l, quantity: qty } : l))
      );
    }
  }

  function handleRemove(variantId: string) {
    removeItem(variantId);
    setLines((prev) => prev.filter((l) => l.variantId !== variantId));
  }

  function handleClear() {
    clearCart();
    setLines([]);
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="border-none">
          <div className="flex items-center justify-between">
            <DrawerTitle className="flex items-center gap-2">
              <ShoppingBag className="size-5" />
              Shopping Cart ({totalItems} {totalItems === 1 ? "item" : "items"})
            </DrawerTitle>
        {displayLines.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleClear}
              >
                Clear
              </Button>
            )}
          </div>
          <DrawerDescription className="sr-only">
            Review your items before checkout.
          </DrawerDescription>
        </DrawerHeader>

        <DrawerBody className="max-h-[60vh] overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingBag className="mb-4 size-16 text-muted-foreground/30" />
              <p className="mb-4 text-muted-foreground">Your cart is empty</p>
              <DrawerClose asChild>
                <Button variant="outline" asChild>
                  <Link href="/manga">Continue Shopping</Link>
                </Button>
              </DrawerClose>
            </div>
          ) : loading ? (
            <div className="space-y-4">
              <div className="flex gap-4 p-4 border rounded-lg animate-pulse">
                <div className="h-16 w-12 shrink-0 rounded bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-3/4 rounded bg-muted" />
                  <div className="h-3 w-1/2 rounded bg-muted" />
                </div>
                <div className="h-8 w-20 rounded bg-muted" />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {displayLines.map((line) => (
                <div
                  key={line.variantId}
                  className="flex items-center gap-4 p-4 border rounded-lg"
                >
                  <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded bg-muted">
                    {line.image ? (
                      <Image
                        src={line.image}
                        alt={line.productName}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : null}
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/product/${line.productSlug}`}
                      className="text-sm font-medium leading-tight line-clamp-1 hover:underline"
                      onClick={() => onOpenChange(false)}
                    >
                      {line.productName}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {line.variantName}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-8"
                      disabled={line.quantity <= 1}
                      onClick={() =>
                        handleUpdateQuantity(line.variantId, line.quantity - 1)
                      }
                      aria-label="Decrease quantity"
                    >
                      <Minus className="size-3" />
                    </Button>
                    <span className="w-8 text-center text-sm">
                      {line.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-8"
                      onClick={() =>
                        handleUpdateQuantity(line.variantId, line.quantity + 1)
                      }
                      aria-label="Increase quantity"
                    >
                      <Plus className="size-3" />
                    </Button>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {formatPrice(line.unitPrice * line.quantity, "JPY")}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemove(line.variantId)}
                      aria-label={`Remove ${line.productName}`}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}

              <div className="p-4 border border-dashed rounded-lg border-primary">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">
                    {formatPrice(subtotal, "JPY")}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DrawerBody>

        {displayLines.length > 0 && (
          <DrawerFooter className="grid-cols-2 border-none">
            <DrawerClose asChild>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/manga">Continue Shopping</Link>
              </Button>
            </DrawerClose>
            <Button asChild className="w-full">
              <Link href="/checkout" onClick={() => onOpenChange(false)}>
                Checkout
              </Link>
            </Button>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
}
