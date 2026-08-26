"use client";

import { PrinterIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5"
      onClick={() => window.print()}
    >
      <PrinterIcon className="size-4" />
      Print Order
    </Button>
  );
}
