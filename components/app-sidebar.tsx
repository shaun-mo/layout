"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavPinned } from "@/components/nav-pinned"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import {
  CrosshairIcon,
  DatabaseIcon,
  FileTextIcon,
  InboxIcon,
  PackageIcon,
  SearchCheckIcon,
  SettingsIcon,
  ZapIcon,
} from "lucide-react"

// ── Brand: replace these two for your app ───────────────────────────────
const APP_NAME = "Acme"
const APP_LOGO = "/logo.svg" // put a square logo in /public (or delete the <img>)

// ── Nav config: rename / re-route freely ────────────────────────────────
const navMain = [
  { title: "Inbox",         url: "/inbox",         icon: <InboxIcon />,       shortcut: "i" },
  { title: "Pursuits",      url: "/pursuits",      icon: <CrosshairIcon />,   shortcut: "p" },
  { title: "Opportunities", url: "/opportunities", icon: <SearchCheckIcon />, shortcut: "o" },
  { title: "Assets",        url: "/assets",        icon: <PackageIcon />,     shortcut: "e" },
]

const documents = [
  { name: "Database",    url: "/database",    icon: <DatabaseIcon />, shortcut: "j" },
  { name: "Connections", url: "/connections", icon: <ZapIcon />,      shortcut: "x" },
  { name: "Templates",   url: "/templates",   icon: <FileTextIcon />, shortcut: "l" },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()

  // Ctrl/⌘ + <letter> → jump to a section.
  React.useEffect(() => {
    const shortcuts: Record<string, string> = {
      d: "/",
      ...Object.fromEntries(navMain.flatMap((i) => (i.shortcut ? [[i.shortcut, i.url]] : []))),
      ...Object.fromEntries(documents.map((i) => [i.shortcut, i.url])),
    }
    const handler = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return
      const url = shortcuts[e.key.toLowerCase()]
      if (!url) return
      e.preventDefault()
      router.push(url)
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [router])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-0 py-1 group-data-[collapsible=icon]:justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={APP_LOGO} alt={APP_NAME} className="size-8 rounded-md object-cover shrink-0" />
              <span className="truncate text-base font-semibold max-w-[140px] group-data-[collapsible=icon]:hidden">
                {APP_NAME}
              </span>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navMain} />
        <NavPinned />
        <NavDocuments items={documents} />
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Settings" onClick={() => router.push("/settings")}>
              <SettingsIcon />
              <span>Settings</span>
              <KbdGroup className="ml-auto shrink-0 group-data-[collapsible=icon]:hidden">
                <Kbd>Ctrl</Kbd>
                <Kbd>Q</Kbd>
              </KbdGroup>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}