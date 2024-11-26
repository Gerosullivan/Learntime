import PDFParser from "pdf2json"
import {
  downloadFromStorage,
  deleteFromStorage
} from "@/lib/server/storage-utils"

export const dynamic = "force-dynamic"
export const maxDuration = 30

export async function POST(request: Request) {
  let filePath: string | null = null

  try {
    const { filePath: requestFilePath } = await request.json()
    filePath = requestFilePath

    if (!filePath) {
      return new Response(JSON.stringify({ error: "No file path provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      })
    }

    const arrayBuffer = await downloadFromStorage(filePath)
    const buffer = Buffer.from(arrayBuffer)

    const text = await new Promise((resolve, reject) => {
      const pdfParser = new (PDFParser as any)(null, 1)

      pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
        resolve(pdfParser.getRawTextContent())
      })

      pdfParser.on("pdfParser_dataError", (error: any) => {
        reject(error)
      })

      pdfParser.parseBuffer(buffer)
    })

    // Clean up the file from storage immediately after parsing
    await deleteFromStorage(filePath)
    console.log(`Cleaned up file from storage: ${filePath}`)

    return new Response(JSON.stringify({ success: true, text }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })
  } catch (error) {
    console.error("Error parsing PDF:", error)

    // Attempt cleanup even on error
    if (filePath) {
      try {
        await deleteFromStorage(filePath)
      } catch (cleanupError) {
        console.error("Error during cleanup:", cleanupError)
      }
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to parse PDF",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    )
  }
}
