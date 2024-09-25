"use client"

import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"
import { ChatUI } from "@/components/chat/chat-ui"
import { useEffect } from "react"

export default function ChatIDPage() {
  console.log("New tutorial Page")
  const { handleStartTutorial } = useChatHandler()

  useEffect(() => {
    handleStartTutorial()
  }, [])

  return <ChatUI chatTitle="New topic" />
}