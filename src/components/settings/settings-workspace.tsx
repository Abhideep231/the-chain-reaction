"use client"

import * as React from "react"
import { CheckCircle2Icon } from "lucide-react"

import { AboutCard } from "@/components/settings/about-card"
import { SelectSetting } from "@/components/settings/select-setting"
import { SettingsSection } from "@/components/settings/settings-section"
import { SettingsSummaryPanel } from "@/components/settings/settings-summary-panel"
import { ToggleSetting } from "@/components/settings/toggle-setting"
import { useUtilityPanelContent } from "@/components/layout/utility-panel-provider"
import { applicationInformation } from "@/lib/settings-mock"
import { cn } from "@/lib/utils"
import { useSettings } from "@/hooks/use-settings"

export function SettingsWorkspace() {
  const {
    theme,
    settings,
    isHydrated,
    showSavedBanner,
    updateTheme,
    updateAppearance,
    updateAi,
    updatePdf,
    updateCalculations,
    updateNotifications,
  } = useSettings()

  const panelContent = React.useMemo(
    () => (
      <SettingsSummaryPanel
        theme={theme}
        settings={settings}
        isHydrated={isHydrated}
      />
    ),
    [theme, settings, isHydrated]
  )
  useUtilityPanelContent(panelContent, { openOnMount: true })

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-6 overflow-y-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Configure application preferences and engineering workspace
            options.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SettingsSection
          title="Appearance"
          description="Control how the application looks and feels."
        >
          <SelectSetting
            label="Theme"
            value={theme}
            onChange={updateTheme}
            options={[
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
              { value: "system", label: "System" },
            ]}
          />
          <ToggleSetting
            label="Compact Density"
            description="Reduce spacing to fit more on screen."
            checked={settings.appearance.compactDensity}
            onCheckedChange={(value) =>
              updateAppearance("compactDensity", value)
            }
          />
          <ToggleSetting
            label="Animations"
            description="Enable interface transitions and motion."
            checked={settings.appearance.animationsEnabled}
            onCheckedChange={(value) =>
              updateAppearance("animationsEnabled", value)
            }
          />
        </SettingsSection>

        <SettingsSection
          title="AI Preferences"
          description="Future backend will persist these settings."
        >
          <SelectSetting
            label="Response Style"
            value={settings.ai.responseStyle}
            onChange={(value) => updateAi("responseStyle", value)}
            options={[
              { value: "concise", label: "Concise" },
              { value: "detailed", label: "Detailed" },
            ]}
          />
          <ToggleSetting
            label="Citation Mode"
            description="Always show citations with engineering answers."
            checked={settings.ai.alwaysShowCitations}
            onCheckedChange={(value) => updateAi("alwaysShowCitations", value)}
          />
          <ToggleSetting
            label="Confidence Indicator"
            description="Enable the confidence badge on answers."
            checked={settings.ai.confidenceBadgeEnabled}
            onCheckedChange={(value) =>
              updateAi("confidenceBadgeEnabled", value)
            }
          />
          <ToggleSetting
            label="Suggested Questions"
            description="Enable suggested prompts in Ask AI."
            checked={settings.ai.suggestedPromptsEnabled}
            onCheckedChange={(value) =>
              updateAi("suggestedPromptsEnabled", value)
            }
          />
        </SettingsSection>

        <SettingsSection title="PDF Viewer Settings">
          <SelectSetting
            label="Default Zoom"
            value={settings.pdf.defaultZoom}
            onChange={(value) => updatePdf("defaultZoom", value)}
            options={[
              { value: "fit-width", label: "Fit Width" },
              { value: "fit-page", label: "Fit Page" },
              { value: "100", label: "100%" },
              { value: "125", label: "125%" },
              { value: "150", label: "150%" },
            ]}
          />
          <ToggleSetting
            label="Highlight Citations"
            description="Overlay retrieved regions on the PDF page."
            checked={settings.pdf.highlightCitations}
            onCheckedChange={(value) => updatePdf("highlightCitations", value)}
          />
          <ToggleSetting
            label="Open Citation in Side Panel"
            description="Show citation details in the utility panel."
            checked={settings.pdf.openCitationInSidePanel}
            onCheckedChange={(value) =>
              updatePdf("openCitationInSidePanel", value)
            }
          />
          <ToggleSetting
            label="Remember Last Viewed Page"
            description="Reopen documents on the page you left off."
            checked={settings.pdf.rememberLastViewedPage}
            onCheckedChange={(value) =>
              updatePdf("rememberLastViewedPage", value)
            }
          />
        </SettingsSection>

        <SettingsSection title="Calculation Settings">
          <SelectSetting
            label="Preferred Units"
            value={settings.calculations.preferredUnits}
            onChange={(value) => updateCalculations("preferredUnits", value)}
            options={[
              { value: "metric", label: "Metric" },
              { value: "imperial", label: "Imperial" },
            ]}
          />
          <SelectSetting
            label="Engineering Explanation"
            value={settings.calculations.engineeringExplanation}
            onChange={(value) =>
              updateCalculations("engineeringExplanation", value)
            }
            options={[
              { value: "simple", label: "Simple" },
              { value: "detailed", label: "Detailed" },
            ]}
          />
          <ToggleSetting
            label="Default Safety Factor Display"
            description="Show the safety factor card by default."
            checked={settings.calculations.showDefaultSafetyFactor}
            onCheckedChange={(value) =>
              updateCalculations("showDefaultSafetyFactor", value)
            }
          />
          <SelectSetting
            label="Calculation Precision"
            value={settings.calculations.calculationPrecision}
            onChange={(value) =>
              updateCalculations("calculationPrecision", value)
            }
            options={[
              { value: "2", label: "2 Decimals" },
              { value: "3", label: "3 Decimals" },
            ]}
          />
        </SettingsSection>

        <SettingsSection
          title="Notifications"
          description="Placeholder settings only — all stored locally."
        >
          <ToggleSetting
            label="Knowledge Base Updated"
            checked={settings.notifications.knowledgeBaseUpdated}
            onCheckedChange={(value) =>
              updateNotifications("knowledgeBaseUpdated", value)
            }
          />
          <ToggleSetting
            label="Document Indexed"
            checked={settings.notifications.documentIndexed}
            onCheckedChange={(value) =>
              updateNotifications("documentIndexed", value)
            }
          />
          <ToggleSetting
            label="System Health Alerts"
            checked={settings.notifications.systemHealthAlerts}
            onCheckedChange={(value) =>
              updateNotifications("systemHealthAlerts", value)
            }
          />
          <ToggleSetting
            label="Calculation Completed"
            checked={settings.notifications.calculationCompleted}
            onCheckedChange={(value) =>
              updateNotifications("calculationCompleted", value)
            }
          />
        </SettingsSection>

        <SettingsSection title="About">
          <AboutCard info={applicationInformation} />
        </SettingsSection>
      </div>

      <div
        role="status"
        aria-live="polite"
        className={cn(
          "pointer-events-none fixed right-4 bottom-4 z-50 flex items-center gap-2 rounded-full border bg-card px-3.5 py-2 text-sm shadow-md transition-all duration-300",
          showSavedBanner
            ? "translate-y-0 opacity-100"
            : "translate-y-2 opacity-0"
        )}
      >
        <CheckCircle2Icon className="size-4 text-status-good" />
        Preferences saved locally
      </div>
    </div>
  )
}
