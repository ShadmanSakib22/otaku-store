"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { siteNav } from "./site-nav";

export function MainNav({
  className,
  variant = "desktop",
  onNavigate,
}: {
  className?: string;
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  if (variant === "mobile") {
    return (
      <nav className={cn("flex flex-col gap-1", className)}>
        {siteNav.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center justify-between rounded-none px-3 py-2.5 text-base font-medium transition-colors",
                isActive
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              {item.label}
              {isActive ? (
                <span className="size-1.5 rounded-none bg-primary" />
              ) : null}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className={cn("flex items-center gap-1", className)}>
      {siteNav.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group relative rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
              isActive && "text-foreground",
            )}
          >
            {item.label}
            <span
              className={cn(
                "pointer-events-none absolute inset-x-3 -bottom-[3px] h-[2px] scale-x-0 rounded-none bg-primary transition-transform duration-200 ease-out group-hover:scale-x-100",
                isActive && "scale-x-100",
              )}
            />
          </Link>
        );
      })}
    </nav>
  );
}
