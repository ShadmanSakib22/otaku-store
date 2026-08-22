"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";
import { ArrowUpRight, Mail, PanelLeftIcon } from "lucide-react";

const breadcrumbMap: Record<string, string> = {
  dashboard: "Dashboard",
  products: "Products",
  inventory: "Inventory",
  orders: "Orders",
  homepage: "Homepage CMS",
};

export function AdminSiteHeader() {
  const { toggleSidebar } = useSidebar();
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const currentPage = segments[segments.length - 1] || "dashboard";
  const pageTitle = breadcrumbMap[currentPage] || currentPage;

  return (
    <header className="sticky top-0 z-50 flex w-full items-center border-b bg-background">
      <div className="flex h-(--header-height) w-full items-center gap-2 px-4">
        <Button
          className="h-8 w-8"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
        >
          <PanelLeftIcon />
        </Button>
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink asChild>
                <Link href="/admin/dashboard">Admin</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto">
          <a
            href="https://dashboard.stripe.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-md border bg-muted/40 px-2 py-1 text-sm transition-colors hover:bg-muted"
          >
            Stripe
            <ArrowUpRight className="size-4" />
          </a>
        </div>
      </div>
    </header>
  );
}
