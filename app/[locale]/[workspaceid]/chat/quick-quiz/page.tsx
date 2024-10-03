"use client"

import { ChatUI } from "@/components/chat/chat-ui"
import { LearntimeContext } from "@/context/context"
import { useContext, useEffect } from "react"
import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"

export default function ChatIDPage() {
  console.log("Quick Quiz Page")
  const { setSelectedChat, allChatRecallAnalysis } =
    useContext(LearntimeContext)

  const { handleNewState } = useChatHandler()

  useEffect(() => {
    setSelectedChat(null)
    if (allChatRecallAnalysis.length > 0) {
      handleNewState("quick_quiz_ready")
    }
  }, [allChatRecallAnalysis])

  return <ChatUI chatTitle="Quick Quiz" />
}
