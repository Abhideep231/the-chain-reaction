import { CalculatorIcon, LibraryIcon, MessageCircleQuestionIcon, UploadIcon } from "lucide-react"
import Link from "next/link"

import type { LucideIcon } from "lucide-react"

interface QuickAction {
  href: string
  label: string
  description: string
  icon: LucideIcon
}

const actions: QuickAction[] = [
  {
    href: "/admin",
    label: "Upload Documents",
    description: "Add new engineering documents to the knowledge base",
    icon: UploadIcon,
  },
  {
    href: "/ask-ai",
    label: "Ask AI",
    description: "Get answers grounded in your indexed documents",
    icon: MessageCircleQuestionIcon,
  },
  {
    href: "/knowledge-library",
    label: "Open Knowledge Library",
    description: "Browse and manage the indexed document set",
    icon: LibraryIcon,
  },
  {
    href: "/calculations",
    label: "Engineering Calculations",
    description: "Run chain selection and service factor calculations",
    icon: CalculatorIcon,
  },
]

export function QuickActions() {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold">Quick Actions</h2>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="flex flex-col gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
          >
            <div className="flex size-9 items-center justify-center rounded-md bg-muted text-foreground">
              <action.icon className="size-4.5" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">{action.label}</span>
              <span className="text-xs text-muted-foreground">{action.description}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
