import { useState, DragEvent } from "react"
import { toast } from "sonner"

export const useDragHandlers = () => {
  const [files, setFiles] = useState<FileList | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const droppedFiles = event.dataTransfer.files
    const droppedFilesArray = Array.from(droppedFiles)
    if (droppedFilesArray.length > 0) {
      const validFiles = droppedFilesArray.filter(
        file => file.type.startsWith("image/") || file.type.startsWith("text/")
      )

      if (validFiles.length === droppedFilesArray.length) {
        const dataTransfer = new DataTransfer()
        validFiles.forEach(file => dataTransfer.items.add(file))
        setFiles(dataTransfer.files)
      } else {
        toast.error("Only image and text files are allowed!")
      }
    }
    setIsDragging(false)
  }

  return {
    handleDragOver,
    handleDragLeave,
    handleDrop,
    isDragging,
    files,
    setFiles
  }
}
