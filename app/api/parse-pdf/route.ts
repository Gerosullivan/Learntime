import { readFile, unlink } from "fs/promises"
import PDFParser from "pdf2json"

export const dynamic = "force-dynamic"
export const maxDuration = 30

export async function POST(request: Request) {
  try {
    const { filePath } = await request.json()

    if (!filePath) {
      return new Response(JSON.stringify({ error: "No file path provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      })
    }

    const buffer = await readFile(filePath)

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

    // Clean up the temporary file immediately after parsing
    try {
      await unlink(filePath)
      console.log(`Cleaned up file: ${filePath}`)
    } catch (cleanupError) {
      console.error(`Failed to cleanup file: ${filePath}`, cleanupError)
    }

    return new Response(JSON.stringify({ success: true, text }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })
  } catch (error) {
    console.error("Error parsing PDF:", error)

    // Attempt cleanup even on error
    if (request.json) {
      try {
        const { filePath } = await request.json()
        if (filePath) {
          await unlink(filePath).catch(console.error)
        }
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
