import type { ApplicationInformation, PersistedSettings } from "@/types/settings"

/**
 * Default preferences and static application info for the Settings
 * module. There is no preferences API yet — Sprint 8 is frontend-only.
 * `defaultSettings` is what a fresh session starts from; `use-settings.ts`
 * persists changes to sessionStorage under `SETTINGS_STORAGE_KEY`.
 */

export const SETTINGS_STORAGE_KEY = "chain-reaction:settings"

export const defaultSettings: PersistedSettings = {
  appearance: {
    compactDensity: false,
    animationsEnabled: true,
  },
  ai: {
    responseStyle: "detailed",
    alwaysShowCitations: true,
    confidenceBadgeEnabled: true,
    suggestedPromptsEnabled: true,
  },
  pdf: {
    defaultZoom: "fit-width",
    highlightCitations: true,
    openCitationInSidePanel: true,
    rememberLastViewedPage: true,
  },
  calculations: {
    preferredUnits: "metric",
    engineeringExplanation: "detailed",
    showDefaultSafetyFactor: true,
    calculationPrecision: "2",
  },
  notifications: {
    knowledgeBaseUpdated: true,
    documentIndexed: true,
    systemHealthAlerts: true,
    calculationCompleted: false,
  },
}

export const applicationInformation: ApplicationInformation = {
  applicationName: "The Chain Reaction",
  version: "0.1 MVP",
  frontend: "Next.js 15",
  backend: "FastAPI (Planned)",
  vectorDatabase: "ChromaDB",
  llm: "Claude",
  pdfParser: "PyMuPDF",
  embeddingModel: "OpenAI text-embedding-3-large (Planned)",
  lastUpdated: "Jul 14, 2026",
}
