import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SiteSubheader } from "@/components/site-subheader"
import { SubheaderProvider } from "@/components/subheader-context"
import { BreadcrumbProvider } from "@/components/breadcrumb-context"
import { PageScrollContainer } from "@/components/page-scroll-container"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

// Layout structure (top to bottom):
//   - AppSidebar (fixed left, inset variant, icon-collapsible)
//   - SidebarInset
//     - SiteHeader            (fixed top of body)
//     - SiteSubheader         (fixed below header — per-page context)
//     - PageScrollContainer   ← the only vertically-scrollable surface
//       └── {children}        ← page content renders here
//
// The two CSS vars below size the chrome:
//   --sidebar-width  : 15rem (calc(var(--spacing) * 60))
//   --header-height  : 3rem  (calc(var(--spacing) * 12))
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <SidebarProvider
        className="h-svh overflow-hidden"
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 60)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset className="overflow-hidden">
          <BreadcrumbProvider>
            <SubheaderProvider>
              <SiteHeader />
              <SiteSubheader />
              <PageScrollContainer>
                <div className="flex flex-col gap-4 min-w-0">{children}</div>
              </PageScrollContainer>
            </SubheaderProvider>
          </BreadcrumbProvider>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}