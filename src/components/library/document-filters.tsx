import { SearchIcon } from "lucide-react"

import { Input } from "@/components/ui/input"
import { categories, documentTypes, productFamilies } from "@/lib/library-mock"
import { cn } from "@/lib/utils"
import { ALL_FILTER_VALUE } from "@/types/library"

function FilterGroup({
  label,
  allLabel,
  options,
  value,
  onChange,
}: {
  label: string
  allLabel: string
  options: readonly string[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </h3>
      <div className="flex flex-col gap-0.5">
        <button
          type="button"
          onClick={() => onChange(ALL_FILTER_VALUE)}
          className={cn(
            "rounded-md px-2 py-1.5 text-left text-sm transition-colors",
            value === ALL_FILTER_VALUE
              ? "bg-accent font-medium text-accent-foreground"
              : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
          )}
        >
          {allLabel}
        </button>
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              "rounded-md px-2 py-1.5 text-left text-sm transition-colors",
              value === option
                ? "bg-accent font-medium text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

export function DocumentFilters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  productFamily,
  onProductFamilyChange,
  documentType,
  onDocumentTypeChange,
}: {
  search: string
  onSearchChange: (value: string) => void
  category: string
  onCategoryChange: (value: string) => void
  productFamily: string
  onProductFamilyChange: (value: string) => void
  documentType: string
  onDocumentTypeChange: (value: string) => void
}) {
  return (
    <aside className="hidden w-56 shrink-0 flex-col gap-6 overflow-auto rounded-lg border p-3 md:flex">
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search…"
          className="pl-8"
          aria-label="Search documents"
        />
      </div>

      <FilterGroup
        label="Category"
        allLabel="All Categories"
        options={categories}
        value={category}
        onChange={onCategoryChange}
      />
      <FilterGroup
        label="Product Family"
        allLabel="All Families"
        options={productFamilies}
        value={productFamily}
        onChange={onProductFamilyChange}
      />
      <FilterGroup
        label="Document Type"
        allLabel="All Types"
        options={documentTypes}
        value={documentType}
        onChange={onDocumentTypeChange}
      />
    </aside>
  )
}
