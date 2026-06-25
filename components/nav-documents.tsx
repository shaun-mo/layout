"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavDocuments({
  items,
}: {
  items: { name: string; url: string; icon: React.ReactNode; shortcut?: string }[]
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup className="pt-2">
      <SidebarGroupLabel>Manage</SidebarGroupLabel>
      <SidebarMenu className="gap-1">
        {items.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild tooltip={item.name} isActive={pathname === item.url}>
              <Link href={item.url}>
                {item.icon}
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
            {item.shortcut && (
              <span className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none group-data-[collapsible=icon]:hidden">
                <KbdGroup>
                  <Kbd>Ctrl</Kbd>
                  <Kbd>{item.shortcut.toUpperCase()}</Kbd>
                </KbdGroup>
              </span>
            )}
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}