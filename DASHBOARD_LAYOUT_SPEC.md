# Dashboard Layout Spec — Implementation Guide

The complete, code-level spec for the dashboard **shell** in this repo. The README is the
quickstart; this file is the full reference — every layout file's source, the architecture,
theming rules, and wiring points — so an agent (or developer) can reproduce the layout 1:1
from this single document.

- **This repo:** the files described here also live in `app/`, `components/`, and `lib/` —
  copy the files directly, or copy from the code blocks below; they're identical.
- **Originally extracted from:** [Dataprint](https://github.com/shaun-mo/dataprint), a SaaS
  management platform.

> **Scope**
> - ✅ The full layout shell (sidebar, header, subheader, scroll container, structure).
> - 🎨 **Styling is shadcn-theme-agnostic.** No colors, no token values, no `globals.css`.
>   Every component uses only *standard* shadcn token names (`primary`, `muted`, `border`,
>   `sidebar`, `accent`, …), so it inherits the host app's preset. See §4.
> - ❌ **No database. No auth.** All Clerk and Supabase calls are replaced with static
>   constants + empty states, marked `// ← wire your data here`.
> - 🚫 **Disregard:** the company logo (use your own) and page content (charts, tables,
>   calendars). This is the **shell only**.
> - 🫙 Pages with no data render the shadcn **Empty** component (§8).

---

## 1. What the layout looks like

```
┌────────────┬──────────────────────────────────────────────────────────┐
│            │  SiteHeader   [☰] Breadcrumb …            [⌘K] [🌓] [chat] │  ← fixed, h=3rem
│            ├──────────────────────────────────────────────────────────┤
│ AppSidebar │  SiteSubheader   (per-page context: filters, tabs…)       │  ← fixed, h=3rem
│  (icon-    ├──────────────────────────────────────────────────────────┤
│   collap-  │                                                          ░ │
│   sible)   │   PageScrollContainer                                    ░ │  ← ONLY scroll
│            │     └── {page content}  (cards, tables, empty states)    ░ │     surface
│  • Nav     │                                                          ░ │
│  • Pinned  │   top/bottom blur gradients fade in/out with scroll      ░ │
│  • Manage  │                                                            │
│  • User    │                                                            │
└────────────┴──────────────────────────────────────────────────────────┘
```

Structure (top → bottom), from `app/(dashboard)/layout.tsx`:

```
TooltipProvider
└─ SidebarProvider                         (--sidebar-width: 15rem, --header-height: 3rem)
   ├─ AppSidebar  variant="inset"          (collapsible="icon")
   └─ SidebarInset
      └─ BreadcrumbProvider
         └─ SubheaderProvider
            ├─ SiteHeader                   (fixed top, breadcrumb + ⌘K + theme + actions)
            ├─ SiteSubheader                (fixed, renders whatever the page injects)
            └─ PageScrollContainer          (the only vertically-scrollable surface)
               └─ {children}
```

Key behaviors:
- **Inset sidebar** — the body floats as a rounded, shadowed card inset from the sidebar.
- **Icon-collapsible sidebar** — `Ctrl/⌘ + B` collapses to an icon rail; state persists in a cookie.
- **One scroll surface** — header/subheader are fixed; only `PageScrollContainer` scrolls,
  with top/bottom blur gradients that fade based on scroll position.
- **Context subheader** — any page can push content into the subheader via `useSubheader(...)`.
- **Command palette** — `Ctrl/⌘ + K` opens a navigation command menu.
- **Keyboard nav** — `Ctrl/⌘ + <letter>` jumps between sections (configurable per item).

---

## 2. Stack requirements

| Requirement | Note |
|---|---|
| Next.js (App Router) | 15+ (source built on 16) |
| React | 19 |
| Tailwind CSS | v3 or v4 — whatever your shadcn preset uses |
| shadcn/ui | **the host app's existing install + theme.** The layout adds no styling of its own. |
| `next-themes` | only for the dark-mode toggle (optional, see §3) |
| Icons | `lucide-react` (installed by `shadcn init`) |

> The layout assumes the target app is **already a shadcn project** (configured
> `globals.css` with the standard token set + a `components/ui` folder). It plugs into that.

Framework coupling is limited to `next/link`, `next/navigation` (`usePathname`,
`useRouter`), and `next/font`. Swap those to port to another React router.

---

## 3. Install

### 3a. npm packages (layout only — no auth, no db)

```bash
npm install next-themes
```

> `radix-ui` / `@radix-ui/*`, `cmdk`, `lucide-react`, `class-variance-authority`, `clsx`,
> and `tailwind-merge` are all installed by `shadcn init` / `shadcn add` — don't reinstall
> them. `next-themes` is the **only** genuinely-extra package, and it's optional:
>
> **Don't want dark mode / already have a theme system?** Skip `next-themes`, delete
> `components/ui/mode-toggle.tsx` + `components/providers/theme-provider.tsx`, and remove the
> `<ModeToggle />` line in `site-header.tsx`. Then there are **zero** deps beyond shadcn.

### 3b. shadcn components

Add these in the **target app** so they're generated against *its* theme — this is what makes
the styling match the host:

```bash
npx shadcn@latest add sidebar separator button tooltip breadcrumb command \
  dropdown-menu avatar kbd empty card skeleton sheet input
```

> `shadcn add sidebar` pulls most of these in transitively and injects the standard
> `--sidebar-*` tokens into the host's `globals.css` if missing. Note: `scroll-area` is **not**
> required — this spec's `PageScrollContainer` uses a native overflow viewport (§7.12).
> `mode-toggle` is **not** a shadcn component — it's the custom file in §7.13.

No `@clerk/*`, no `@supabase/*`, no design tokens copied from the source project.

---

## 4. Theming — bring your own (shadcn-agnostic)

**Do not copy any `globals.css` or design tokens.** The layout is built entirely on the
*standard* shadcn token vocabulary, so it renders in whatever palette, radius, and dark-mode
the target app defines. Same components, the host's styling.

Tokens the layout relies on existing (all shadcn defaults — your preset has them, or
`shadcn add sidebar`/`card` injects them):

| Token family | Used by |
|---|---|
| `background` / `foreground` | page surface, gradients (`from-background`) |
| `primary` / `primary-foreground` | the highlighted Dashboard button |
| `secondary` | header icon buttons |
| `muted` / `muted-foreground` | labels, kbd badges, empty-state text, search trigger |
| `accent` / `accent-foreground` | hover/active states |
| `border` / `input` / `ring` | dividers, focus rings, dashed empty-state border |
| `destructive` | "Log out" / destructive menu items |
| `card` / `card-foreground` | stat cards |
| `popover` / `popover-foreground` | dropdowns, command dialog |
| `sidebar`, `sidebar-foreground`, `sidebar-accent(-foreground)`, `sidebar-border`, `sidebar-ring`, `sidebar-primary(-foreground)` | the entire sidebar (added by `shadcn add sidebar`) |

The only **non-color** custom utility the source defines is `.no-scrollbar` (used inside the
shadcn `sidebar` component). The CLI-generated `sidebar` already includes it; if yours
doesn't, add once to the host app's CSS:

```css
@layer utilities {
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  .no-scrollbar::-webkit-scrollbar { display: none; }
}
```

That's it — no `:root`, no `.dark`, no `@theme` block from the source.

---

## 5. The `cn` helper — `lib/utils.ts`

Standard shadcn helper. **Skip copying this if you already ran `shadcn init`** — you have an
identical one.

```ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

---

## 6. Root layout providers — `app/layout.tsx`

**Skip this if the host app already has a root layout with a theme provider.** The shell only
needs `next-themes` mounted above it and a `TooltipProvider` (re-provided inside the
dashboard layout, so this is optional). Keep the host's own fonts and `globals.css` import.

```tsx
import { ThemeProvider } from "@/components/providers/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import "./globals.css"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

`components/providers/theme-provider.tsx`:

```tsx
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

---

## 7. The layout files

Create a route group `app/(dashboard)/` and drop the layout in. Code below is **verbatim**
with the files in this repo.

### 7.1 `app/(dashboard)/layout.tsx`

```tsx
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
```

### 7.2 `components/app-sidebar.tsx`  *(de-clerked, de-supabased)*

Logo + name are plain constants — swap them for your brand. Settings is always shown
(no role check). Keyboard shortcuts preserved.

```tsx
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
```

### 7.3 `components/nav-main.tsx`

The primary nav group: a highlighted "Dashboard" button paired with a "create new" dropdown,
then a `Workspace` label and the menu items with shortcut badges.

```tsx
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
```

### 7.4 `components/nav-documents.tsx`

The `Manage` group — shortcut badge absolutely positioned on the right.

```tsx
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
```

### 7.5 `components/nav-pinned.tsx`  *(empty state by default — no API)*

Renders an **empty state** until you supply data.

```tsx
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
            // once you have a data source.
            <p key={pin.id} className="px-2 py-1 text-sm">
              {pin.title}
            </p>
          ))
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}
```

### 7.6 `components/nav-user.tsx`  *(de-clerked — static user)*

The footer profile button + dropdown. Replace the `user` constant with your auth provider's
current user.

```tsx
"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { EllipsisVerticalIcon, CircleUserRoundIcon, LogOutIcon } from "lucide-react"

