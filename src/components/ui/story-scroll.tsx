"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

function cx(...parts: Array<string | undefined | false | null>): string {
  return parts.filter(Boolean).join(" ");
}

export interface FlowSectionProps {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  "aria-label"?: string;
  backgroundImage?: string;
}

const childCount = (children: React.ReactNode) =>
  React.Children.count(children);

const FlowArt: React.FC<{
  className?: string;
  children: React.ReactNode;
  "aria-label"?: string;
}> = ({ className, children, "aria-label": ariaLabel = "Story scroll" }) => {
  const containerRef = useRef<HTMLElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useGSAP(
    () => {
      if (!containerRef.current || reducedMotion) return;

      const sections = Array.from(
        containerRef.current.querySelectorAll<HTMLElement>(
          "[data-flow-section]",
        ),
      );
      if (sections.length === 0) return;

      const triggers: ScrollTrigger[] = [];

      sections.forEach((section, i) => {
        gsap.set(section, { zIndex: i + 1 });

        const inner = section.querySelector<HTMLElement>(".flow-art-container");
        if (!inner) return;

        if (i > 0) {
          gsap.set(inner, { rotation: 30, transformOrigin: "bottom left" });
          const tween = gsap.to(inner, {
            rotation: 0,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "top 25%",
              scrub: true,
            },
          });
          if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
        }

        if (i < sections.length - 1) {
          triggers.push(
            ScrollTrigger.create({
              trigger: section,
              start: "bottom bottom",
              end: "bottom top",
              pin: true,
              pinSpacing: false,
            }),
          );
        }
      });

      ScrollTrigger.refresh();

      return () => {
        triggers.forEach((t) => t.kill());
      };
    },
    {
      scope: containerRef,
      dependencies: [childCount(children), reducedMotion],
    },
  );

  return (
    <main
      ref={containerRef}
      aria-label={ariaLabel}
      className={cx("w-full overflow-x-hidden", className)}
    >
      {children}
    </main>
  );
};

const FlowSection: React.FC<FlowSectionProps> = ({
  className,
  style,
  children,
  "aria-label": ariaLabel,
  backgroundImage,
}) => (
  <section
    data-flow-section
    aria-label={ariaLabel}
    className={cx("relative min-h-screen w-full overflow-hidden", className)}
  >
    <div
      className={cx(
        "flow-art-container relative min-h-screen w-full",
        "will-change-transform",
      )}
      style={{ transformOrigin: "bottom left", ...style }}
    >
      {backgroundImage ? (
        <div aria-hidden className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={backgroundImage}
            alt=""
            className="h-full w-full object-cover"
          />
          {/* even, mild darkening so the whole frame reads a touch moodier */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/15 to-black/15" />
          {/* vignette anchored where the text sits (bottom-left), for extra contrast right behind the copy */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_110%_85%_at_0%_100%,rgba(0,0,0,0.55),transparent_62%)]" />
        </div>
      ) : null}
      <div
        data-flow-inner
        className="relative z-10 flex min-h-screen w-full flex-col justify-between gap-6 pt-[clamp(2rem,8vw,4vw)] pb-[4vw]"
      >
        {children}
      </div>
    </div>
  </section>
);

export default FlowArt;
export { FlowSection };
