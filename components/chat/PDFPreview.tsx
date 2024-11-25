import { useState, useEffect } from "react"
import { toast } from "sonner"

interface PDFPreviewProps {
  file: File
  onParsed?: (content: string) => void
}

export default function PDFPreview({ file, onParsed }: PDFPreviewProps) {
  const [content, setContent] = useState<string>("")

  useEffect(() => {
    const parsePDF = async () => {
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

        const previewText = text.slice(0, 100)
        setContent(previewText)
        onParsed?.(text)
      } catch (error) {
        console.error("Error processing PDF:", error)
        setContent("Error previewing PDF")
        toast.error(
          error instanceof Error ? error.message : "Failed to process PDF"
        )
      }
    }

    if (file) {
      parsePDF()
    }
  }, [file, onParsed])

  return (
    <div>
      {content}
      {content.length >= 100 && "..."}
    </div>
  )
}