// ← wire your auth provider's user here.
const user = {
  fullName: "Jane Doe",
  email: "jane@example.com",
  imageUrl: "",
  initials: "JD",
}

export function NavUser() {
  const { isMobile } = useSidebar()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              tooltip="User Profile"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.imageUrl} alt={user.fullName} />
                <AvatarFallback className="rounded-lg">{user.initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.fullName}</span>
                <span className="text-muted-foreground truncate text-xs">{user.email}</span>
              </div>
              <EllipsisVerticalIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.imageUrl} alt={user.fullName} />
                  <AvatarFallback className="rounded-lg">{user.initials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.fullName}</span>
                  <span className="text-muted-foreground truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => { /* ← open account */ }}>
                <CircleUserRoundIcon />
                Account
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => { /* ← sign out */ }}>
              <LogOutIcon />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
```

### 7.7 `components/site-header.tsx`  *(de-API'd — command menu navigates pages only)*

Fixed top bar: sidebar toggle, breadcrumb (driven by the breadcrumb context, falling back to
a path label), and right-side actions (⌘K search, theme toggle, an action button). The
command palette lists navigation only.

```tsx
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
```

### 7.8 `components/site-subheader.tsx`

A second fixed bar that renders whatever the current page injects via `useSubheader(...)`.
Empty by default.

```tsx
"use client"

