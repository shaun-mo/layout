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