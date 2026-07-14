import type { ConfidenceLevel, KeyValueItem } from "@/types/shared"

export type FitMode = "width" | "page" | "custom"

/**
 * Normalized (0–1) coordinates relative to the page surface, not pixels.
 * This is resolution-independent so the same region maps onto the
 * placeholder page today and onto a react-pdf <Page> viewport later,
 * regardless of zoom level or rendered size.
 */
export interface HighlightRegion {
  x: number
  y: number
  width: number
  height: number
}

export interface PdfCitation {
  id: string
  label: string
  pageNumber: number
  section: string
  confidence: ConfidenceLevel
  retrievedChunk: string
  metadata: KeyValueItem[]
  highlight: HighlightRegion
}

export interface PdfDocumentMeta {
  name: string
  fileType: string
  fileSize: string
  pageCount: number
  lastUpdated: string
  sourceStandard?: string
}

export type PdfPageContent =
  | { pageNumber: number; kind: "cover"; title: string; subtitle: string }
  | {
      pageNumber: number
      kind: "toc"
      entries: { label: string; page: number }[]
    }
  | {
      pageNumber: number
      kind: "content"
      heading: string
      section: string
      paragraphs: number
    }
  | {
      pageNumber: number
      kind: "table"
      heading: string
      section: string
      columns: string[]
      rows: string[][]
    }
  | {
      pageNumber: number
      kind: "diagram"
      heading: string
      section: string
      caption: string
    }
