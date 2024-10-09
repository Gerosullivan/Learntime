"use client"

import { ChatUI } from "@/components/chat/chat-ui"
import { LearntimeContext } from "@/context/context"
import { useContext, useEffect, useState } from "react"
import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"

export default function ChatIDPage() {
  const { setSelectedChat, setMessages, setAllChatRecallAnalysis, chats } =
    useContext(LearntimeContext)

  const { handleNewState } = useChatHandler()
  const [hasRecallAnalysis, setHasRecallAnalysis] = useState(false)

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
      setHasRecallAnalysis(true)
    } else {
      setHasRecallAnalysis(false)
    }
  }, [chats, setAllChatRecallAnalysis])

  if (!hasRecallAnalysis) {
    return (
      <div className="flex h-screen flex-col items-center justify-center px-4">
        <h2 className="mb-4 text-center text-2xl">
          No quick quiz questions available yet.
        </h2>
        <p className="text-md text-center">
          To generate questions, please perform recall on the topics in this
          MemoryStack.
        </p>
        <p className="text-md text-center">
          Only facts you incorrectly recalled will be added to the quick quiz.
        </p>
      </div>
    )
  }

  return <ChatUI chatTitle="Quick Quiz" />
}
