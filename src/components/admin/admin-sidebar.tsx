"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import {
  LayoutDashboardIcon,
  PackageIcon,
  WarehouseIcon,
  ShoppingCartIcon,
  HomeIcon,
  StoreIcon,
  Settings,
} from "lucide-react";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/admin/products", label: "Products", icon: PackageIcon },
  { href: "/admin/inventory", label: "Inventory", icon: WarehouseIcon },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCartIcon },
  { href: "/admin/homepage", label: "Homepage CMS", icon: HomeIcon },
];

export function AdminSidebar({
  role,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  role: "ADMIN" | "DEMO_ADMIN";
}) {
  const pathname = usePathname();

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin/dashboard">
                <Settings className="size-6!" />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">OtakuYa</span>
                  <span className="truncate text-xs">Admin Panel</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          role={role}
          user={{
            name: "Admin",
            email: "admin@otakuya.com",
            avatar: "",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
