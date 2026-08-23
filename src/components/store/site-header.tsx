import Link from "next/link";
import { CartButton } from "./cart-button";
import { ThemeSwitcher } from "./theme-switcher";
import { HeaderSearch } from "./header-search";
import { MainNav } from "./main-nav";
import { MobileNav } from "./mobile-nav";
import { Sparkle } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 shadow bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-1 md:min-w-[200px]">
          <MobileNav />
          <Link href="/" className="group flex items-start gap-1">
            <span className="font-semibold text-xl font-serif">OtakuYa</span>
            <Sparkle className="size-3.5 text-primary transition-transform group-hover:rotate-45" />
          </Link>
        </div>

        <MainNav className="hidden flex-1 justify-center md:flex" />

        <div className="ml-auto flex items-center gap-1 sm:gap-2 md:ml-0 md:min-w-[200px] md:justify-end">
          <div className="hidden md:block">
            <HeaderSearch />
          </div>
          <CartButton />
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}
