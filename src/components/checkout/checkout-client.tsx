"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cart-store";
import { useCheckoutStore } from "@/stores/checkout-store";
import type { CheckoutAddress } from "@/stores/checkout-store";
import { previewCart } from "@/lib/actions/checkout";
import { formatPrice } from "@/lib/format";
import { TermsBlock } from "./terms-block";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

type Method = "CASH" | "STRIPE";

const FIELD = "w-full";

const ADDRESS_FIELDS: {
  key: keyof CheckoutAddress;
  label: string;
  required: boolean;
  full?: boolean;
}[] = [
  { key: "firstName", label: "First name", required: true },
  { key: "lastName", label: "Last name", required: true },
  { key: "address1", label: "Address line 1", required: true, full: true },
  { key: "address2", label: "Address line 2", required: false, full: true },
  { key: "city", label: "City", required: true },
  { key: "state", label: "State", required: true },
  { key: "postalCode", label: "Postal code", required: true },
  { key: "country", label: "Country", required: true },
];

export function CheckoutClient() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const customer = useCheckoutStore((state) => state.customer);
  const setCustomer = useCheckoutStore((state) => state.setCustomer);

  const [step, setStep] = useState(1);
  const [method, setMethod] = useState<Method>("CASH");
  const [terms, setTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [summary, setSummary] = useState<{
    itemCount: number;
    total: number;
  } | null>(null);

  useEffect(() => {
    let active = true;
    previewCart(items)
      .then(({ lines, totals }) => {
        if (active) {
          setSummary({
            itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
            total: totals.total,
          });
        }
      })
      .catch(() => {
        if (active) setSummary(null);
      });
    return () => {
      active = false;
    };
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <h1 className="font-heading text-2xl font-bold">Checkout</h1>
        <p className="mt-2 text-muted-foreground">Your cart is empty.</p>
      </div>
    );
  }

  async function submitCash() {
    setSubmitting(true);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        termsAccepted: terms,
      }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      toast.error(data.error ?? "Checkout failed");
      return;
    }
    clearCart();
    router.push(`/order/${data.orderNumber}`);
  }

  async function submitStripe() {
    setSubmitting(true);
    const res = await fetch("/api/payment-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items,
        customerName: customer.name,
        email: customer.email,
        phone: customer.phone,
        termsAccepted: terms,
        shippingAddress: { ...customer.address, phone: customer.phone },
      }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      toast.error(data.error ?? "Checkout failed");
      return;
    }
    if (data.url) window.location.href = data.url;
  }

  const addressComplete = ADDRESS_FIELDS.filter((f) => f.required).every(
    (f) => (customer.address?.[f.key] ?? "").trim() !== ""
  );
  const canSubmit =
    method === "CASH"
      ? Boolean(customer.name && customer.phone)
      : Boolean(customer.name && customer.phone && customer.email) &&
        addressComplete;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-heading text-3xl font-bold">Checkout</h1>
      <p className="mt-1 text-sm text-muted-foreground">Step {step} of 3</p>
      {summary ? (
        <p className="mt-1 text-sm text-muted-foreground">
          {summary.itemCount} items · {formatPrice(summary.total, "JPY")}
        </p>
      ) : null}

      <div className="mt-6 space-y-4">
        {step === 1 ? (
          <Card>
            <CardContent className="space-y-4 p-6">
              <h2 className="font-heading text-lg font-semibold">Purchase Terms</h2>
              <TermsBlock checked={terms} onChange={setTerms} />
              <Button
                disabled={!terms}
                onClick={() => setStep(2)}
                className="w-full"
              >
                Continue
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {step === 2 ? (
          <Card>
            <CardContent className="space-y-3 p-6">
              <h2 className="font-heading text-lg font-semibold">Payment Method</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setMethod("CASH")}
                  className={`rounded-xl border p-4 text-left ${method === "CASH" ? "border-primary bg-primary/5" : "border-border"}`}
                >
                  <p className="font-semibold">Pay by Cash</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Pickup inside Tokyo only.
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setMethod("STRIPE")}
                  className={`rounded-xl border p-4 text-left ${method === "STRIPE" ? "border-primary bg-primary/5" : "border-border"}`}
                >
                  <p className="font-semibold">Pay by Stripe</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Secure online payment.
                  </p>
                </button>
              </div>
              <Button onClick={() => setStep(3)} className="w-full">
                Continue
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {step === 3 ? (
          <Card>
            <CardContent className="space-y-4 p-6">
              <h2 className="font-heading text-lg font-semibold">
                {method === "CASH" ? "Pickup Details" : "Shipping Details"}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className={FIELD}>
                  <Label htmlFor="name">Full name *</Label>
                  <Input
                    id="name"
                    value={customer.name}
                    onChange={(e) => setCustomer({ name: e.target.value })}
                  />
                </div>
                <div className={FIELD}>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ phone: e.target.value })}
                  />
                </div>
                <div className={`${FIELD} sm:col-span-2`}>
                  <Label htmlFor="email">Email {method === "CASH" ? "(optional)" : "*"}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customer.email}
                    onChange={(e) => setCustomer({ email: e.target.value })}
                  />
                </div>

                {method === "STRIPE"
                  ? ADDRESS_FIELDS.map((f) => (
                      <div
                        key={f.key}
                        className={f.full ? `${FIELD} sm:col-span-2` : FIELD}
                      >
                        <Label htmlFor={`address-${f.key}`}>
                          {f.label}
                          {f.required ? " *" : ""}
                        </Label>
                        <Input
                          id={`address-${f.key}`}
                          value={customer.address?.[f.key] ?? ""}
                          onChange={(e) =>
                            setCustomer({
                              address: {
                                ...customer.address!,
                                [f.key]: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                    ))
                  : null}
              </div>

              <Button
                disabled={submitting || !canSubmit}
                onClick={method === "CASH" ? submitCash : submitStripe}
                className="w-full"
              >
                {submitting
                  ? "Processing…"
                  : method === "CASH"
                    ? "Place Order"
                    : "Continue to Payment"}
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
