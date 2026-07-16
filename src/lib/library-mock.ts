/**
 * Sprint 20 connected the Knowledge Library to the real `GET /documents`
 * backend, which replaces this file's former static document list and
 * `getDocumentById` lookup — see `src/hooks/use-library.ts`. What
 * remains here is genuinely frontend-only: the filter dropdowns' fixed
 * vocabulary, which has no backend equivalent to source it from
 * (uploaded documents carry no category/product-family/type of their
 * own — see `adaptDocumentSummary` in `src/lib/api/adapters.ts`).
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
