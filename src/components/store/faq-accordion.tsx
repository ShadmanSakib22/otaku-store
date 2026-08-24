"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

const FAQ_ITEMS = [
  {
    question: "Do you ship internationally?",
    answer:
      "We currently offer pickup in Akihabara and shipping within Japan. International shipping is coming soon.",
  },
  {
    question: "How long does delivery take?",
    answer:
      "Domestic orders typically arrive within 2-4 business days. Pickup orders are ready within 24 hours at our Akihabara location.",
  },
  {
    question: "Can I pre-order upcoming releases?",
    answer:
      "Yes! Pre-order listings are available for most major releases. You will be charged when the item ships.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept cash on pickup and all major credit cards via Stripe for shipped orders.",
  },
  {
    question: "What is your return policy?",
    answer:
      "Unopened items can be returned within 14 days of delivery. Please contact support with your order number.",
  },
];

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const contentRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  function toggle(i: number) {
    const el = contentRefs.current.get(i);
    if (!el) return;

    if (openIndex === i) {
      gsap.to(el, {
        height: 0,
        opacity: 0,
        duration: 0.3,
        ease: "power2.inOut",
        onComplete: () => setOpenIndex(null),
      });
    } else {
      // close previous
      if (openIndex !== null) {
        const prev = contentRefs.current.get(openIndex);
        if (prev) {
          gsap.to(prev, { height: 0, opacity: 0, duration: 0.25, ease: "power2.inOut" });
        }
      }
      setOpenIndex(i);
      gsap.fromTo(
        el,
        { height: 0, opacity: 0 },
        { height: "auto", opacity: 1, duration: 0.35, ease: "power2.out", delay: openIndex !== null ? 0.1 : 0 }
      );
    }
  }

  return (
    <div className="space-y-1">
      {FAQ_ITEMS.map((item, i) => (
        <Collapsible key={i} open={openIndex === i}>
          <CollapsibleTrigger
            onClick={() => toggle(i)}
            className="flex w-full items-center justify-between gap-4 py-3 text-left text-sm font-medium transition-colors hover:text-foreground"
          >
            <span>{item.question}</span>
            <ChevronDown
              className={cn(
                "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                openIndex === i && "rotate-180"
              )}
            />
          </CollapsibleTrigger>
          <CollapsibleContent forceMount>
            <div
              ref={(el) => {
                if (el) contentRefs.current.set(i, el);
              }}
              style={{ height: 0, opacity: 0, overflow: "hidden" }}
            >
              <p className="pb-3 text-sm leading-relaxed text-muted-foreground">
                {item.answer}
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
}
