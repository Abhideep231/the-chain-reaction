"use client"

import * as React from "react"

import { adaptDocumentSummary } from "@/lib/api/adapters"
import { listDocuments } from "@/lib/api/documents"
import { friendlyErrorMessage } from "@/lib/api/errors"
import {
  ALL_FILTER_VALUE,
  type LibraryDocument,
  type LibraryFilters,
  type LibrarySortOption,
  type LibraryViewMode,
} from "@/types/library"

const defaultFilters: LibraryFilters = {
  search: "",
  category: ALL_FILTER_VALUE,
  productFamily: ALL_FILTER_VALUE,
  documentType: ALL_FILTER_VALUE,
}

export function useLibrary() {
  const [documents, setDocuments] = React.useState<LibraryDocument[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [filters, setFilters] = React.useState<LibraryFilters>(defaultFilters)
  const [sort, setSort] = React.useState<LibrarySortOption>("recent")
  const [viewMode, setViewMode] = React.useState<LibraryViewMode>("grid")
  const [selectedDocumentId, setSelectedDocumentId] = React.useState<
    string | null
  >(null)

  React.useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    listDocuments()
      .then((response) => {
        if (cancelled) return
        setDocuments(response.documents.map(adaptDocumentSummary))
      })
      .catch((caught: unknown) => {
        if (cancelled) return
        setError(friendlyErrorMessage(caught))
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const setSearch = React.useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }))
  }, [])
  const setCategory = React.useCallback((category: string) => {
    setFilters((prev) => ({ ...prev, category }))
  }, [])
  const setProductFamily = React.useCallback((productFamily: string) => {
    setFilters((prev) => ({ ...prev, productFamily }))
  }, [])
  const setDocumentType = React.useCallback((documentType: string) => {
    setFilters((prev) => ({ ...prev, documentType }))
  }, [])
  const clearFilters = React.useCallback(() => setFilters(defaultFilters), [])

  const selectDocument = React.useCallback((id: string) => {
    setSelectedDocumentId(id)
  }, [])

  const filteredDocuments = React.useMemo(() => {
    const query = filters.search.trim().toLowerCase()

    const filtered = documents.filter((document) => {
      if (
        filters.category !== ALL_FILTER_VALUE &&
        document.category !== filters.category
      ) {
        return false
      }
      if (
        filters.productFamily !== ALL_FILTER_VALUE &&
        document.productFamily !== filters.productFamily
      ) {
        return false
      }
      if (
        filters.documentType !== ALL_FILTER_VALUE &&
        document.documentType !== filters.documentType
      ) {
        return false
      }
      if (!query) {
        return true
      }
      return (
        document.title.toLowerCase().includes(query) ||
        document.tags.some((tag) => tag.toLowerCase().includes(query))
      )
    })

    return [...filtered].sort((a, b) => {
      switch (sort) {
        case "title":
          return a.title.localeCompare(b.title)
        case "pages":
          return b.pageCount - a.pageCount
        case "recent":
        default:
          return (
            new Date(b.lastUpdated).getTime() -
            new Date(a.lastUpdated).getTime()
          )
      }
    })
  }, [documents, filters, sort])

  const selectedDocument = React.useMemo(
    () =>
      selectedDocumentId
        ? (documents.find((document) => document.id === selectedDocumentId) ??
          null)
        : null,
    [documents, selectedDocumentId]
  )

  return {
    isLoading,
    error,
    filters,
    sort,
    viewMode,
    filteredDocuments,
    selectedDocumentId,
    selectedDocument,
    setSearch,
    setCategory,
    setProductFamily,
    setDocumentType,
    setSort,
    setViewMode,
    clearFilters,
    selectDocument,
  }
}
