"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { CrosshairIcon, FolderIcon, LayoutGridIcon, PlusIcon, UserIcon } from "lucide-react"

export function NavMain({
  items,
}: {
  items: { title: string; url: string; icon?: React.ReactNode; shortcut?: string }[]
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2 mb-3">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:gap-1">
            <SidebarMenuButton
              asChild
              tooltip="Dashboard"
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
            >
              <a href="/">
                <LayoutGridIcon />
                <span>Dashboard</span>
              </a>
            </SidebarMenuButton>
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" className="size-8 shrink-0" variant="outline">
                      <PlusIcon />
                      <span className="sr-only">Create new</span>
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="right" hidden={!isCollapsed}>
                  Create new
                </TooltipContent>
              </Tooltip>
              <DropdownMenuContent side="right" align="start" className="w-40">
                <DropdownMenuItem onClick={() => router.push("/pursuits")}>
                  <CrosshairIcon />
                  New Pursuit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/database")}>
                  <UserIcon />
                  Add Personnel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/database")}>
                  <FolderIcon />
                  Add Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>

      <SidebarGroupLabel className="mt-1">Workspace</SidebarGroupLabel>
      <SidebarMenu className="gap-1">
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild tooltip={item.title} isActive={pathname === item.url}>
              <Link href={item.url}>
                {item.icon}
                <span>{item.title}</span>
                {item.shortcut && (
                  <KbdGroup className="ml-auto shrink-0 group-data-[collapsible=icon]:hidden">
                    <Kbd>Ctrl</Kbd>
                    <Kbd>{item.shortcut.toUpperCase()}</Kbd>
                  </KbdGroup>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}