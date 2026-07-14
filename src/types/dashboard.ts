export type TimeRange = "24h" | "7d" | "30d"

export type TrendDirection = "up" | "down" | "flat"

export interface MetricDelta {
  value: string
  direction: TrendDirection
  /** Whether this direction counts as "good" for this specific metric — a
   * falling response time is positive, a falling citation coverage isn't. */
  isPositive: boolean
}

export interface Metric {
  id: string
  label: string
  value: string
  delta: MetricDelta
  sparkline?: number[]
}

/** Fixed 1–5 mapping onto the app's --chart-1..5 tokens. Assigned once per
 * category and never reassigned by sort position or filtering, so a given
 * category keeps the same color everywhere it appears. */
export type CategoryColorSlot = 1 | 2 | 3 | 4 | 5

export interface CategoryBreakdownItem {
  label: string
  value: number
  colorSlot: CategoryColorSlot
}

export interface StatusBreakdownItem {
  label: string
  value: number
  status: "good" | "warning"
}

export interface KnowledgeHealthData {
  documentTypes: CategoryBreakdownItem[]
  productFamilies: CategoryBreakdownItem[]
  documentStatus: StatusBreakdownItem[]
}

export interface ActivityItem {
  id: string
  title: string
  subtitle: string
  timestamp: string
}

export interface ReferencedDocument {
  id: string
  rank: number
  title: string
  productFamily: string
  referenceCount: number
  trend: TrendDirection
}

export type SystemComponentStatus = "operational" | "degraded" | "down"

export interface SystemHealthComponent {
  id: string
  name: string
  status: SystemComponentStatus
  metricLabel: string
  metricValue: string
  lastChecked: string
}

export interface DashboardSnapshot {
  metrics: Metric[]
  knowledgeHealth: KnowledgeHealthData
  recentlyIndexed: ActivityItem[]
  recentlyUpdated: ActivityItem[]
  recentQuestions: ActivityItem[]
  topReferencedDocuments: ReferencedDocument[]
  systemHealth: SystemHealthComponent[]
}
