"use client"

import { ChatUI } from "@/components/chat/chat-ui"
import { LearntimeContext } from "@/context/context"
import { getChatById } from "@/db/chats"
import { useParams } from "next/navigation"
import { useContext, useEffect, useState } from "react"
import { v4 as uuidv4 } from "uuid"
import Loading from "@/app/[locale]/loading"

export default function ChatIDPage() {
  // console.log("Chat ID Page")
  const {
    setSelectedChat,
    setTopicDescription,
    setChatStudyState,
    setMessages
  } = useContext(LearntimeContext)

  const [chatLoading, setChatLoading] = useState(true)
  const [chatTitle, setChatTitle] = useState("Chat")
  const params = useParams()

  useEffect(() => {
    const fetchData = async () => {
      await fetchChat()
    }

    if (params.chatid) {
      fetchData().then(() => {
        setChatLoading(false)
      })
    }
  }, [])

  const fetchChat = async () => {
    const chat = await getChatById(params.chatid as string)
    if (!chat) return

    if (chat.topic_description) {
      setTopicDescription(chat.topic_description)

      setMessages([
        {
          id: uuidv4(),
          content: `Welcome back to the topic "${chat.name}".
          Please select from the options below.`,
          role: "assistant"
        }
      ])

      setChatStudyState("topic_default_hide_input")
    } else {
      setMessages([
        {
          id: uuidv4(),
          content: `Please add topic description below for ${chat.name}.`,
          role: "assistant"
        }
      ])
      setChatStudyState("topic_describe_upload")
    }

    setSelectedChat(chat)

    setChatTitle(chat.name || "Chat")
  }

  if (chatLoading) {
    return <Loading />
  }

  return <ChatUI chatTitle={chatTitle} />
}
