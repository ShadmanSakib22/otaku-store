"use client";

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { TERMS_VERSION } from "@/lib/constants";

const TERMS_SECTIONS = [
  {
    title: "1. All Sales Are Final",
    body: "All purchases are non-refundable once the order is confirmed. Please review your cart carefully before completing checkout. We do not accept returns or exchanges on any items unless they arrive damaged or defective.",
  },
  {
    title: "2. Cash Pickup Orders",
    body: "Cash orders must be picked up in person at our designated pickup location in Tokyo. A valid photo ID matching the name on the order is required at the time of pickup. Unclaimed orders will be held for 14 days before being restocked. No refunds will be issued for unclaimed pickup orders.",
  },
  {
    title: "3. Online Payments",
    body: "All online payments are processed securely through Stripe. We do not store your credit card information. Prices are displayed in Japanese Yen (JPY) and include all applicable taxes unless otherwise stated.",
  },
  {
    title: "4. Order Modifications",
    body: "Once an order has been placed, we are unable to modify its contents. If you need to cancel or change your order, please contact us immediately at support@example.com. Cancellation is only possible before the order status changes to Processing.",
  },
  {
    title: "5. Inventory & Availability",
    body: "All items are subject to availability. In the rare event that an item becomes out of stock after your order is placed, we will notify you promptly and offer a full refund or an alternative item of equal value.",
  },
  {
    title: "6. Product Descriptions",
    body: "We make every effort to display product descriptions, images, and specifications as accurately as possible. However, slight variations in color, size, or packaging may occur due to manufacturer updates or display differences.",
  },
  {
    title: "7. Limitation of Liability",
    body: "Our liability is limited to the purchase price of the item in question. We are not responsible for any indirect, incidental, or consequential damages arising from the use or inability to use purchased items.",
  },
];

export function TermsBlock({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="max-h-64 overflow-y-auto border border-border p-4 text-sm leading-relaxed text-muted-foreground">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground">
          Purchase Terms — Version {TERMS_VERSION}
        </p>
        {TERMS_SECTIONS.map((section) => (
          <div key={section.title} className="mb-3 last:mb-0">
            <p className="font-medium text-foreground">{section.title}</p>
            <p>{section.body}</p>
          </div>
        ))}
      </div>
      <div className="flex items-start gap-2">
        <Checkbox
          id="terms"
          checked={checked}
          onCheckedChange={(value) => onChange(value === true)}
        />
        <Label htmlFor="terms" className="text-sm leading-relaxed">
          I have read and agree to the purchase terms (v{TERMS_VERSION}). All
          sales are final. Cash orders are pickup-only within Tokyo.
        </Label>
      </div>
    </div>
  );
}
