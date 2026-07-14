import { CheckCircle2Icon, DownloadIcon, RotateCcwIcon } from "lucide-react"

import { KeyValueList } from "@/components/shared/key-value-list"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { PersistedSettings, ThemePreference } from "@/types/settings"

const themeLabel: Record<ThemePreference, string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
}

export function SettingsSummaryPanel({
  theme,
  settings,
  isHydrated,
}: {
  theme: ThemePreference
  settings: PersistedSettings
  isHydrated: boolean
}) {
  return (
    <div className="flex w-80 flex-1 flex-col overflow-hidden">
      <div className="flex h-14 w-80 shrink-0 items-center border-b pr-12 pl-4">
        <span className="text-sm font-medium">Settings Summary</span>
      </div>

      <div className="flex w-80 flex-1 flex-col gap-6 overflow-auto p-4">
        <section className="flex flex-col gap-2">
          <KeyValueList
            items={[
              { label: "Current Theme", value: themeLabel[theme] },
              {
                label: "AI Response Style",
                value: settings.ai.responseStyle === "concise" ? "Concise" : "Detailed",
              },
              {
                label: "Preferred Units",
                value: settings.calculations.preferredUnits === "metric" ? "Metric" : "Imperial",
              },
              {
                label: "Citation Mode",
                value: settings.ai.alwaysShowCitations ? "Always Show" : "On Demand",
              },
              {
                label: "Engineering Explanation",
                value:
                  settings.calculations.engineeringExplanation === "simple"
                    ? "Simple"
                    : "Detailed",
              },
            ]}
          />
        </section>

        <section className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <CheckCircle2Icon className="size-4 shrink-0 text-status-good" />
          {isHydrated ? "Preferences saved locally" : "Loading preferences…"}
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Quick Actions
          </h3>
          <div className="flex flex-col gap-1.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="justify-start">
                  <RotateCcwIcon />
                  Reset to Defaults
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Reset to Defaults isn&apos;t connected yet
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="justify-start">
                  <DownloadIcon />
                  Export Preferences
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Export Preferences isn&apos;t connected yet
              </TooltipContent>
            </Tooltip>
          </div>
        </section>
      </div>
    </div>
  )
}
