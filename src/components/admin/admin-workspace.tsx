"use client"

import * as React from "react"

import { ActivityTimeline } from "@/components/admin/activity-timeline"
import { AdminSummaryPanel } from "@/components/admin/admin-summary-panel"
import { DocumentTable } from "@/components/admin/document-table"
import { KnowledgeHealthCard } from "@/components/admin/knowledge-health-card"
import { SystemInformationCard } from "@/components/admin/system-information-card"
import { SystemServiceCard } from "@/components/admin/system-service-card"
import { UploadCard } from "@/components/admin/upload-card"
import { useUtilityPanelContent } from "@/components/layout/utility-panel-provider"
import { useAdmin } from "@/hooks/use-admin"

export function AdminWorkspace() {
  const {
    documents,
    statistics,
    health,
    activity,
    systemInfo,
    summary,
    upload,
    startUpload,
  } = useAdmin()

  const panelContent = React.useMemo(
    () => <AdminSummaryPanel summary={summary} />,
    [summary]
  )
  useUtilityPanelContent(panelContent, { openOnMount: true })

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-6 overflow-y-auto">
      <div>
        <h1 className="text-lg font-semibold">Administration</h1>
        <p className="text-sm text-muted-foreground">
          Manage engineering documents, monitor AI services, and maintain the
          knowledge base.
        </p>
      </div>

      <section className="flex flex-col gap-3 rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">Document Management</h2>
          <span className="text-xs text-muted-foreground">
            Showing {documents.length} of {statistics.totalDocuments} documents
          </span>
        </div>
        <DocumentTable documents={documents} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">Upload</h2>
        <UploadCard upload={upload} onUpload={startUpload} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">Knowledge Base Health</h2>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
          <KnowledgeHealthCard
            label="Total Documents"
            value={statistics.totalDocuments.toLocaleString("en-US")}
          />
          <KnowledgeHealthCard
            label="Total Chunks"
            value={statistics.totalChunks.toLocaleString("en-US")}
          />
          <KnowledgeHealthCard
            label="Indexed Documents"
            value={statistics.indexedDocuments.toLocaleString("en-US")}
          />
          <KnowledgeHealthCard
            label="Pending Documents"
            value={statistics.pendingDocuments.toLocaleString("en-US")}
          />
          <KnowledgeHealthCard
            label="Failed Documents"
            value={statistics.failedDocuments.toLocaleString("en-US")}
          />
          <KnowledgeHealthCard
            label="Average Chunk Size"
            value={statistics.averageChunkSize}
          />
          <KnowledgeHealthCard
            label="Knowledge Coverage"
            value={statistics.knowledgeCoverage}
          />
          <KnowledgeHealthCard
            label="Last Synchronization"
            value={statistics.lastSynchronization}
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">AI Services</h2>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
          {health.map((service) => (
            <SystemServiceCard key={service.id} service={service} />
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold">Recent Activity</h2>
          <div className="rounded-lg border bg-card p-4">
            <ActivityTimeline entries={activity} />
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold">System Information</h2>
          <div className="rounded-lg border bg-card p-4">
            <SystemInformationCard info={systemInfo} />
          </div>
        </section>
      </div>
    </div>
  )
}
