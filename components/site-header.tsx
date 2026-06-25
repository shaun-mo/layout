"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { useSidebar } from "@/components/ui/sidebar"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { Button } from "@/components/ui/button"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useBreadcrumbData } from "@/components/breadcrumb-context"
import {
  CrosshairIcon,
  DatabaseIcon,
  FileTextIcon,
  InboxIcon,
  LayoutGridIcon,
  MessageSquareShareIcon,
  PackageIcon,
  PanelLeftIcon,
  SearchCheckIcon,
  SearchIcon,
  ZapIcon,
} from "lucide-react"

const PAGE_LABELS: Record<string, string> = {
  "/": "Dashboard",
  "/inbox": "Inbox",
  "/pursuits": "Pursuits",
  "/opportunities": "Opportunities",
  "/assets": "Assets",
  "/database": "Database",
  "/connections": "Connections",
  "/templates": "Templates",
}

const NAV_ITEMS = [
  { label: "Dashboard",     url: "/",              icon: <LayoutGridIcon /> },
  { label: "Inbox",         url: "/inbox",         icon: <InboxIcon /> },
  { label: "Pursuits",      url: "/pursuits",      icon: <CrosshairIcon /> },
  { label: "Opportunities", url: "/opportunities", icon: <SearchCheckIcon /> },
  { label: "Assets",        url: "/assets",        icon: <PackageIcon /> },
  { label: "Database",      url: "/database",      icon: <DatabaseIcon /> },
  { label: "Connections",   url: "/connections",   icon: <ZapIcon /> },
  { label: "Templates",     url: "/templates",     icon: <FileTextIcon /> },
]

export function SiteHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const label = PAGE_LABELS[pathname] ?? (pathname.split("/").pop() ?? "")
  const { toggleSidebar } = useSidebar()
  const breadcrumb = useBreadcrumbData()
  const [commandOpen, setCommandOpen] = useState(false)

  // Ctrl/⌘ + K opens the command dialog.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        setCommandOpen((prev) => !prev)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  const navigate = (url: string) => {
    router.push(url)
    setCommandOpen(false)
  }

  return (
    <>
      <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
        <div className="flex w-full items-center gap-2 px-4 lg:px-6">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button data-sidebar="trigger" variant="secondary" size="icon" onClick={toggleSidebar}>
                <PanelLeftIcon />
                <span className="sr-only">Toggle Sidebar</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Toggle Sidebar</TooltipContent>
          </Tooltip>
          <Separator orientation="vertical" className="mx-1 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumb ? (
                <>
                  <BreadcrumbItem className="hidden sm:inline-flex">
                    <BreadcrumbLink asChild>
                      <Link href={breadcrumb.parentUrl}>{breadcrumb.parent}</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden sm:inline-flex" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="font-medium">{breadcrumb.label}</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              ) : (
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-medium">{label}</BreadcrumbPage>
                </BreadcrumbItem>
              )}
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto flex items-center gap-1">
            <Button
              variant="outline"
              className="h-8 gap-2 text-muted-foreground text-sm font-normal px-2.5"
              onClick={() => setCommandOpen(true)}
            >
              <SearchIcon className="size-3.5 shrink-0" />
              <KbdGroup className="shrink-0 hidden sm:flex">
                <Kbd>Ctrl</Kbd>
                <Kbd>K</Kbd>
              </KbdGroup>
            </Button>
            <Separator orientation="vertical" className="mx-1 data-[orientation=vertical]:h-4" />
            <ModeToggle />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="secondary" size="icon">
                  <MessageSquareShareIcon />
                  <span className="sr-only">Agent Chat</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Agent Chat</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </header>

      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen} title="Search">
        <CommandInput placeholder="Search pages..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            {NAV_ITEMS.map((item) => (
              <CommandItem key={item.url} onSelect={() => navigate(item.url)}>
                {item.icon}
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}