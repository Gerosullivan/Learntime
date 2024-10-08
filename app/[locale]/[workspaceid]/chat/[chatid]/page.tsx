"use client"

import { ChatUI } from "@/components/chat/chat-ui"
import { LearntimeContext } from "@/context/context"
import { getChatById } from "@/db/chats"
import { useParams } from "next/navigation"
import { useContext, useEffect, useState } from "react"
import Loading from "@/app/[locale]/loading"
import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"

export default function ChatIDPage() {
  const { setSelectedChat, setTopicDescription, setInput, chats, setMessages } =
    useContext(LearntimeContext)

  const { handleNewState } = useChatHandler()

  const [chatLoading, setChatLoading] = useState(true)
  const [chatTitle, setChatTitle] = useState("New topic")
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

  useEffect(() => {
    if (params.chatid && chats.length > 0) {
      const currentChat = chats.find(chat => chat.id === params.chatid)
      if (currentChat) {
        setChatTitle(currentChat.name || "New topic")
      }
    }
  }, [params.chatid, chats])

  const fetchChat = async () => {
    const chat = await getChatById(params.chatid as string)
    if (!chat) return

    setSelectedChat(chat)
    setMessages([])

    if (chat.topic_description) {
      setTopicDescription(chat.topic_description)
      const forgottenFactsArray =
        typeof chat.recall_analysis === "string"
          ? (JSON.parse(chat.recall_analysis) as string[])
          : []

      if (forgottenFactsArray.length > 0) {
        handleNewState("topic_default_quiz")
      } else {
        handleNewState("topic_default")
      }
    } else if (chat.name && chat.name !== "New topic") {
      handleNewState("topic_no_description_in_db")
    } else {
      handleNewState("topic_new")
      setInput("")
    }
  }

  if (chatLoading) {
    return <Loading />
  }

  return <ChatUI chatTitle={chatTitle} />
}
