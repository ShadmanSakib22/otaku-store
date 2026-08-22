import { requireAdmin } from "@/lib/auth/guard"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminSiteHeader } from "@/components/admin/admin-site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireAdmin()

  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <AdminSiteHeader />
        <div className="flex flex-1">
          <AdminSidebar role={session.role} />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-4 p-4">
              {children}
            </div>
            <Toaster />
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}
