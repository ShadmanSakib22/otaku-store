"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/stores/cart-store";
import { previewCart } from "@/lib/actions/checkout";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { CartLine } from "@/lib/cart";

export function CartPageClient() {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const [lines, setLines] = useState<CartLine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
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
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h1 className="font-heading text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Start with the manga shelf.</p>
        <Button asChild className="mt-6">
          <Link href="/manga">Browse Manga</Link>
        </Button>
      </div>
    );
  }

  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-heading text-3xl font-bold">Cart</h1>
      {loading ? (
        <p className="py-8 text-muted-foreground">Updating prices…</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-3">
            {lines.map((line) => (
              <Card key={line.variantId}>
                <CardContent className="flex items-center gap-4 p-4">
                  {line.image ? (
                    <div className="relative aspect-[3/4] w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                      <Image src={line.image} alt={line.productName} fill sizes="64px" className="object-cover" />
                    </div>
                  ) : null}
                  <div className="flex-1 space-y-0.5">
                    <Link href={`/product/${line.productSlug}`} className="font-medium hover:underline">
                      {line.productName}
                    </Link>
                    <p className="text-sm text-muted-foreground">{line.variantName} · {line.sku}</p>
                    <p className="text-sm">{formatPrice(line.unitPrice, "JPY")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => updateQuantity(line.variantId, line.quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      −
                    </Button>
                    <span className="w-8 text-center">{line.quantity}</span>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => updateQuantity(line.variantId, line.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      +
                    </Button>
                  </div>
                  <div className="w-24 text-right font-semibold">
                    {formatPrice(line.unitPrice * line.quantity, "JPY")}
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => removeItem(line.variantId)}
                    aria-label={`Remove ${line.productName}`}
                  >
                    Remove
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <aside>
            <Card>
              <CardContent className="space-y-3 p-6">
                <h2 className="font-heading text-lg font-semibold">Summary</h2>
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal, "JPY")}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(subtotal, "JPY")}</span>
                </div>
                <Button asChild className="w-full" size="lg">
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      )}
    </div>
  );
}