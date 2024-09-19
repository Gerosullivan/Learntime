import { NextResponse } from "next/server"
import { updateChat } from "@/lib/server/server-chat-helpers"

export async function POST(request: Request) {
  const { chatId, content } = await request.json()

  const result = await updateChat(chatId, { topic_description: content })

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
