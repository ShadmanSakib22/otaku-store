import Link from "next/link";
import { siteNav } from "./site-nav";
import { CartButton } from "./cart-button";
import { ThemeSwitcher } from "./theme-switcher";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4">
        <Link
          href="/"
          className="font-heading text-lg font-bold tracking-tight"
        >
          Otaku Store
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {siteNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <CartButton />
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}
