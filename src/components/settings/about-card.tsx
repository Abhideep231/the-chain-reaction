import { KeyValueList } from "@/components/shared/key-value-list"
import type { ApplicationInformation } from "@/types/settings"

export function AboutCard({ info }: { info: ApplicationInformation }) {
  return (
    <KeyValueList
      items={[
        { label: "Application Name", value: info.applicationName },
        { label: "Version", value: info.version },
        { label: "Frontend", value: info.frontend },
        { label: "Backend", value: info.backend },
        { label: "Vector Database", value: info.vectorDatabase },
        { label: "LLM", value: info.llm },
        { label: "PDF Parser", value: info.pdfParser },
        { label: "Embedding Model", value: info.embeddingModel },
        { label: "Last Updated", value: info.lastUpdated },
      ]}
    />
  )
}
