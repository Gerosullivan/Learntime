import { writeFile, unlink } from "fs/promises"
import { NextResponse } from "next/server"
import path from "path"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Check file size (e.g., 10MB limit)
    const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB in bytes
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const fileName = `${Date.now()}-${file.name}`
    const tempFilePath = path.join("/tmp", fileName)

    await writeFile(tempFilePath, buffer)

    // Schedule cleanup after 1 minute
    setTimeout(async () => {
      try {
        await unlink(tempFilePath)
        console.log(`Cleaned up temporary file: ${tempFilePath}`)
      } catch (error) {
        console.error(`Failed to cleanup file: ${tempFilePath}`, error)
      }
    }, 60000)

    return NextResponse.json({
      success: true,
      filePath: tempFilePath
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Error uploading file" }, { status: 500 })
  }
}
