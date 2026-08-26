"use client";

import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  label: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <nav aria-label="Checkout progress" className="flex items-center gap-0">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;
        const isLast = index === steps.length - 1;

        return (
          <div key={step.label} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center border text-xs font-semibold transition-colors",
                  isCompleted
                    ? "border-primary bg-primary text-primary-foreground"
                    : isCurrent
                      ? "border-primary text-primary"
                      : "border-border text-muted-foreground",
                )}
              >
                {isCompleted ? (
                  <CheckIcon className="size-3.5" />
                ) : (
                  stepNumber
                )}
              </div>
              <span
                className={cn(
                  "text-sm font-medium whitespace-nowrap",
                  isCurrent
                    ? "text-foreground"
                    : isCompleted
                      ? "text-foreground"
                      : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </div>
            {!isLast ? (
              <div
                className={cn(
                  "mx-3 h-px w-8 sm:w-12",
                  isCompleted ? "bg-primary" : "bg-border",
                )}
              />
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