import { useSubheaderContext } from "@/components/subheader-context"

export function SiteSubheader() {
  const { content } = useSubheaderContext()
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-2 px-4 lg:px-6">{content}</div>
    </header>
  )
}
```

### 7.9 `components/subheader-context.tsx`

Two split contexts so a page can push content into the subheader without render loops (the
`useState` setter is stable). Call `useSubheader(<...>)` from any page.

```tsx
"use client"

import {
  createContext,
  useContext,
  useState,
  useLayoutEffect,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react"

// Split into two contexts so useSubheader only subscribes to the setter.
// The setter from useState is stable (same reference across renders), so
// calling setContent from useSubheader does NOT trigger a re-render in the
// component that called useSubheader — preventing an infinite loop.
const SetContentContext = createContext<Dispatch<SetStateAction<ReactNode>>>(() => {})
const ContentContext = createContext<ReactNode>(null)

export function SubheaderProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<ReactNode>(null)
  return (
    <SetContentContext.Provider value={setContent}>
      <ContentContext.Provider value={content}>{children}</ContentContext.Provider>
    </SetContentContext.Provider>
  )
}

// Call from a page/client component to render content in the subheader.
// Runs after every render to stay in sync with local state (filters, tabs…).
export function useSubheader(content: ReactNode) {
  const setContent = useContext(SetContentContext)
  useLayoutEffect(() => {
    setContent(content)
  })
}

export function useSubheaderContext() {
  return { content: useContext(ContentContext) }
}
```

### 7.10 `components/breadcrumb-context.tsx`

Lets a detail page set a `parent → label` breadcrumb that the header renders. Clears on
unmount.

```tsx
"use client"

import {
  createContext,
  useContext,
  useState,
  useLayoutEffect,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react"

type BreadcrumbData = { parent: string; parentUrl: string; label: string } | null

const SetBreadcrumbContext = createContext<Dispatch<SetStateAction<BreadcrumbData>>>(() => {})
const BreadcrumbDataContext = createContext<BreadcrumbData>(null)

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<BreadcrumbData>(null)
  return (
    <SetBreadcrumbContext.Provider value={setData}>
      <BreadcrumbDataContext.Provider value={data}>{children}</BreadcrumbDataContext.Provider>
    </SetBreadcrumbContext.Provider>
  )
}

