"use client"

import { ChatUI } from "@/components/chat/chat-ui"
import { LearntimeContext } from "@/context/context"
import { useContext, useEffect } from "react"
import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"

export default function ChatIDPage() {
  const {
    setSelectedChat,
    allChatRecallAnalysis,
    setMessages,
    setAllChatRecallAnalysis,
    chats
  } = useContext(LearntimeContext)

  const { handleNewState } = useChatHandler()

  useEffect(() => {
    setSelectedChat(null)

    setMessages([])
    handleNewState("quick_quiz_ready")
  }, [])

  useEffect(() => {
    console.log("populating recall analysis")
    const recallAnalysisInChats: { chatId: string; recallAnalysis: string }[] =
      chats.reduce(
        (acc: { chatId: string; recallAnalysis: string }[], chat) => {
          if (chat.recall_analysis != null) {
            try {
              const recallAnalysisList: string[] = JSON.parse(
                chat.recall_analysis as string
              )
              recallAnalysisList.forEach((recallAnalysis: string) => {
                acc.push({ chatId: chat.id, recallAnalysis })
              })
            } catch (e) {
              console.error(
                "Failed to parse recall_analysis:",
                chat.recall_analysis
              )
            }
          }
          return acc
        },
        []
      )

    if (recallAnalysisInChats.length > 0) {
      setAllChatRecallAnalysis(recallAnalysisInChats)
    }
  }, [chats, setAllChatRecallAnalysis])

  return <ChatUI chatTitle="Quick Quiz" />
}
