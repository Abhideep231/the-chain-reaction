export type ThemePreference = "light" | "dark" | "system"
export type ResponseStyle = "concise" | "detailed"
export type DefaultZoomOption = "fit-width" | "fit-page" | "100" | "125" | "150"
export type UnitSystem = "metric" | "imperial"
export type ExplanationDetail = "simple" | "detailed"
export type CalculationPrecision = "2" | "3"

export interface AppearanceSettings {
  theme: ThemePreference
  compactDensity: boolean
  animationsEnabled: boolean
}

export interface AiSettings {
  responseStyle: ResponseStyle
  alwaysShowCitations: boolean
  confidenceBadgeEnabled: boolean
  suggestedPromptsEnabled: boolean
}

export interface PdfSettings {
  defaultZoom: DefaultZoomOption
  highlightCitations: boolean
  openCitationInSidePanel: boolean
  rememberLastViewedPage: boolean
}

export interface CalculationSettings {
  preferredUnits: UnitSystem
  engineeringExplanation: ExplanationDetail
  showDefaultSafetyFactor: boolean
  calculationPrecision: CalculationPrecision
}

export interface NotificationSettings {
  knowledgeBaseUpdated: boolean
  documentIndexed: boolean
  systemHealthAlerts: boolean
  calculationCompleted: boolean
}

export interface ApplicationInformation {
  applicationName: string
  version: string
  frontend: string
  backend: string
  vectorDatabase: string
  llm: string
  pdfParser: string
  embeddingModel: string
  lastUpdated: string
}

/** Everything except `appearance.theme`, which is sourced from next-themes
 * (already wired app-wide since Sprint 1) rather than duplicated here. */
export interface PersistedSettings {
  appearance: Omit<AppearanceSettings, "theme">
  ai: AiSettings
  pdf: PdfSettings
  calculations: CalculationSettings
  notifications: NotificationSettings
}
