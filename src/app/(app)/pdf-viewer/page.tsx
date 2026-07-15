import type { Metadata } from "next"

import { PdfViewerWorkspace } from "@/components/pdf/pdf-viewer-workspace"

export const metadata: Metadata = {
  title: "PDF Viewer | The Chain Reaction",
}

export default function PdfViewerPage() {
  return <PdfViewerWorkspace />
}
