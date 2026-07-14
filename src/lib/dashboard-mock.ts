import type {
  DashboardSnapshot,
  Metric,
  TimeRange,
} from "@/types/dashboard"

/**
 * Static, hand-authored mock data for the Engineering Dashboard. There is
 * no analytics pipeline, metrics store, or health-check service yet —
 * Sprint 5 is frontend-only. Kept independent from the Knowledge
 * Library's mock data (Sprint 4) so each feature can evolve — and later
 * be wired to its own backend endpoint — without coupling one to the
 * other.
 *
 * The knowledge-health breakdown, recent activity, top-referenced table,
 * and system health are treated as "current state" and don't vary by time
 * range — only the KPI deltas do, since "how much changed in the last
 * 24h/7d/30d" is the only part of this data that a time range actually
 * changes in a real system.
 */

const metricsByRange: Record<TimeRange, Metric[]> = {
  "24h": [
    {
      id: "total-documents",
      label: "Total Documents",
      value: "247",
      delta: { value: "+1", direction: "up", isPositive: true },
      sparkline: [238, 240, 241, 244, 245, 246, 247],
    },
    {
      id: "indexed-passages",
      label: "Indexed Passages",
      value: "18,432",
      delta: { value: "+284", direction: "up", isPositive: true },
      sparkline: [17.6, 17.8, 17.9, 18.0, 18.1, 18.3, 18.43],
    },
    {
      id: "engineering-formulae",
      label: "Engineering Formulae",
      value: "312",
      delta: { value: "+0", direction: "flat", isPositive: true },
    },
    {
      id: "citation-coverage",
      label: "Citation Coverage",
      value: "94%",
      delta: { value: "+0.2%", direction: "up", isPositive: true },
      sparkline: [91, 92, 92, 93, 93, 94, 94],
    },
    {
      id: "avg-response-time",
      label: "Average Response Time",
      value: "1.8s",
      delta: { value: "-0.1s", direction: "down", isPositive: true },
      sparkline: [2.3, 2.2, 2.1, 2.0, 1.9, 1.9, 1.8],
    },
    {
      id: "refusal-rate",
      label: "Refusal Rate",
      value: "3.2%",
      delta: { value: "+0.1%", direction: "up", isPositive: false },
    },
  ],
  "7d": [
    {
      id: "total-documents",
      label: "Total Documents",
      value: "247",
      delta: { value: "+6", direction: "up", isPositive: true },
      sparkline: [230, 234, 237, 240, 243, 245, 247],
    },
    {
      id: "indexed-passages",
      label: "Indexed Passages",
      value: "18,432",
      delta: { value: "+1,902", direction: "up", isPositive: true },
      sparkline: [15.9, 16.5, 17.0, 17.4, 17.8, 18.1, 18.43],
    },
    {
      id: "engineering-formulae",
      label: "Engineering Formulae",
      value: "312",
      delta: { value: "+4", direction: "up", isPositive: true },
    },
    {
      id: "citation-coverage",
      label: "Citation Coverage",
      value: "94%",
      delta: { value: "+1.1%", direction: "up", isPositive: true },
      sparkline: [88, 89, 90, 91, 92, 93, 94],
    },
    {
      id: "avg-response-time",
      label: "Average Response Time",
      value: "1.8s",
      delta: { value: "-0.3s", direction: "down", isPositive: true },
      sparkline: [2.6, 2.4, 2.3, 2.1, 2.0, 1.9, 1.8],
    },
    {
      id: "refusal-rate",
      label: "Refusal Rate",
      value: "3.2%",
      delta: { value: "-0.4%", direction: "down", isPositive: true },
    },
  ],
  "30d": [
    {
      id: "total-documents",
      label: "Total Documents",
      value: "247",
      delta: { value: "+18", direction: "up", isPositive: true },
      sparkline: [201, 212, 220, 228, 236, 242, 247],
    },
    {
      id: "indexed-passages",
      label: "Indexed Passages",
      value: "18,432",
      delta: { value: "+6,140", direction: "up", isPositive: true },
      sparkline: [11.8, 13.4, 14.7, 15.9, 16.9, 17.7, 18.43],
    },
    {
      id: "engineering-formulae",
      label: "Engineering Formulae",
      value: "312",
      delta: { value: "+11", direction: "up", isPositive: true },
    },
    {
      id: "citation-coverage",
      label: "Citation Coverage",
      value: "94%",
      delta: { value: "+3.4%", direction: "up", isPositive: true },
      sparkline: [81, 84, 86, 89, 91, 93, 94],
    },
    {
      id: "avg-response-time",
      label: "Average Response Time",
      value: "1.8s",
      delta: { value: "-0.6s", direction: "down", isPositive: true },
      sparkline: [3.1, 2.8, 2.5, 2.3, 2.1, 1.9, 1.8],
    },
    {
      id: "refusal-rate",
      label: "Refusal Rate",
      value: "3.2%",
      delta: { value: "-1.2%", direction: "down", isPositive: true },
    },
  ],
}

// 247 total documents, consistent with the Total Documents metric above.
const knowledgeHealth: DashboardSnapshot["knowledgeHealth"] = {
  documentTypes: [
    { label: "Catalogue", value: 96, colorSlot: 1 },
    { label: "Handbook", value: 22, colorSlot: 2 },
    { label: "Manual", value: 41, colorSlot: 3 },
    { label: "Guide", value: 38, colorSlot: 4 },
    { label: "Datasheet", value: 50, colorSlot: 5 },
  ],
  productFamilies: [
    { label: "Roller Chains", value: 88, colorSlot: 1 },
    { label: "Conveyor Chains", value: 54, colorSlot: 2 },
    { label: "Attachment Chains", value: 39, colorSlot: 3 },
    { label: "Engineering Class Chains", value: 26, colorSlot: 4 },
    { label: "General", value: 40, colorSlot: 5 },
  ],
  documentStatus: [
    { label: "Approved", value: 221, status: "good" },
    { label: "Draft", value: 26, status: "warning" },
  ],
}