// Call from a detail page to set a `parent → label` breadcrumb. Clears on unmount.
export function useBreadcrumb(parent: string, parentUrl: string, label: string) {
  const setData = useContext(SetBreadcrumbContext)
  useLayoutEffect(() => {
    setData({ parent, parentUrl, label })
    return () => setData(null)
  }, [parent, parentUrl, label, setData])
}

export function useBreadcrumbData() {
  return useContext(BreadcrumbDataContext)
}
```

### 7.11 `components/page-scroll-container.tsx`

The single scroll surface. Uses a **native overflow viewport** (so the only dependency is
your shadcn theme) and fades top/bottom blur gradients in/out as you scroll.

```tsx
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * PageScrollContainer — the dashboard body's single scroll surface.
 *
 *   ┌─ BODY container ─────────────────────────────────────┐
 *   │   px/py gutter — pure spacer between SidebarInset    │
 *   │   walls and the content container. NO scroll.        │
 *   │                                                      │
 *   │  ┌─ CONTENT container ───────────────────────────┐  │
 *   │  │   relative anchor. Holds the scrollable        │  │
 *   │  │   viewport. Owns the top/bottom blur gradients │  │
 *   │  │   that fade in/out based on scroll position.   │  │
 *   │  └────────────────────────────────────────────────┘  │
 *   └──────────────────────────────────────────────────────┘
 *
 * Why a separate body gutter + content container:
 *   - The body provides symmetric padding so child cards never bleed to the
 *     SidebarInset walls; the content container is the scroll viewport's
 *     positioning anchor for the gradients.
 *
 * Dynamic blur gradients:
 *   - Top visible only when scrolled down from the top.
 *   - Bottom visible only when more content exists below the viewport.
 *   - Visibility flips via a scroll listener + ResizeObserver (handles async
 *     content loading, sidebar collapse, etc.). Gradients are pointer-events:none.
 *
 * Note: this uses a native overflow viewport so the ONLY dependency is your
 * shadcn theme (no extra component needed). The original Dataprint build wrapped
 * a themed Radix ScrollArea here — swap it in if you want the auto-hiding,
 * token-styled scrollbar.
 */

type Props = {
  children: React.ReactNode
  className?: string
}

export function PageScrollContainer({ children, className }: Props) {
  const viewportRef = React.useRef<HTMLDivElement>(null)
  const [canScrollUp, setCanScrollUp] = React.useState(false)
  const [canScrollDown, setCanScrollDown] = React.useState(false)

  React.useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const update = () => {
      const { scrollTop, scrollHeight, clientHeight } = viewport
      // 1px tolerance — sub-pixel scrolling can leave scrollTop at fractions.
      setCanScrollUp(scrollTop > 1)
      setCanScrollDown(scrollTop + clientHeight < scrollHeight - 1)
    }

    update()
    viewport.addEventListener("scroll", update, { passive: true })

    const ro = new ResizeObserver(update)
    ro.observe(viewport)
    const inner = viewport.firstElementChild
    if (inner) ro.observe(inner)

    return () => {
      viewport.removeEventListener("scroll", update)
      ro.disconnect()
    }
  }, [])

  return (
    // BODY — pure spacer/gutter. NO scroll, NO gradients.
    <div className="flex-1 min-h-0 flex flex-col px-4 py-4 lg:px-6 lg:py-6" data-slot="page-body">
      {/* CONTENT — relative anchor for gradients; scroll lives inside. */}
      <div className="relative flex-1 min-h-0 flex flex-col" data-slot="page-content">
        <div
          ref={viewportRef}
          className={cn("flex-1 min-h-0 overflow-y-auto overflow-x-hidden", className)}
        >
          {children}
        </div>

        {/* Top gradient — hugs the content container's top edge. */}
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 z-10 h-6",
            "bg-gradient-to-b from-background to-transparent",
            "transition-opacity duration-150",
            canScrollUp ? "opacity-100" : "opacity-0"
          )}
        />

        {/* Bottom gradient — hugs the content container's bottom edge. */}
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-0 z-10 h-6",
            "bg-gradient-to-t from-background to-transparent",
            "transition-opacity duration-150",
            canScrollDown ? "opacity-100" : "opacity-0"
          )}
        />
      </div>
    </div>
  )
}
```

### 7.12 `components/ui/mode-toggle.tsx`

Light/dark/system switcher used in the header. Custom (not a shadcn block).

```tsx
"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export function ModeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon">
              <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">Theme</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

