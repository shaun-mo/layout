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