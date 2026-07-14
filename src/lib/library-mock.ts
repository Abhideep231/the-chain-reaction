import type { LibraryDocument } from "@/types/library"

/**
 * Static, hand-authored mock data for the Knowledge Library. There is no
 * document store, search index, or ingestion pipeline yet — Sprint 4 is
 * frontend-only. See the Sprint 4 write-up for how this maps onto a
 * real document API later.
 */

export const categories = [
  "Product Literature",
  "Technical Reference",
  "Maintenance & Operations",
] as const

export const productFamilies = [
  "Roller Chains",
  "Conveyor Chains",
  "Attachment Chains",
  "Engineering Class Chains",
  "General",
] as const

export const documentTypes = [
  "Catalogue",
  "Handbook",
  "Manual",
  "Guide",
  "Datasheet",
] as const

export const documents: LibraryDocument[] = [
  {
    id: "doc-roller-chain-catalogue",
    title: "Roller Chain Catalogue",
    category: "Product Literature",
    productFamily: "Roller Chains",
    documentType: "Catalogue",
    revision: "Rev. D",
    version: "4.2",
    fileSize: "12.8 MB",
    pageCount: 84,
    lastUpdated: "Jun 02, 2026",
    status: "approved",
    previewKind: "catalogue",
    tags: ["ANSI", "ISO 606", "roller chain", "sprockets"],
    engineeringNotes:
      "Tensile strength tables cross-checked against ISO 606:2015 Amendment 1. Chain No. 160 series pending updated fatigue data before next print run.",
    relatedDocumentIds: [
      "doc-engineering-handbook",
      "doc-roller-chain-datasheet",
      "doc-lubrication-guide",
    ],
    revisionHistory: [
      {
        revision: "Rev. D",
        version: "4.2",
        date: "Jun 02, 2026",
        summary: "Added Chain No. 160 and 200 series dimensional tables.",
      },
      {
        revision: "Rev. C",
        version: "4.0",
        date: "Nov 14, 2025",
        summary: "Updated tensile strength ratings to ISO 606:2015 Amendment 1.",
      },
      {
        revision: "Rev. B",
        version: "3.1",
        date: "Feb 20, 2025",
        summary: "Corrected roller diameter tolerance in Section 3.2.",
      },
    ],
  },
  {
    id: "doc-engineering-handbook",
    title: "Engineering Handbook",
    category: "Technical Reference",
    productFamily: "General",
    documentType: "Handbook",
    revision: "Rev. C",
    version: "3.0",
    fileSize: "8.4 MB",
    pageCount: 128,
    lastUpdated: "Apr 18, 2026",
    status: "approved",
    previewKind: "handbook",
    tags: ["design guide", "load ratings", "chain selection"],
    engineeringNotes:
      "Chain selection flowchart in Section 2 references the Roller Chain Catalogue's Rev. C tables — needs a pass once the Rev. D dimensional updates are finalized.",
    relatedDocumentIds: [
      "doc-roller-chain-catalogue",
      "doc-sprocket-design-guide",
      "doc-maintenance-manual",
    ],
    revisionHistory: [
      {
        revision: "Rev. C",
        version: "3.0",
        date: "Apr 18, 2026",
        summary: "Expanded chapter on shock load service factors.",
      },
      {
        revision: "Rev. B",
        version: "2.4",
        date: "Sep 09, 2025",
        summary: "Added engineering class chain selection guidance.",
      },
    ],
  },
  {
    id: "doc-conveyor-chain-catalogue",
    title: "Conveyor Chain Catalogue",
    category: "Product Literature",
    productFamily: "Conveyor Chains",
    documentType: "Catalogue",
    revision: "Rev. B",
    version: "2.1",
    fileSize: "15.3 MB",
    pageCount: 96,
    lastUpdated: "May 27, 2026",
    status: "approved",
    previewKind: "catalogue",
    tags: ["conveyor chain", "attachments", "bulk handling"],
    engineeringNotes:
      "Includes new K-attachment variants for bulk material handling. Corrosion-resistant coating options still marked draft pending supplier certification.",
    relatedDocumentIds: ["doc-attachment-chain-catalogue", "doc-lubrication-guide"],
    revisionHistory: [
      {
        revision: "Rev. B",
        version: "2.1",
        date: "May 27, 2026",
        summary: "Added K-attachment variants for bulk material handling.",
      },
      {
        revision: "Rev. A",
        version: "2.0",
        date: "Jan 08, 2025",
        summary: "Initial release covering standard and heavy-series conveyor chain.",
      },
    ],
  },
  {
    id: "doc-maintenance-manual",
    title: "Maintenance Manual",
    category: "Maintenance & Operations",
    productFamily: "General",
    documentType: "Manual",
    revision: "Rev. E",
    version: "5.0",
    fileSize: "6.1 MB",
    pageCount: 52,
    lastUpdated: "Mar 30, 2026",
    status: "approved",
    previewKind: "manual",
    tags: ["maintenance", "wear inspection", "chain elongation"],
    engineeringNotes:
      "Elongation limit table aligned with ANSI/ASME B29.1 Section 3.2. Consider adding a dedicated section for engineering class chain re-tensioning intervals.",
    relatedDocumentIds: [
      "doc-wear-inspection-manual",
      "doc-lubrication-guide",
      "doc-engineering-handbook",
    ],
    revisionHistory: [
      {
        revision: "Rev. E",
        version: "5.0",
        date: "Mar 30, 2026",
        summary: "Reorganized inspection checklists by chain series.",
      },
      {
        revision: "Rev. D",
        version: "4.2",
        date: "Aug 11, 2025",
        summary: "Updated elongation limits to match B29.1 Section 3.2.",
      },
    ],
  },
  {
    id: "doc-lubrication-guide",
    title: "Lubrication Guide",
    category: "Maintenance & Operations",
    productFamily: "General",
    documentType: "Guide",
    revision: "Rev. B",
    version: "2.2",
    fileSize: "3.4 MB",
    pageCount: 24,
    lastUpdated: "Feb 14, 2026",
    status: "approved",
    previewKind: "guide",
    tags: ["lubrication", "wear prevention", "environment"],
    engineeringNotes:
      "Dusty-environment lubrication interval recommendation (Section 4) is referenced directly by Ask AI's canned lubrication answer — keep these numbers in sync.",
    relatedDocumentIds: ["doc-maintenance-manual", "doc-roller-chain-catalogue"],
    revisionHistory: [
      {
        revision: "Rev. B",
        version: "2.2",
        date: "Feb 14, 2026",
        summary: "Added guidance for abrasive/dusty operating environments.",
      },
      {
        revision: "Rev. A",
        version: "2.0",
        date: "Jun 03, 2024",
        summary: "Initial release.",
      },
    ],
  },
  {
    id: "doc-roller-chain-datasheet",
    title: "Roller Chain Datasheet — ANSI 60",
    category: "Product Literature",
    productFamily: "Roller Chains",
    documentType: "Datasheet",
    revision: "Rev. A",
    version: "1.3",
    fileSize: "620 KB",
    pageCount: 2,
    lastUpdated: "May 05, 2026",
    status: "draft",
    previewKind: "datasheet",
    tags: ["ANSI 60", "datasheet", "tensile strength"],
    engineeringNotes:
      "Awaiting sign-off on the updated fatigue strength figure before promoting from draft to approved.",
    relatedDocumentIds: ["doc-roller-chain-catalogue"],
    revisionHistory: [
      {
        revision: "Rev. A",
        version: "1.3",
        date: "May 05, 2026",
        summary: "Draft update with revised fatigue strength figure.",
      },
      {
        revision: "Rev. A",
        version: "1.2",
        date: "Oct 22, 2025",
        summary: "Initial datasheet published.",
      },
    ],
  },
  {
    id: "doc-attachment-chain-catalogue",
    title: "Attachment Chain Catalogue",
    category: "Product Literature",
    productFamily: "Attachment Chains",
    documentType: "Catalogue",
    revision: "Rev. C",
    version: "3.1",
    fileSize: "10.6 MB",
    pageCount: 68,
    lastUpdated: "Jan 22, 2026",
    status: "approved",
    previewKind: "catalogue",
    tags: ["attachment chain", "K-attachments", "conveyor"],
    engineeringNotes:
      "Verify attachment spacing tolerances against the Conveyor Chain Catalogue before the next joint print run.",
    relatedDocumentIds: ["doc-conveyor-chain-catalogue"],
    revisionHistory: [
      {
        revision: "Rev. C",
        version: "3.1",
        date: "Jan 22, 2026",
        summary: "Added extended-pin attachment variants.",
      },
      {
        revision: "Rev. B",
        version: "3.0",
        date: "Jul 15, 2024",
        summary: "Reorganized by attachment type rather than chain series.",
      },
    ],
  },
  {
    id: "doc-engineering-class-catalogue",
    title: "Engineering Class Chain Catalogue",
    category: "Product Literature",
    productFamily: "Engineering Class Chains",
    documentType: "Catalogue",
    revision: "Rev. A",
    version: "1.1",
    fileSize: "9.2 MB",
    pageCount: 56,
    lastUpdated: "Mar 03, 2026",
    status: "draft",
    previewKind: "catalogue",
    tags: ["engineering class", "heavy duty", "mill chain"],
    engineeringNotes:
      "New product line — pending final review of heavy-duty service factor tables before approval.",
    relatedDocumentIds: ["doc-engineering-handbook"],
    revisionHistory: [
      {
        revision: "Rev. A",
        version: "1.1",
        date: "Mar 03, 2026",
        summary: "Draft expanded with heavy-duty mill chain series.",
      },
      {
        revision: "Rev. A",
        version: "1.0",
        date: "Dec 01, 2025",
        summary: "Initial draft release.",
      },
    ],
  },
  {
    id: "doc-sprocket-design-guide",
    title: "Sprocket Design Guide",
    category: "Technical Reference",
    productFamily: "General",
    documentType: "Guide",
    revision: "Rev. B",
    version: "2.0",
    fileSize: "4.7 MB",
    pageCount: 40,
    lastUpdated: "Apr 29, 2026",
    status: "approved",
    previewKind: "guide",
    tags: ["sprocket", "tooth form", "alignment"],
    engineeringNotes:
      "Alignment tolerance figures match the Maintenance Manual's inspection checklist — keep both in sync on future revisions.",
    relatedDocumentIds: ["doc-engineering-handbook", "doc-maintenance-manual"],
    revisionHistory: [
      {
        revision: "Rev. B",
        version: "2.0",
        date: "Apr 29, 2026",
        summary: "Added hooked-tooth wear diagnostic diagrams.",
      },
      {
        revision: "Rev. A",
        version: "1.0",
        date: "Oct 05, 2024",
        summary: "Initial release.",
      },
    ],
  },
  {
    id: "doc-wear-inspection-manual",
    title: "Wear Elongation Inspection Manual",
    category: "Maintenance & Operations",
    productFamily: "Roller Chains",
    documentType: "Manual",
    revision: "Rev. A",
    version: "1.2",
    fileSize: "2.9 MB",
    pageCount: 18,
    lastUpdated: "Jun 10, 2026",
    status: "draft",
    previewKind: "manual",
    tags: ["inspection", "elongation", "field guide"],
    engineeringNotes:
      "Field-trial feedback pending from two sites before this is promoted from draft to approved.",
    relatedDocumentIds: ["doc-maintenance-manual"],
    revisionHistory: [
      {
        revision: "Rev. A",
        version: "1.2",
        date: "Jun 10, 2026",
        summary: "Incorporated field-trial feedback on measuring span guidance.",
      },
      {
        revision: "Rev. A",
        version: "1.0",
        date: "Apr 02, 2026",
        summary: "Initial draft release.",
      },
    ],
  },
]

export function getDocumentById(id: string): LibraryDocument | undefined {
  return documents.find((document) => document.id === id)
}
