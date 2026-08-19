"use client";

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { TERMS_VERSION } from "@/lib/constants";

export function TermsBlock({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
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
  );
}
