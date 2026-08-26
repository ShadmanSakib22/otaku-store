"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stepper } from "@/components/ui/stepper";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ArrowLeftIcon, BanknoteIcon, CreditCardIcon, ShoppingCartIcon } from "lucide-react";

type Method = "CASH" | "STRIPE";

const STEPS = [
  { label: "Terms" },
  { label: "Payment" },
  { label: "Details" },
];

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
      <div className="mx-auto max-w-lg py-24 text-center">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center border border-border bg-muted">
          <ShoppingCartIcon className="size-7 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Add some items to your cart before checking out.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  async function submitCash() {
    const loadingId = toast.loading("Placing your order…");
    setSubmitting(true);
    try {
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
      if (!res.ok) {
        toast.error(data.error ?? "Checkout failed", { id: loadingId });
        return;
      }
      toast.success("Order placed!", { id: loadingId });
      clearCart();
      router.push(`/order/${data.orderNumber}`);
    } catch {
      toast.error("Something went wrong", { id: loadingId });
    } finally {
      setSubmitting(false);
    }
  }

  async function submitStripe() {
    const loadingId = toast.loading("Redirecting to payment…");
    setSubmitting(true);
    try {
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
      if (!res.ok) {
        toast.error(data.error ?? "Checkout failed", { id: loadingId });
        return;
      }
      if (data.url) window.location.href = data.url;
    } catch {
      toast.error("Something went wrong", { id: loadingId });
    } finally {
      setSubmitting(false);
    }
  }

  const addressComplete = ADDRESS_FIELDS.filter((f) => f.required).every(
    (f) => (customer.address?.[f.key] ?? "").trim() !== "",
  );
  const canSubmit =
    method === "CASH"
      ? Boolean(customer.name && customer.phone)
      : Boolean(customer.name && customer.phone && customer.email) &&
        addressComplete;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
        {summary ? (
          <div className="mt-3 flex items-center justify-between border border-border bg-muted px-4 py-3 text-sm">
            <span className="text-muted-foreground">
              {summary.itemCount} item{summary.itemCount !== 1 ? "s" : ""}
            </span>
            <span className="font-semibold">
              {formatPrice(summary.total, "JPY")}
            </span>
          </div>
        ) : null}
      </div>

      <div className="mb-8">
        <Stepper steps={STEPS} currentStep={step} />
      </div>

      <div className="flex flex-col gap-6">
        {step === 1 ? (
          <Card>
            <CardHeader>
              <CardTitle>Purchase Terms</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <TermsBlock checked={terms} onChange={setTerms} />
              <Button
                disabled={!terms}
                onClick={() => setStep(2)}
                className="w-full"
              >
                Continue to Payment
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {step === 2 ? (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="w-fit gap-1.5"
              onClick={() => setStep(1)}
            >
              <ArrowLeftIcon className="size-4" />
              Back
            </Button>
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setMethod("CASH")}
                    className={`flex items-start gap-3 border p-4 text-left transition-colors ${
                      method === "CASH"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <BanknoteIcon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="font-semibold">Pay by Cash</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Pickup inside Tokyo only.
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethod("STRIPE")}
                    className={`flex items-start gap-3 border p-4 text-left transition-colors ${
                      method === "STRIPE"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <CreditCardIcon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="font-semibold">Pay by Stripe</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Secure online payment.
                      </p>
                    </div>
                  </button>
                </div>
                <Button onClick={() => setStep(3)} className="w-full">
                  Continue to Details
                </Button>
              </CardContent>
            </Card>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="w-fit gap-1.5"
              onClick={() => setStep(2)}
            >
              <ArrowLeftIcon className="size-4" />
              Back
            </Button>
            <Card>
              <CardHeader>
                <CardTitle>
                  {method === "CASH" ? "Pickup Details" : "Shipping Details"}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="w-full">
                    <Label htmlFor="name">Full name *</Label>
                    <Input
                      id="name"
                      value={customer.name}
                      onChange={(e) => setCustomer({ name: e.target.value })}
                    />
                  </div>
                  <div className="w-full">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      value={customer.phone}
                      onChange={(e) => setCustomer({ phone: e.target.value })}
                    />
                  </div>
                  <div className="w-full sm:col-span-2">
                    <Label htmlFor="email">
                      Email {method === "CASH" ? "(optional)" : "*"}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={customer.email}
                      onChange={(e) => setCustomer({ email: e.target.value })}
                    />
                  </div>
                </div>

                {method === "STRIPE" ? (
                  <>
                    <Separator />
                    <div className="grid gap-3 sm:grid-cols-2">
                      {ADDRESS_FIELDS.map((f) => (
                        <div
                          key={f.key}
                          className={
                            f.full ? "w-full sm:col-span-2" : "w-full"
                          }
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
                      ))}
                    </div>
                  </>
                ) : null}

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
          </>
        ) : null}
      </div>
    </div>
  );
}
