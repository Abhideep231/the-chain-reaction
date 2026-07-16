"use client"

import * as React from "react"
import { UploadCloudIcon } from "lucide-react"

import { UploadProgress } from "@/components/admin/upload-progress"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { UploadProgress as UploadProgressData } from "@/types/admin"

export function UploadCard({
  upload,
  onUpload,
}: {
  upload: UploadProgressData | null
  onUpload: (file: File) => void
}) {
  const [isDragging, setIsDragging] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const disabled = upload !== null && upload.percent < 100 && !upload.error

  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-card p-4">
      <h3 className="text-sm font-semibold">Upload Document</h3>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ""
          if (file && !disabled) onUpload(file)
        }}
      />

      <div
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setIsDragging(false)
          const file = event.dataTransfer.files[0]
          if (file && !disabled) onUpload(file)
        }}
        className={cn(
          "flex flex-col items-center gap-3 rounded-lg border-2 border-dashed p-8 text-center transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-border"
        )}
      >
        <div className="flex size-10 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <UploadCloudIcon className="size-5" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">Drag &amp; drop a PDF here</p>
          <p className="text-xs text-muted-foreground">
            or use the button below to select a file
          </p>
        </div>
        <Button onClick={() => fileInputRef.current?.click()} disabled={disabled}>
          Upload PDF
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>Supported formats: PDF</span>
        <span>Maximum size: 25 MB</span>
      </div>

      {upload && <UploadProgress upload={upload} />}
    </div>
  )
}
