"use client"

import { useCallback, useState } from "react"
import { cn } from "@/lib/utils"

interface DropzoneProps {
  onFileSelect: (file: File) => void
  accept?: string
  disabled?: boolean
  className?: string
}

export function Dropzone({
  onFileSelect,
  accept = ".pdf,application/pdf",
  disabled = false,
  className,
}: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      setIsDragging(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (disabled) return

    const files = Array.from(e.dataTransfer.files)
    const file = files.find((f) => accept.split(',').some((ext) => f.name.endsWith(ext.trim()) || f.type.includes(ext.trim().replace('.', ''))))

    if (file) {
      onFileSelect(file)
    }
  }, [disabled, accept, onFileSelect])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileSelect(file)
    }
  }, [onFileSelect])

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
        isDragging
          ? "border-primary bg-primary/10"
          : "border-primary/30 hover:border-primary/50",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleFileInput}
        disabled={disabled}
        className="hidden"
        id="dropzone-input"
      />
      <label
        htmlFor="dropzone-input"
        className={cn(
          "cursor-pointer",
          disabled && "cursor-not-allowed"
        )}
      >
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Drag and drop a file here, or click to browse
          </p>
          <p className="text-xs text-muted-foreground">
            Accepted: {accept}
          </p>
        </div>
      </label>
    </div>
  )
}

