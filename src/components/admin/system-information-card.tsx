import { KeyValueList } from "@/components/shared/key-value-list"
import type { SystemInformation } from "@/types/admin"

export function SystemInformationCard({ info }: { info: SystemInformation }) {
  return (
    <KeyValueList
      items={[
        { label: "Application Version", value: info.applicationVersion },
        { label: "Knowledge Base Version", value: info.knowledgeBaseVersion },
        { label: "Embedding Model", value: info.embeddingModel },
        { label: "Vector Database", value: info.vectorDatabase },
        { label: "Total Storage", value: info.totalStorage },
        { label: "Last Backup", value: info.lastBackup },
        { label: "Environment", value: info.environment },
      ]}
    />
  )
}
