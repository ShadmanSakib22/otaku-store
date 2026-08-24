"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { Star } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Yuki T.",
    text: "Fast pickup in Akihabara and the manga was packaged perfectly. My go-to store now.",
    rating: 5,
  },
  {
    name: "Haruto M.",
    text: "Great selection of light novels. The pre-order system makes it easy to stay on top of new releases.",
    rating: 5,
  },
  {
    name: "Sakura K.",
    text: "Ordered figures and they arrived in perfect condition. Really happy with the quality.",
    rating: 5,
  },
];

export function Testimonials() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;
      const cards = containerRef.current.querySelectorAll(".testimonial-card");
      gsap.fromTo(
        cards,
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 85%",
            once: true,
          },
        }
      );
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="space-y-4">
      {TESTIMONIALS.map((t, i) => (
        <div key={i} className="testimonial-card rounded-lg border p-4">
          <div className="mb-2 flex gap-0.5">
            {Array.from({ length: t.rating }).map((_, j) => (
              <Star key={j} className="size-3.5 fill-primary text-primary" />
            ))}
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            &ldquo;{t.text}&rdquo;
          </p>
          <p className="mt-2 text-xs font-medium">{t.name}</p>
        </div>
      ))}
    </div>
  );
}
