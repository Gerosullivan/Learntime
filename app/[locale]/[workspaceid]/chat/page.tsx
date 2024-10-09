"use client"

import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"
import { Brand } from "@/components/ui/brand"
import { LearntimeContext } from "@/context/context"
import { updateProfile } from "@/db/profile"
import useHotkey from "@/lib/hooks/use-hotkey"
import { useTheme } from "next-themes"
import { useContext, useEffect, useRef } from "react"
import FeedbackAndHelp from "@/components/chat/feedback-and-help"
import { useRouter, usePathname } from "next/navigation" // Updated import
import VideoTutorial from "@/components/VideoTutorial"

export default function ChatPage() {
  useHotkey("o", () => handleNewTopic())

  const {
    profile,
    setProfile,
    setMessages,
    setChatStudyState,
    setSelectedChat
  } = useContext(LearntimeContext)

  const { handleNewTopic } = useChatHandler()

  const { theme } = useTheme()

  // Ref to track if the tutorial has been started to prevent duplicate executions
  const tutorialStartedRef = useRef(false)

  const router = useRouter()
  const pathname = usePathname() // Get the current pathname

  useEffect(() => {
    setSelectedChat(null)

    setMessages([])
    setChatStudyState("home")
  }, [])

  useEffect(() => {
    const startTutorial = async () => {
      if (profile && !profile.has_onboarded && !tutorialStartedRef.current) {
        console.log("Starting tutorial for the first time")
        tutorialStartedRef.current = true // Mark as tutorial started
        const updatedProfile = await updateProfile(profile.id, {
          ...profile,
          has_onboarded: true
        })
        setProfile(updatedProfile)
        // show video here
      }
    }

    startTutorial()
  }, [profile, router, pathname])

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
