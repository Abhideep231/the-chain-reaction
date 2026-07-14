"use client"

import * as React from "react"

type UtilityPanelContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
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

  const value = React.useMemo<UtilityPanelContextValue>(
    () => ({
      open,
      setOpen,
      toggle: () => setOpen((prev) => !prev),
    }),
    [open]
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
