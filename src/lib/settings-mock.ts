import type { ApplicationInformation, PersistedSettings } from "@/types/settings"

/**
 * Default preferences and static application info for the Settings
 * module. There is no preferences API yet — Sprint 8 is frontend-only,
 * and Sprint 16 (frontend-backend integration) confirmed no sprint
 * since has added one either. `defaultSettings` is what a fresh session
 * starts from; `use-settings.ts` persists changes to sessionStorage
 * under `SETTINGS_STORAGE_KEY`.
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
  backend: "FastAPI",
  vectorDatabase: "ChromaDB",
  llm: "Claude",
  pdfParser: "PyMuPDF",
  embeddingModel: "OpenAI text-embedding-3-large",
  lastUpdated: "Jul 16, 2026",
}
