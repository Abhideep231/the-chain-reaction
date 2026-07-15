import {
  FileUpIcon,
  MessageCircleQuestionIcon,
  RefreshCwIcon,
} from "lucide-react"

import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { type ChartBarItem, KnowledgeChart } from "@/components/dashboard/knowledge-chart"
import { HealthCard } from "@/components/dashboard/health-card"
import { MetricCard } from "@/components/dashboard/metric-card"
import { ReferenceTable } from "@/components/dashboard/reference-table"
import type {
  CategoryBreakdownItem,
  DashboardSnapshot,
  StatusBreakdownItem,
} from "@/types/dashboard"

function toCategoryBars(items: CategoryBreakdownItem[]): ChartBarItem[] {
  return items.map((item) => ({
    label: item.label,
    value: item.value,
    colorClassName: `bg-chart-${item.colorSlot}`,
  }))
}

function toStatusBars(items: StatusBreakdownItem[]): ChartBarItem[] {
  return items.map((item) => ({
    label: item.label,
    value: item.value,
    colorClassName: item.status === "good" ? "bg-status-good" : "bg-status-warning",
  }))
}

export function DashboardGrid({ snapshot }: { snapshot: DashboardSnapshot }) {
  return (
    <div className="flex flex-col gap-8">
      <section className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
        {snapshot.metrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">Knowledge Base Health</h2>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3">
          <KnowledgeChart
            title="Document Types"
            items={toCategoryBars(snapshot.knowledgeHealth.documentTypes)}
          />
          <KnowledgeChart
            title="Product Families"
            items={toCategoryBars(snapshot.knowledgeHealth.productFamilies)}
          />
          <KnowledgeChart
            title="Document Status"
            items={toStatusBars(snapshot.knowledgeHealth.documentStatus)}
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">Recent Activity</h2>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3">
          <ActivityFeed
            title="Recently Indexed Documents"
            icon={FileUpIcon}
            items={snapshot.recentlyIndexed}
          />
          <ActivityFeed
            title="Recently Updated Documents"
            icon={RefreshCwIcon}
            items={snapshot.recentlyUpdated}
          />
          <ActivityFeed
            title="Recent AI Questions"
            icon={MessageCircleQuestionIcon}
            items={snapshot.recentQuestions}
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <ReferenceTable documents={snapshot.topReferencedDocuments} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">AI System Health</h2>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
          {snapshot.systemHealth.map((component) => (
            <HealthCard key={component.id} component={component} />
          ))}
        </div>
      </section>
    </div>
  )
}
