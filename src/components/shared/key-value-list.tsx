import type { KeyValueItem } from "@/types/shared"

export function KeyValueList({ items }: { items: KeyValueItem[] }) {
  return (
    <div className="rounded-md border bg-muted/40">
      <dl className="divide-y divide-border">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between gap-4 px-3 py-2 text-sm"
          >
            <dt className="text-muted-foreground">{item.label}</dt>
            <dd className="text-right font-medium tabular-nums">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
