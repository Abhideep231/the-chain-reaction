import type {
  PdfCitation,
  PdfDocumentMeta,
  PdfPageContent,
} from "@/types/pdf"

/**
 * Static, hand-authored mock data for the PDF Viewer. There is no PDF
 * parsing or storage backend yet — Sprint 3 is frontend-only. Page
 * layouts are wireframe approximations of a real ANSI/ASME B29.1-style
 * manual, not a rendered document.
 */

export const documentMeta: PdfDocumentMeta = {
  name: "ANSI-ASME-B29.1-Roller-Chains.pdf",
  fileType: "PDF",
  fileSize: "2.4 MB",
  pageCount: 6,
  lastUpdated: "Mar 12, 2026",
  sourceStandard: "ANSI/ASME B29.1",
}

export const pages: PdfPageContent[] = [
  {
    pageNumber: 1,
    kind: "cover",
    title: "ANSI/ASME B29.1",
    subtitle: "Precision Power Transmission Roller Chains, Attachments, and Sprockets",
  },
  {
    pageNumber: 2,
    kind: "toc",
    entries: [
      { label: "1. Scope", page: 3 },
      { label: "2. Definitions", page: 3 },
      { label: "3. Dimensions and Tolerances", page: 4 },
      { label: "4. Wear Elongation Limits", page: 4 },
      { label: "5. Tensile Strength Ratings", page: 5 },
      { label: "6. Lubrication Requirements", page: 5 },
      { label: "7. Sprocket Tooth Form", page: 6 },
    ],
  },
  {
    pageNumber: 3,
    kind: "content",
    heading: "3.2 Wear Elongation Limits",
    section: "Section 3 — Dimensions and Tolerances",
    paragraphs: 3,
  },
  {
    pageNumber: 4,
    kind: "table",
    heading: "Table 1 — Standard Chain Dimensions",
    section: "Section 3 — Dimensions and Tolerances",
    columns: ["Chain No.", "Pitch", "Roller Diameter", "Tensile Strength"],
    rows: [
      ["40", "1/2 in", "0.312 in", "3,125 lbf (13.9 kN)"],
      ["50", "5/8 in", "0.400 in", "4,880 lbf (21.7 kN)"],
      ["60", "3/4 in", "0.469 in", "8,850 lbf (39.4 kN)"],
      ["80", "1 in", "0.625 in", "14,500 lbf (64.5 kN)"],
    ],
  },
  {
    pageNumber: 5,
    kind: "content",
    heading: "6. Lubrication Requirements",
    section: "Section 6 — Lubrication",
    paragraphs: 4,
  },
  {
    pageNumber: 6,
    kind: "diagram",
    heading: "Figure 4.1 — Sprocket Tooth Engagement",
    section: "Section 7 — Sprocket Tooth Form",
    caption:
      "Figure 4.1 — Sprocket tooth profile showing engagement angle and roller seating.",
  },
]

export const citations: PdfCitation[] = [
  {
    id: "pc1",
    label: "Citation 1",
    pageNumber: 3,
    section: "3.2 Wear Elongation Limits",
    confidence: "high",
    retrievedChunk:
      "\"Chains operating on fixed-center drives should be replaced at 1.5% elongation; chains with center-distance adjustment may run to 3.0% before tooth engagement becomes unreliable.\"",
    metadata: [
      { label: "Standard", value: "ANSI/ASME B29.1" },
      { label: "Revision", value: "2023" },
      { label: "Section", value: "3.2" },
    ],
    highlight: { x: 0.1, y: 0.34, width: 0.8, height: 0.16 },
  },
  {
    id: "pc2",
    label: "Citation 2",
    pageNumber: 4,
    section: "Table 1 — Standard Chain Dimensions",
    confidence: "high",
    retrievedChunk:
      "\"No. 60: pitch 3/4 in, roller diameter 0.469 in, average tensile strength 8,850 lbf (39.4 kN).\"",
    metadata: [
      { label: "Standard", value: "ANSI/ASME B29.1" },
      { label: "Table", value: "Table 1" },
      { label: "Row", value: "Chain No. 60" },
    ],
    highlight: { x: 0.1, y: 0.56, width: 0.8, height: 0.09 },
  },
  {
    id: "pc3",
    label: "Citation 3",
    pageNumber: 5,
    section: "Section 6 — Lubrication",
    confidence: "medium",
    retrievedChunk:
      "\"In abrasive or dusty environments, open manual lubrication should be considered a last resort; enclosed bath or forced-feed systems dramatically reduce contamination-driven wear.\"",
    metadata: [
      { label: "Standard", value: "ANSI/ASME B29.1" },
      { label: "Revision", value: "2023" },
      { label: "Section", value: "6" },
    ],
    highlight: { x: 0.1, y: 0.5, width: 0.8, height: 0.18 },
  },
  {
    id: "pc4",
    label: "Citation 4",
    pageNumber: 6,
    section: "Figure 4.1 — Sprocket Tooth Engagement",
    confidence: "medium",
    retrievedChunk:
      "\"A hooked wear profile on the driving face of the sprocket tooth is diagnostic of an already-elongated chain riding high on the tooth, compounding wear on both components.\"",
    metadata: [
      { label: "Standard", value: "ANSI/ASME B29.1" },
      { label: "Figure", value: "4.1" },
      { label: "Section", value: "7" },
    ],
    highlight: { x: 0.22, y: 0.28, width: 0.56, height: 0.4 },
  },
]
