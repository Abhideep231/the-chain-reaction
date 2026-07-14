import { KeyValueList } from "@/components/shared/key-value-list"
import type { PdfDocumentMeta } from "@/types/pdf"

export function DocumentInfo({ document }: { document: PdfDocumentMeta }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Document Information
      </h3>
      <KeyValueList
        items={[
          { label: "Name", value: document.name },
          { label: "Type", value: document.fileType },
          { label: "Pages", value: String(document.pageCount) },
          { label: "Size", value: document.fileSize },
          { label: "Last updated", value: document.lastUpdated },
          ...(document.sourceStandard
            ? [{ label: "Standard", value: document.sourceStandard }]
            : []),
        ]}
      />
    </section>
  )
}
