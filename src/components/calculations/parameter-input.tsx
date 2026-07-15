import { Input } from "@/components/ui/input"

interface BaseProps {
  label: string
  unit?: string
}

interface NumberParameterInputProps extends BaseProps {
  type: "number"
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
}

interface SelectParameterInputProps extends BaseProps {
  type: "select"
  value: string
  onChange: (value: string) => void
  options: readonly string[]
}

type ParameterInputProps = NumberParameterInputProps | SelectParameterInputProps

export function ParameterInput(props: ParameterInputProps) {
  const { label, unit } = props

  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="flex items-baseline justify-between text-muted-foreground">
        <span>{label}</span>
        {unit && <span className="text-xs">{unit}</span>}
      </span>
      {props.type === "number" ? (
        <Input
          type="number"
          value={props.value}
          onChange={(event) => props.onChange(Number(event.target.value))}
          min={props.min}
          max={props.max}
          step={props.step ?? "any"}
          className="tabular-nums"
        />
      ) : (
        <select
          value={props.value}
          onChange={(event) => props.onChange(event.target.value)}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
        >
          {props.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      )}
    </label>
  )
}
