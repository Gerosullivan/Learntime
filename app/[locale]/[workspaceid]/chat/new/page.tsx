"use client"

import { ChatUI } from "@/components/chat/chat-ui"
import { LearntimeContext } from "@/context/context"
import { useContext, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"

export default function ChatIDPage() {
  // console.log("New Chat Page")
  const { setSelectedChat, setChatStudyState, setMessages } =
    useContext(LearntimeContext)

  useEffect(() => {
    setSelectedChat(null)

    setMessages([
      {
        id: uuidv4(),
        content: `Enter your topic name below to start.`,
        role: "assistant"
      }
    ])

    setChatStudyState("topic_new")
  }, [])

  return <ChatUI chatTitle="New Chat" />
}
