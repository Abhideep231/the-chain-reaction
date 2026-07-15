"use client"

import * as React from "react"
import { useTheme } from "next-themes"

import { defaultSettings, SETTINGS_STORAGE_KEY } from "@/lib/settings-mock"
import type {
  AiSettings,
  CalculationSettings,
  NotificationSettings,
  PdfSettings,
  PersistedSettings,
  ThemePreference,
} from "@/types/settings"

const SAVED_BANNER_DURATION_MS = 2000

export function useSettings() {
  // Theme is sourced from next-themes (wired app-wide since Sprint 1)
  // rather than duplicated in local state — this is the one setting with
  // a real, already-existing effect on the app.
  const { theme, setTheme } = useTheme()

  const [settings, setSettings] = React.useState<PersistedSettings>(
    defaultSettings
  )
  const [isHydrated, setIsHydrated] = React.useState(false)
  const [showSavedBanner, setShowSavedBanner] = React.useState(false)
  const isFirstChange = React.useRef(true)

  // Read any persisted preferences once, after mount, so the server-
  // rendered and first client render always match (avoiding a hydration
  // mismatch) before restoring the session's real values.
  React.useEffect(() => {
    try {
      const stored = window.sessionStorage.getItem(SETTINGS_STORAGE_KEY)
      if (stored) {
        setSettings(JSON.parse(stored) as PersistedSettings)
      }
    } catch {
      // Corrupted or inaccessible storage — fall back to defaults.
    }
    setIsHydrated(true)
  }, [])

  React.useEffect(() => {
    if (!isHydrated) return
    window.sessionStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))

    if (isFirstChange.current) {
      isFirstChange.current = false
      return
    }
    setShowSavedBanner(true)
    const timeout = window.setTimeout(
      () => setShowSavedBanner(false),
      SAVED_BANNER_DURATION_MS
    )
    return () => window.clearTimeout(timeout)
  }, [settings, isHydrated])

  const updateAppearance = React.useCallback(
    (field: keyof PersistedSettings["appearance"], value: boolean) => {
      setSettings((prev) => ({
        ...prev,
        appearance: { ...prev.appearance, [field]: value },
      }))
    },
    []
  )

  const updateAi = React.useCallback(
    <K extends keyof AiSettings>(field: K, value: AiSettings[K]) => {
      setSettings((prev) => ({ ...prev, ai: { ...prev.ai, [field]: value } }))
    },
    []
  )

  const updatePdf = React.useCallback(
    <K extends keyof PdfSettings>(field: K, value: PdfSettings[K]) => {
      setSettings((prev) => ({ ...prev, pdf: { ...prev.pdf, [field]: value } }))
    },
    []
  )

  const updateCalculations = React.useCallback(
    <K extends keyof CalculationSettings>(
      field: K,
      value: CalculationSettings[K]
    ) => {
      setSettings((prev) => ({
        ...prev,
        calculations: { ...prev.calculations, [field]: value },
      }))
    },
    []
  )

  const updateNotifications = React.useCallback(
    (field: keyof NotificationSettings, value: boolean) => {
      setSettings((prev) => ({
        ...prev,
        notifications: { ...prev.notifications, [field]: value },
      }))
    },
    []
  )

  const updateTheme = React.useCallback(
    (value: ThemePreference) => {
      setTheme(value)
      // Trigger the same "saved" feedback as every other setting, even
      // though this field isn't part of the sessionStorage blob.
      setShowSavedBanner(true)
      window.setTimeout(
        () => setShowSavedBanner(false),
        SAVED_BANNER_DURATION_MS
      )
    },
    [setTheme]
  )

  return {
    theme: (theme as ThemePreference) ?? "system",
    settings,
    isHydrated,
    showSavedBanner,
    updateTheme,
    updateAppearance,
    updateAi,
    updatePdf,
    updateCalculations,
    updateNotifications,
  }
}
