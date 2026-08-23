"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MenuIcon, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { MainNav } from "./main-nav";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
      >
        <MenuIcon />
      </Button>
      <SheetContent side="left" className="flex flex-col gap-6 p-6">
        <SheetHeader className="gap-1 p-0">
          <SheetTitle className="flex items-center gap-2 font-heading text-base font-black tracking-tight">
            Otaku Store
          </SheetTitle>
          <SheetDescription>Manga, light novels &amp; merch</SheetDescription>
        </SheetHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const q = query.trim();
            setOpen(false);
            router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
          }}
          className="relative"
        >
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            aria-label="Search"
            className="pl-8"
          />
        </form>

        <div className="space-y-2">
          <p className="px-3 text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            Browse
          </p>
          <MainNav variant="mobile" onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
