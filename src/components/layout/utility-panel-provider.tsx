"use client"

import * as React from "react"

const MOBILE_BREAKPOINT = 768

type UtilityPanelContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
  content: React.ReactNode | null
  setContent: (content: React.ReactNode | null) => void
}

const UtilityPanelContext =
  React.createContext<UtilityPanelContextValue | null>(null)

export function UtilityPanelProvider({
  children,
  defaultOpen = false,
}: {
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = React.useState(defaultOpen)
  const [content, setContent] = React.useState<React.ReactNode | null>(null)

  const value = React.useMemo<UtilityPanelContextValue>(
    () => ({
      open,
      setOpen,
      toggle: () => setOpen((prev) => !prev),
      content,
      setContent,
    }),
    [open, content]
  )

  return (
    <UtilityPanelContext.Provider value={value}>
      {children}
    </UtilityPanelContext.Provider>
  )
}

export function useUtilityPanel() {
  const context = React.useContext(UtilityPanelContext)
  if (!context) {
    throw new Error(
      "useUtilityPanel must be used within a UtilityPanelProvider."
    )
  }
  return context
}

/**
 * Lets a page publish its own content into the shell's utility panel
 * instead of the shell needing to know about page-specific UI. The
 * content is cleared automatically when the page unmounts (e.g. on
 * navigation), so the panel falls back to its default placeholder.
 */
export function useUtilityPanelContent(
  content: React.ReactNode,
  options?: { openOnMount?: boolean }
) {
  const { setContent, setOpen } = useUtilityPanel()
  const openOnMount = options?.openOnMount ?? false

  React.useEffect(() => {
    setContent(content)
    return () => setContent(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content])

  React.useEffect(() => {
    if (!openOnMount) {
      return
    }
    // On mobile the panel renders as a full-screen Sheet, so auto-opening
    // it on mount would immediately block the page behind an overlay.
    // Checked synchronously (rather than via useIsMobile) so there is no
    // render where a real mobile viewport briefly reports "not mobile".
    const isMobile = window.matchMedia(
      `(max-width: ${MOBILE_BREAKPOINT - 1}px)`
    ).matches
    if (!isMobile) {
      setOpen(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openOnMount])
}
