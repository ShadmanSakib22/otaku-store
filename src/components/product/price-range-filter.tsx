"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PRICE_MIN = 0;
const PRICE_MAX = 5000;

export function PriceRangeFilter({
  base,
  currentPrice,
}: {
  base: string;
  currentPrice: string;
}) {
  const router = useRouter();
  const [min, setMin] = useState(() => {
    const [m] = currentPrice.split("-");
    return m && Number(m) ? Number(m) : PRICE_MIN;
  });
  const [max, setMax] = useState(() => {
    const [, m] = currentPrice.split("-");
    return m && Number(m) ? Number(m) : PRICE_MAX;
  });

  const minTrackRef = useRef<HTMLDivElement>(null);
  const maxTrackRef = useRef<HTMLDivElement>(null);

  const toPercent = useCallback(
    (val: number) => ((val - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100,
    []
  );

  const syncSlider = useCallback(() => {
    const minPct = toPercent(min);
    const maxPct = toPercent(max);
    if (minTrackRef.current) {
      minTrackRef.current.style.left = `${minPct}%`;
      minTrackRef.current.style.width = `${maxPct - minPct}%`;
    }
  }, [min, max, toPercent]);

  useEffect(() => {
    syncSlider();
  }, [syncSlider]);

  function handleMinChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = Math.min(Number(e.target.value) || 0, max);
    setMin(v);
  }

  function handleMaxChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = Math.max(Number(e.target.value) || 0, min);
    setMax(v);
  }

  function handleMinSlider(e: React.ChangeEvent<HTMLInputElement>) {
    const v = Math.min(Number(e.target.value), max - 10);
    setMin(v);
  }

  function handleMaxSlider(e: React.ChangeEvent<HTMLInputElement>) {
    const v = Math.max(Number(e.target.value), min + 10);
    setMax(v);
  }

  function apply() {
    if (min === PRICE_MIN && max === PRICE_MAX) {
      router.push(base);
      return;
    }
    router.push(`${base}?price=${min}-${max}`);
  }

  return (
    <div className="space-y-3">
      {/* Slider track */}
      <div className="relative h-5 flex items-center">
        <div className="absolute h-1 w-full bg-muted" />
        <div
          ref={minTrackRef}
          className="absolute h-1 bg-primary"
          style={{ left: toPercent(min), width: toPercent(max) - toPercent(min) }}
        />
        <input
          type="range"
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={10}
          value={min}
          onChange={handleMinSlider}
          className="range-thumb absolute h-5 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:size-3.5 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-none [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:shadow-md"
        />
        <input
          type="range"
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={10}
          value={max}
          onChange={handleMaxSlider}
          className="range-thumb absolute h-5 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:size-3.5 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-none [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:shadow-md"
        />
      </div>

      {/* Number inputs */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            &#165;
          </span>
          <Input
            type="number"
            value={min}
            onChange={handleMinChange}
            className="h-8 rounded-none pl-6 text-xs"
            min={PRICE_MIN}
            max={max}
          />
        </div>
        <span className="text-muted-foreground">&ndash;</span>
        <div className="relative flex-1">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            &#165;
          </span>
          <Input
            type="number"
            value={max}
            onChange={handleMaxChange}
            className="h-8 rounded-none pl-6 text-xs"
            min={min}
            max={PRICE_MAX}
          />
        </div>
      </div>

      <Button
        size="sm"
        variant="outline"
        className="w-full h-8 rounded-none text-xs"
        onClick={apply}
      >
        <Search className="mr-1.5 size-3" />
        Apply
      </Button>
    </div>
  );
}
