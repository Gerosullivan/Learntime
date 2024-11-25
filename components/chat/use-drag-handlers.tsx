import { useState, DragEvent } from "react"
import { toast } from "sonner"

export const useDragHandlers = (setFiles: (files: FileList | null) => void) => {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    const validFiles = files.filter(
      file =>
        file.type.startsWith("image/") ||
        file.type.startsWith("text/") ||
        file.type === "application/pdf"
    )

    if (validFiles.length === files.length) {
      const dataTransfer = new DataTransfer()
      validFiles.forEach(file => dataTransfer.items.add(file))
      setFiles(dataTransfer.files)
    } else {
      toast.error("Only image, text and PDF files are allowed")
    }
  }

  return {
    isDragging,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop
  }
}
