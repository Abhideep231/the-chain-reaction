"use client"

import * as React from "react"

import { citations, documentMeta, pages } from "@/lib/pdf-mock"
import type { FitMode } from "@/types/pdf"

// Sprint 16 (frontend-backend integration) left this on the Sprint 3
// mock: the backend saves an uploaded PDF's bytes to disk and returns
// its parsed text (see POST /documents/upload), but there is no route
// anywhere in Sprints 9-15 that serves a stored PDF's raw file or
// per-page content back out, and no per-document ID this viewer could
// even request. There's nothing real to fetch yet.

const MIN_ZOOM = 50
const MAX_ZOOM = 200
const ZOOM_STEP = 10

export function usePdfViewer() {
  const pageCount = pages.length

  const [currentPage, setCurrentPage] = React.useState(1)
  const [zoom, setZoom] = React.useState(100)
  const [fitMode, setFitMode] = React.useState<FitMode>("width")
  const [thumbnailsOpen, setThumbnailsOpen] = React.useState(true)
  const [selectedCitationId, setSelectedCitationId] = React.useState<
    string | null
  >(null)

  const goToPage = React.useCallback(
    (page: number) => {
      setCurrentPage(Math.min(Math.max(page, 1), pageCount))
    },
    [pageCount]
  )

  const nextPage = React.useCallback(
    () => goToPage(currentPage + 1),
    [currentPage, goToPage]
  )
  const previousPage = React.useCallback(
    () => goToPage(currentPage - 1),
    [currentPage, goToPage]
  )

  const zoomIn = React.useCallback(() => {
    setFitMode("custom")
    setZoom((z) => Math.min(z + ZOOM_STEP, MAX_ZOOM))
  }, [])
  const zoomOut = React.useCallback(() => {
    setFitMode("custom")
    setZoom((z) => Math.max(z - ZOOM_STEP, MIN_ZOOM))
  }, [])
  const fitWidth = React.useCallback(() => setFitMode("width"), [])
  const fitPage = React.useCallback(() => setFitMode("page"), [])

  const toggleThumbnails = React.useCallback(
    () => setThumbnailsOpen((open) => !open),
    []
  )

  const selectCitation = React.useCallback(
    (citationId: string) => {
      const citation = citations.find((c) => c.id === citationId)
      if (!citation) return
      setSelectedCitationId(citationId)
      goToPage(citation.pageNumber)
    },
    [goToPage]
  )

  const selectedCitation = React.useMemo(
    () => citations.find((c) => c.id === selectedCitationId) ?? null,
    [selectedCitationId]
  )

  const currentPageData = React.useMemo(
    () => pages.find((p) => p.pageNumber === currentPage) ?? pages[0],
    [currentPage]
  )

  // Only surface a highlight while the selected citation's page is the
  // one currently being viewed, so it never appears "stuck" on a page
  // the user has since navigated away from.
  const activeHighlight = React.useMemo(() => {
    if (!selectedCitation || selectedCitation.pageNumber !== currentPage) {
      return null
    }
    return selectedCitation
  }, [selectedCitation, currentPage])

  return {
    documentMeta,
    pages,
    citations,
    pageCount,
    currentPage,
    currentPageData,
    zoom,
    fitMode,
    thumbnailsOpen,
    selectedCitationId,
    selectedCitation,
    activeHighlight,
    goToPage,
    nextPage,
    previousPage,
    zoomIn,
    zoomOut,
    fitWidth,
    fitPage,
    toggleThumbnails,
    selectCitation,
  }
}
