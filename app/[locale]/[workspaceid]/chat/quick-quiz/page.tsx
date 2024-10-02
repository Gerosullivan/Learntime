"use client"

import { ChatUI } from "@/components/chat/chat-ui"
import { LearntimeContext } from "@/context/context"
import { useContext, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"

export default function ChatIDPage() {
  console.log("Quick Quiz Page")
  const {
    setSelectedChat,
    setChatStudyState,
    setMessages,
    allChatRecallAnalysis
  } = useContext(LearntimeContext)

  useEffect(() => {
    setSelectedChat(null)
    if (allChatRecallAnalysis.length > 0) {
      setMessages([
        {
          id: uuidv4(),
          content: `Are you ready to start a 🔥 Quick quiz?`,
          role: "assistant"
        }
      ])
      setChatStudyState("quick_quiz_ready")
    }
  }, [allChatRecallAnalysis])

  return <ChatUI chatTitle="Quick Quiz" />
}
