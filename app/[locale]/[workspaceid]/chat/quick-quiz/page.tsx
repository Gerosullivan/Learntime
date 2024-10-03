"use client"

import { ChatUI } from "@/components/chat/chat-ui"
import { LearntimeContext } from "@/context/context"
import { useContext, useEffect } from "react"
import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"

export default function ChatIDPage() {
  const { setSelectedChat, allChatRecallAnalysis, setMessages } =
    useContext(LearntimeContext)

  const { handleNewState } = useChatHandler()

  useEffect(() => {
    setSelectedChat(null)

    setMessages([])
    handleNewState("quick_quiz_ready")
  }, [])

  return <ChatUI chatTitle="Quick Quiz" />
}
