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