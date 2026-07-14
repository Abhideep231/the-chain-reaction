import { ImageIcon, ListIcon, TableIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import type { PdfPageContent } from "@/types/pdf"

/**
 * Stands in for a rendered PDF page. Nothing here reads an actual PDF —
 * each "kind" is a hand-built wireframe of what that page would look
 * like in a real ANSI/ASME-style manual. See the component's README
 * note in the Sprint 3 write-up for how this gets replaced by
 * react-pdf's <Page> component.
 */
export function PdfPlaceholder({
  page,
  compact = false,
}: {
  page: PdfPageContent
  compact?: boolean
}) {
  if (compact) {
    return <CompactPreview page={page} />
  }

  switch (page.kind) {
    case "cover":
      return (
        <div className="flex h-full flex-col items-center justify-center gap-4 p-12 text-center">
          <span className="text-xs font-medium tracking-widest text-neutral-500 uppercase">
            {page.title}
          </span>
          <h1 className="max-w-md text-2xl font-semibold text-neutral-900">
            {page.subtitle}
          </h1>
          <div className="mt-auto flex w-full items-center justify-center border-t pt-4 text-xs text-neutral-500">
            Page {page.pageNumber}
          </div>
        </div>
      )

    case "toc":
      return (
        <div className="flex h-full flex-col gap-6 p-10">
          <h2 className="text-lg font-semibold text-neutral-900">Contents</h2>
          <ul className="flex flex-col gap-3">
            {page.entries.map((entry) => (
              <li
                key={entry.label}
                className="flex items-baseline gap-2 text-sm text-neutral-700"
              >
                <span>{entry.label}</span>
                <span className="h-px flex-1 border-b border-dotted border-neutral-300" />
                <span className="tabular-nums text-neutral-500">
                  {entry.page}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )

    case "content":
      return (
        <div className="flex h-full flex-col gap-4 p-10">
          <p className="text-xs text-neutral-500">{page.section}</p>
          <h2 className="text-lg font-semibold text-neutral-900">
            {page.heading}
          </h2>
          <div className="flex flex-col gap-6">
            {Array.from({ length: page.paragraphs }).map((_, i) => (
              <TextBlock key={i} />
            ))}
          </div>
        </div>
      )

    case "table":
      return (
        <div className="flex h-full flex-col gap-4 p-10">
          <p className="text-xs text-neutral-500">{page.section}</p>
          <h2 className="text-lg font-semibold text-neutral-900">
            {page.heading}
          </h2>
          <table className="w-full border-collapse overflow-hidden rounded-sm border text-sm">
            <thead>
              <tr className="bg-neutral-100">
                {page.columns.map((column) => (
                  <th
                    key={column}
                    className="border-b px-3 py-2 text-left font-medium text-neutral-700"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {page.rows.map((row) => (
                <tr key={row[0]} className="border-b last:border-b-0">
                  {row.map((cell, i) => (
                    <td
                      key={i}
                      className="px-3 py-2 text-neutral-700 tabular-nums"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )

    case "diagram":
      return (
        <div className="flex h-full flex-col gap-4 p-10">
          <p className="text-xs text-neutral-500">{page.section}</p>
          <h2 className="text-lg font-semibold text-neutral-900">
            {page.heading}
          </h2>
          <div className="flex flex-1 items-center justify-center rounded-sm border border-dashed border-neutral-300 bg-neutral-50">
            <svg
              viewBox="0 0 200 200"
              className="size-40 text-neutral-400"
              aria-hidden
            >
              <circle
                cx="100"
                cy="100"
                r="70"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
              <circle
                cx="100"
                cy="100"
                r="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i / 12) * Math.PI * 2
                const x1 = 100 + Math.cos(angle) * 70
                const y1 = 100 + Math.sin(angle) * 70
                const x2 = 100 + Math.cos(angle) * 84
                const y2 = 100 + Math.sin(angle) * 84
                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                )
              })}
            </svg>
          </div>
          <p className="text-center text-xs text-neutral-500">
            {page.caption}
          </p>
        </div>
      )
  }
}

function TextBlock() {
  return (
    <div className="flex flex-col gap-2">
      <div className="h-2.5 w-full rounded-full bg-neutral-200" />
      <div className="h-2.5 w-full rounded-full bg-neutral-200" />
      <div className="h-2.5 w-2/3 rounded-full bg-neutral-200" />
    </div>
  )
}

function CompactPreview({ page }: { page: PdfPageContent }) {
  const Icon =
    page.kind === "table"
      ? TableIcon
      : page.kind === "diagram"
        ? ImageIcon
        : page.kind === "toc"
          ? ListIcon
          : null

  return (
    <div className="flex h-full flex-col gap-1.5 p-2">
      <div className="h-1.5 w-3/4 rounded-full bg-neutral-300" />
      <div className="flex flex-1 flex-col gap-1">
        {Icon ? (
          <div className="flex flex-1 items-center justify-center">
            <Icon className="size-4 text-neutral-300" />
          </div>
        ) : (
          <>
            <div className={cn("h-1 w-full rounded-full bg-neutral-200")} />
            <div className={cn("h-1 w-full rounded-full bg-neutral-200")} />
            <div className={cn("h-1 w-1/2 rounded-full bg-neutral-200")} />
          </>
        )}
      </div>
    </div>
  )
}
