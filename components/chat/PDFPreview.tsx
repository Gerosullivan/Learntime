import { useState, useEffect } from "react"
import { toast } from "sonner"

// Static cache to store processed PDFs and track processing state
const processedPDFs = new Map<string, string>()
const processingFiles = new Set<string>()

interface PDFPreviewProps {
  file: File
  onParsed?: (content: string) => void
}

export default function PDFPreview({ file, onParsed }: PDFPreviewProps) {
  const [content, setContent] = useState<string>("")

  useEffect(() => {
    const fileId = `${file.name}-${file.size}-${file.lastModified}`

    const parsePDF = async () => {
      // If already processing or processed, don't start another process
      if (processingFiles.has(fileId)) {
        return
      }

      if (processedPDFs.has(fileId)) {
        const cachedText = processedPDFs.get(fileId)!
        setContent(cachedText.slice(0, 100))
        onParsed?.(cachedText)
        return
      }

      // Mark as processing before starting
      processingFiles.add(fileId)

      try {
        // Step 1: Upload the file
        const uploadFormData = new FormData()
        uploadFormData.append("file", file)

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData
        })

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload PDF")
        }

        const { filePath } = await uploadResponse.json()

        // Step 2: Parse the uploaded file
        const parseResponse = await fetch("/api/parse-pdf", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ filePath })
        })

        if (!parseResponse.ok) {
          throw new Error("Failed to parse PDF")
        }

        const { text } = await parseResponse.json()

        // Cache the result
        processedPDFs.set(fileId, text)

        const previewText = text.slice(0, 100)
        setContent(previewText)
        onParsed?.(text)
      } catch (error) {
        console.error("Error processing PDF:", error)
        setContent("Error previewing PDF")
        toast.error(
          error instanceof Error ? error.message : "Failed to process PDF"
        )
      } finally {
        // Always remove from processing set when done
        processingFiles.delete(fileId)
      }
    }

    parsePDF()

    // Cleanup function to remove from cache when component unmounts
    return () => {
      processedPDFs.delete(fileId)
      processingFiles.delete(fileId)
    }
  }, [file, onParsed])

  return (
    <div>
      {content}
      {content.length >= 100 && "..."}
    </div>
  )
}
