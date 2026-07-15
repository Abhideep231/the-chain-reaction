export type DocumentStatus = "approved" | "draft"

export type LibraryViewMode = "grid" | "list"

export type LibrarySortOption = "recent" | "title" | "pages"

/** Drives the abstract preview thumbnail's icon — not a real render. */
export type PreviewKind =
  | "catalogue"
  | "handbook"
  | "manual"
  | "guide"
  | "datasheet"

export interface RevisionEntry {
  revision: string
  version: string
  date: string
  summary: string
}

export interface LibraryDocument {
  id: string
  title: string
  category: string
  productFamily: string
  documentType: string
  revision: string
  version: string
  fileSize: string
  pageCount: number
  lastUpdated: string
  status: DocumentStatus
  previewKind: PreviewKind
  tags: string[]
  engineeringNotes: string
  relatedDocumentIds: string[]
  revisionHistory: RevisionEntry[]
}

export interface LibraryFilters {
  search: string
  category: string
  productFamily: string
  documentType: string
}

export const ALL_FILTER_VALUE = "all"
