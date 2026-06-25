# SaaS Management Platform — Dashboard Layout

The production dashboard **shell** extracted from [Dataprint](https://github.com/shaun-mo/dataprint),
a SaaS management platform for proposal / pursuit management. This repo is **layout only** —
the chrome that wraps every page: a collapsible icon sidebar, a fixed header with a command
palette, a per-page context subheader, and a single themed scroll surface.

It carries **no business logic, no database, and no auth.** Everything that used to talk to
Clerk or Supabase has been replaced with static placeholders and empty states, marked with
`// ← wire your data here`. Drop it into any Next.js + shadcn app and it adopts that app's
theme automatically.

> **Why this exists:** so you (or an AI agent) can reproduce this exact dashboard layout in a
> new application 1:1 by copying a dozen files — no design system to rebuild, no dependencies
> to untangle.

---

## What you get

```
┌────────────┬──────────────────────────────────────────────────────────┐
│            │  Header   [☰] Breadcrumb …                [⌘K] [🌓] [chat] │  ← fixed, h=3rem
│            ├──────────────────────────────────────────────────────────┤
│  Sidebar   │  Subheader   (per-page context: filters, tabs, title…)    │  ← fixed, h=3rem
│  (icon-    ├──────────────────────────────────────────────────────────┤
│  collap-   │                                                          ░ │
│  sible)    │   Page content (the ONLY scrollable surface)             ░ │
│            │   top/bottom blur gradients fade in/out with scroll      ░ │
│  • Nav     │                                                          ░ │
│  • Pinned  │                                                          ░ │
│  • Manage  │                                                            │
│  • User    │                                                            │
└────────────┴──────────────────────────────────────────────────────────┘
```

- **Inset, icon-collapsible sidebar** — the body floats as a rounded, shadowed card inset
  from the rail. `Ctrl/⌘ + B` collapses the sidebar to icons; state persists in a cookie.
- **Command palette** — `Ctrl/⌘ + K` opens a navigation command menu (`cmdk`).
- **Keyboard navigation** — `Ctrl/⌘ + <letter>` jumps between sections (configurable).
- **Context subheader** — any page can push content (filters, tabs, a title) into the fixed
  subheader via `useSubheader(...)` — no prop drilling.
- **Single scroll surface** — header/subheader stay fixed; only the page body scrolls, with
  top/bottom blur gradients that fade based on scroll position.
- **Dark mode** — light / dark / system toggle in the header (`next-themes`).
- **Theme-agnostic** — uses only standard shadcn token names, so it inherits *your* palette.

---

## Requirements

This is meant to be dropped into an **existing Next.js (App Router) app that already has
shadcn/ui initialized**. That single prerequisite supplies almost everything the layout needs.

| You need | How you get it |
|---|---|
| Next.js App Router + Tailwind | `npx create-next-app@latest` |
| shadcn/ui initialized (tokens, `cn`, `lib/utils.ts`, `lucide-react`, `cva`, `clsx`, `tailwind-merge`) | `npx shadcn@latest init` |
| The shadcn UI primitives this layout imports | one `shadcn add` command (below) |
| `next-themes` | the **only** extra package — for the dark-mode toggle (optional, see below) |

If you ran `create-next-app` + `shadcn init`, the only thing left to install by hand is
`next-themes`. Everything else comes from shadcn.

---

## Installation

### 1. Add the shadcn components this layout uses

Run this in your app so the primitives are generated against **your** theme:

```bash
npx shadcn@latest add sidebar separator button tooltip breadcrumb command \
  dropdown-menu avatar kbd empty card skeleton sheet input
```

> `sidebar` pulls in most of the rest transitively; the explicit list is just to be safe.
> `shadcn add sidebar` also injects the standard `--sidebar-*` tokens into your `globals.css`
> if they're missing — which is what makes the sidebar match your app's palette.

### 2. Install the one extra dependency

```bash
npm install next-themes
```

> **Don't want dark mode / already have a theme system?** Skip this, then delete
> `components/ui/mode-toggle.tsx` and `components/providers/theme-provider.tsx`, and remove
> the `<ModeToggle />` line in `components/site-header.tsx`. Then there are **zero** extra
> dependencies beyond shadcn.

### 3. Copy the layout files into your app

Copy these into the matching paths (they all import via the `@/*` alias shadcn sets up):

```
app/(dashboard)/layout.tsx          # the shell
components/app-sidebar.tsx          # sidebar (brand + nav config live here)
components/nav-main.tsx             # "Workspace" nav group + create-new menu
components/nav-documents.tsx        # "Manage" nav group
components/nav-pinned.tsx           # "Pinned" group (empty state by default)
components/nav-user.tsx             # footer user menu (static placeholder user)
components/site-header.tsx          # fixed header + ⌘K command palette
components/site-subheader.tsx       # fixed context subheader
components/subheader-context.tsx    # lets pages inject subheader content
components/breadcrumb-context.tsx   # lets detail pages set a breadcrumb
components/page-scroll-container.tsx# the single scroll surface + blur gradients
components/providers/theme-provider.tsx
components/ui/mode-toggle.tsx       # custom (not a shadcn block)
lib/utils.ts                        # standard shadcn cn() — skip if you already have it
```

### 4. Mount the theme provider in your root layout

In `app/layout.tsx`, wrap your app so `next-themes` and tooltips are available:

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

### 5. Add some pages

Every route folder inside `app/(dashboard)/` renders inside the shell. The sidebar/header
nav point at `/`, `/inbox`, `/pursuits`, `/opportunities`, `/assets`, `/database`,
`/connections`, `/templates`, `/settings` by default — create the routes you keep and edit
the nav config (see Customizing).

```tsx
// app/(dashboard)/page.tsx
export default function DashboardPage() {
  return <div className="p-4 lg:p-6">Hello from inside the layout.</div>
}
```

That's it — run `npm run dev` and the shell is live.

---

## Customizing

- **Brand:** edit `APP_NAME` / `APP_LOGO` in `components/app-sidebar.tsx` (drop a square logo
  in `/public`, or remove the `<img>`).
- **Nav items:** edit the `navMain` / `documents` arrays in `app-sidebar.tsx`, and keep the
  matching `PAGE_LABELS` / `NAV_ITEMS` in `site-header.tsx` in sync (they drive the breadcrumb
  label and the ⌘K palette).
- **Sidebar width / header height:** the two CSS vars in `app/(dashboard)/layout.tsx`
  (`--sidebar-width`, default 15rem; `--header-height`, default 3rem).
- **Collapse behavior:** `collapsible="icon"` on `<AppSidebar>` → use `"offcanvas"` to slide
  it fully out, or `"none"` to pin it open.
- **Colors:** nothing to do — the shell inherits your shadcn theme. Restyle by editing your
  app's tokens.

---

## Wiring in data

The layout ships with placeholders where the original app fetched data. Each is marked with
`// ← wire your data here`:

| File | Placeholder | Replace with |
|---|---|---|
| `components/app-sidebar.tsx` | `APP_NAME` / `APP_LOGO` constants | your org name + logo (or your auth provider's org) |
| `components/nav-user.tsx` | static `user` object | your auth provider's current user |
| `components/nav-pinned.tsx` | empty `pins` array | your pinned/favorited records |

Use the context hooks from any page or client component:

```tsx
// Inject content into the fixed subheader (filters, tabs, a title…)
useSubheader(<MyFilters />)

// Set a parent → label breadcrumb on a detail page
useBreadcrumb("Pursuits", "/pursuits", pursuit.name)
```

For "no data yet" states, use the shadcn `Empty` component (you already added it in step 1).

---

## Notes

- **Scrollbar:** `page-scroll-container.tsx` uses a native overflow viewport so the only
  dependency is your shadcn theme. The original Dataprint build wrapped a themed Radix
  `ScrollArea` here for an auto-hiding, token-styled bar — see the source repo if you want it.
- **What was removed:** all Clerk (`useUser`, `useOrganization`, `useClerk`) and Supabase
  calls, the settings dialog, per-record search results in the command palette, and the
  dashboard's charts/data-table/calendar (those are page *content*, not layout).
- **Stack the source was built on:** Next.js 16, React 19, Tailwind v4, shadcn/ui. The layout
  also works on Tailwind v3 + shadcn as long as your tokens are the standard set.

---

## Source

Extracted from **Dataprint** — https://github.com/shaun-mo/dataprint.
Layout shell only; auth/db stripped, styling inherited from the host app's shadcn theme.