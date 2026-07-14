import { MinusIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import type { ReferencedDocument } from "@/types/dashboard"

const trendConfig = {
  up: { icon: TrendingUpIcon, className: "text-emerald-700 dark:text-emerald-400" },
  down: { icon: TrendingDownIcon, className: "text-destructive" },
  flat: { icon: MinusIcon, className: "text-muted-foreground" },
}

export function ReferenceTable({
  documents,
}: {
  documents: ReferencedDocument[]
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-4">
      <h3 className="text-sm font-semibold">Top Referenced Documents</h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse text-sm">
          <thead>
            <tr className="border-b text-left text-xs text-muted-foreground">
              <th className="w-10 py-2 font-medium">#</th>
              <th className="py-2 font-medium">Document</th>
              <th className="py-2 font-medium">Product Family</th>
              <th className="py-2 text-right font-medium">References</th>
              <th className="w-10 py-2 text-right font-medium">Trend</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((document) => {
              const trend = trendConfig[document.trend]
              const TrendIcon = trend.icon
              return (
                <tr key={document.id} className="border-b last:border-b-0">
                  <td className="py-2.5 tabular-nums text-muted-foreground">
                    {document.rank}
                  </td>
                  <td className="py-2.5 font-medium">{document.title}</td>
                  <td className="py-2.5 text-muted-foreground">
                    {document.productFamily}
                  </td>
                  <td className="py-2.5 text-right tabular-nums">
                    {document.referenceCount}
                  </td>
                  <td className="py-2.5 text-right">
                    <TrendIcon className={cn("ml-auto size-4", trend.className)} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
