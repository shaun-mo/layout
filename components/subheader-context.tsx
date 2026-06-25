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