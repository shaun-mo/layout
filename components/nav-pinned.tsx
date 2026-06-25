"use client"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar"

interface PinnedItem {
  id: string
  title: string
}

// ← wire your data here. Empty array → empty state.
const pins: PinnedItem[] = []

export function NavPinned() {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden pt-2">
      <SidebarGroupLabel>Pinned</SidebarGroupLabel>
      <SidebarMenu className="gap-1">
        {pins.length === 0 ? (
          <p className="px-2 py-1 text-xs text-muted-foreground">No pinned items</p>
        ) : (
          pins.map((pin) => (
            // Swap this placeholder for a real SidebarMenuItem + SidebarMenuButton
            // once you have a data source. See README "Wiring in data".
            <p key={pin.id} className="px-2 py-1 text-sm">
              {pin.title}
            </p>
          ))
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}