"use client"

import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"
import { Brand } from "@/components/ui/brand"
import { LearntimeContext } from "@/context/context"
import useHotkey from "@/lib/hooks/use-hotkey"
import { useTheme } from "next-themes"
import { useContext, useEffect, useRef } from "react"
import FeedbackAndHelp from "@/components/chat/feedback-and-help"
import VideoTutorial from "@/components/VideoTutorial"

export default function ChatPage() {
  useHotkey("o", () => handleNewTopic())

  const { setMessages, setChatStudyState, setSelectedChat } =
    useContext(LearntimeContext)

  const { handleNewTopic } = useChatHandler()

  const { theme } = useTheme()

  useEffect(() => {
    setSelectedChat(null)

    setMessages([])
    setChatStudyState("home")
  }, [])

  return (
    <div className="relative flex h-full flex-col items-center justify-center">
      <div className="top-50% left-50% -translate-x-50% -translate-y-50% absolute mb-20">
        <Brand theme={theme === "dark" ? "dark" : "light"} />
        <VideoTutorial />
      </div>

      <div className="flex grow flex-col items-center justify-center" />

      <FeedbackAndHelp />
    </div>
  )
}