const recentlyIndexed: DashboardSnapshot["recentlyIndexed"] = [
  {
    id: "idx-1",
    title: "Engineering Class Chain Catalogue — Rev. A · v1.1",
    subtitle: "56 pages · 312 passages",
    timestamp: "2 hours ago",
  },
  {
    id: "idx-2",
    title: "Wear Elongation Inspection Manual — Rev. A · v1.2",
    subtitle: "18 pages · 94 passages",
    timestamp: "6 hours ago",
  },
  {
    id: "idx-3",
    title: "Sprocket Design Guide — Rev. B · v2.0",
    subtitle: "40 pages · 201 passages",
    timestamp: "Yesterday",
  },
  {
    id: "idx-4",
    title: "Roller Chain Datasheet — ANSI 60 — Rev. A · v1.3",
    subtitle: "2 pages · 11 passages",
    timestamp: "2 days ago",
  },
]

const recentlyUpdated: DashboardSnapshot["recentlyUpdated"] = [
  {
    id: "upd-1",
    title: "Roller Chain Catalogue bumped to Rev. D · v4.2",
    subtitle: "Added Chain No. 160 and 200 series dimensional tables",
    timestamp: "1 day ago",
  },
  {
    id: "upd-2",
    title: "Maintenance Manual bumped to Rev. E · v5.0",
    subtitle: "Reorganized inspection checklists by chain series",
    timestamp: "3 days ago",
  },
  {
    id: "upd-3",
    title: "Conveyor Chain Catalogue bumped to Rev. B · v2.1",
    subtitle: "Added K-attachment variants for bulk material handling",
    timestamp: "4 days ago",
  },
  {
    id: "upd-4",
    title: "Engineering Handbook bumped to Rev. C · v3.0",
    subtitle: "Expanded chapter on shock load service factors",
    timestamp: "1 week ago",
  },
]

const recentQuestions: DashboardSnapshot["recentQuestions"] = [
  {
    id: "q-1",
    title:
      "What is the maximum allowable elongation for an ANSI 60 roller chain before replacement?",
    subtitle: "Answered · High confidence",
    timestamp: "18 minutes ago",
  },
  {
    id: "q-2",
    title: "Why is my conveyor chain wearing prematurely at the sprocket mesh?",
    subtitle: "Answered · Medium confidence",
    timestamp: "1 hour ago",
  },
  {
    id: "q-3",
    title: "Compare the tensile strength of ISO 10B-1 and ANSI 80 roller chains.",
    subtitle: "Answered · High confidence",
    timestamp: "3 hours ago",
  },
  {
    id: "q-4",
    title:
      "What's the expected fatigue life of a mill chain running at 40°C ambient?",
    subtitle: "Refused · Insufficient grounding",
    timestamp: "Yesterday",
  },
]

const topReferencedDocuments: DashboardSnapshot["topReferencedDocuments"] = [
  {
    id: "ref-1",
    rank: 1,
    title: "Roller Chain Catalogue",
    productFamily: "Roller Chains",
    referenceCount: 482,
    trend: "up",
  },
  {
    id: "ref-2",
    rank: 2,
    title: "Engineering Handbook",
    productFamily: "General",
    referenceCount: 401,
    trend: "up",
  },
  {
    id: "ref-3",
    rank: 3,
    title: "Maintenance Manual",
    productFamily: "General",
    referenceCount: 356,
    trend: "flat",
  },
  {
    id: "ref-4",
    rank: 4,
    title: "Lubrication Guide",
    productFamily: "General",
    referenceCount: 298,
    trend: "up",
  },
  {
    id: "ref-5",
    rank: 5,
    title: "Conveyor Chain Catalogue",
    productFamily: "Conveyor Chains",
    referenceCount: 214,
    trend: "down",
  },
  {
    id: "ref-6",
    rank: 6,
    title: "Sprocket Design Guide",
    productFamily: "General",
    referenceCount: 187,
    trend: "up",
  },
]

const systemHealth: DashboardSnapshot["systemHealth"] = [
  {
    id: "pdf-parser",
    name: "PDF Parser",
    status: "operational",
    metricLabel: "Throughput",
    metricValue: "142 docs/hr",
    lastChecked: "Just now",
  },
  {
    id: "chunking-engine",
    name: "Chunking Engine",
    status: "operational",
    metricLabel: "Throughput",
    metricValue: "1,204 passages/min",
    lastChecked: "Just now",
  },
  {
    id: "embedding-engine",
    name: "Embedding Engine",
    status: "operational",
    metricLabel: "Success rate",
    metricValue: "98.7%",
    lastChecked: "1 min ago",
  },
  {
    id: "chromadb",
    name: "ChromaDB",
    status: "operational",
    metricLabel: "Avg. query latency",
    metricValue: "12 ms",
    lastChecked: "Just now",
  },
  {
    id: "claude-api",
    name: "Claude API",
    status: "degraded",
    metricLabel: "Avg. latency",
    metricValue: "2.4s (elevated)",
    lastChecked: "3 min ago",
  },
]

export function getDashboardSnapshot(range: TimeRange): DashboardSnapshot {
  return {
    metrics: metricsByRange[range],
    knowledgeHealth,
    recentlyIndexed,
    recentlyUpdated,
    recentQuestions,
    topReferencedDocuments,
    systemHealth,
  }
}
