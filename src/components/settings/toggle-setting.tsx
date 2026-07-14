import { SettingRow } from "@/components/settings/setting-row"
import { Switch } from "@/components/ui/switch"

export function ToggleSetting({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string
  description?: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <SettingRow label={label} description={description}>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        aria-label={label}
      />
    </SettingRow>
  )
}