---

## 8. Empty states for pages with no data

Use the shadcn **Empty** component (added in §3b) for any page/section that has nothing to
show yet — the canonical "no data" pattern for this layout.

### Example page — `app/(dashboard)/pursuits/page.tsx`

```tsx
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty"
import { Button } from "@/components/ui/button"
import { CrosshairIcon, PlusIcon } from "lucide-react"

export default function PursuitsPage() {
  const items: unknown[] = [] // ← wire your data here

  if (items.length === 0) {
    return (
      <Empty className="min-h-[60vh]">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CrosshairIcon />
          </EmptyMedia>
          <EmptyTitle>No pursuits yet</EmptyTitle>
          <EmptyDescription>Create your first pursuit to start tracking it here.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button>
            <PlusIcon />
            New pursuit
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  return <div>{/* render items */}</div>
}
```

### Dashboard landing (cards as placeholders) — `app/(dashboard)/page.tsx`

```tsx
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6 @container/main">
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Active Pursuits</CardDescription>
            <CardTitle className="text-2xl font-bold">—</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Pipeline Value</CardDescription>
            <CardTitle className="text-2xl font-bold">—</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Win Rate</CardDescription>
            <CardTitle className="text-2xl font-bold">—</CardTitle>
          </CardHeader>
        </Card>
      </div>
      {/* ← drop your page content (table, charts, etc.) here */}
    </div>
  )
}
```

---

## 9. File checklist

```
app/
  globals.css                              # host app's own — DON'T overwrite (ensure
                                           #   .no-scrollbar exists, §4)
  layout.tsx                               # §6 root — host's own if it already has one
  (dashboard)/
    layout.tsx                             # §7.1 the shell
    page.tsx                               # §8 dashboard landing (placeholders)
    pursuits/page.tsx                      # §8 example empty-state page
    ...                                    # your other pages
components/
  app-sidebar.tsx                          # §7.2
  nav-main.tsx                             # §7.3
  nav-documents.tsx                        # §7.4
  nav-pinned.tsx                           # §7.5 (empty state)
  nav-user.tsx                             # §7.6 (static user)
  site-header.tsx                          # §7.7
  site-subheader.tsx                       # §7.8
  subheader-context.tsx                    # §7.9
  breadcrumb-context.tsx                   # §7.10
  page-scroll-container.tsx                # §7.11
  providers/theme-provider.tsx             # §6
  ui/
    mode-toggle.tsx                        # §7.12 (custom)
    # everything else here is generated in the HOST app via `shadcn add`
    # (sidebar, button, tooltip, separator, breadcrumb, command, dropdown-menu,
    #  avatar, kbd, empty, card, skeleton, sheet, input) — styled by the host theme.
lib/
  utils.ts                                 # §5 cn() — skip if you already have it
```

---

## 10. Customizing

- **Brand:** change `APP_NAME` / `APP_LOGO` in `app-sidebar.tsx` (§7.2).
- **Nav items:** edit the `navMain` / `documents` arrays (§7.2) and keep the matching
  `PAGE_LABELS` / `NAV_ITEMS` in `site-header.tsx` (§7.7) in sync.
- **Sidebar width / header height:** the two CSS vars in `(dashboard)/layout.tsx` (§7.1) —
  `--sidebar-width` (default 15rem) and `--header-height` (default 3rem).
- **Collapse behavior:** `collapsible="icon"` on `<AppSidebar>`. Use `"offcanvas"` to slide
  it fully out, or `"none"` to pin it open.
- **Colors / theme:** nothing to change here — the shell inherits the host app's shadcn
  preset. Restyle by editing *that app's* tokens, not this spec.
- **Wire data:** the marked `// ← wire your data here` / `// ← wire your auth …` spots in
  `nav-pinned.tsx`, `nav-user.tsx`, and `app-sidebar.tsx` (logo) are the only places that
  previously touched Clerk/Supabase.

### Context hooks

```tsx
// Inject content into the fixed subheader (filters, tabs, a title…)
useSubheader(<MyFilters />)

// Set a parent → label breadcrumb on a detail page
useBreadcrumb("Pursuits", "/pursuits", pursuit.name)
```

---

*Generated from the Dataprint codebase — https://github.com/shaun-mo/dataprint — layout shell only; auth/db stripped, styling inherited from the host app's shadcn theme.*