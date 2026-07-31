import { ProductFamilyCoverageCard } from "@/components/dashboard/product-family-coverage-card"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { RecentConversationsCard } from "@/components/dashboard/recent-conversations-card"
import { RecentDocumentsCard } from "@/components/dashboard/recent-documents-card"
import { StatTile } from "@/components/dashboard/stat-tile"
import type { DashboardSnapshot } from "@/types/dashboard"

export function DashboardGrid({ snapshot }: { snapshot: DashboardSnapshot }) {
  return (
    <div className="flex flex-col gap-8">
      <QuickActions />

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">Knowledge Library Overview</h2>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
          <StatTile
            label="Total Documents"
            value={snapshot.overview.totalDocuments.toLocaleString("en-US")}
          />
          <StatTile
            label="Product Families"
            value={snapshot.overview.productFamilies.toLocaleString("en-US")}
          />
          <StatTile label="Last Indexed" value={snapshot.overview.lastIndexed} />
          <StatTile label="Storage Used" value={snapshot.overview.storageUsed} />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">AI Usage</h2>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
          <StatTile
            label="Questions Asked"
            value={snapshot.aiUsage.questionsAsked.toLocaleString("en-US")}
          />
          <StatTile label="Average Response Time" value={snapshot.aiUsage.averageResponseTime} />
          <StatTile
            label="Documents Referenced"
            value={snapshot.aiUsage.documentsReferenced.toLocaleString("en-US")}
          />
          <StatTile
            label="Successful Answers"
            value={snapshot.aiUsage.successfulAnswers.toLocaleString("en-US")}
          />
        </div>
      </section>

      <section className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-3">
        <RecentConversationsCard items={snapshot.recentConversations} />
        <RecentDocumentsCard items={snapshot.recentDocuments} />
      </section>

      <section>
        <ProductFamilyCoverageCard items={snapshot.productFamilyCoverage} />
      </section>
    </div>
  )
}
