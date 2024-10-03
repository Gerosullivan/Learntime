"use client"

import { LearntimeContext } from "@/context/context"
import { getProfileByUserId } from "@/db/profile"
import { getWorkspaceImageFromStorage } from "@/db/storage/workspace-images"
import { getWorkspacesByUserId } from "@/db/workspaces"
import { StudyState } from "@/lib/studyStates"
import { convertBlobToBase64 } from "@/lib/blob-to-b64"
import { supabase } from "@/lib/supabase/browser-client"
import { Tables } from "@/supabase/types"
import { ChatRecallMetadata } from "@/lib/studyStates"
import { WorkspaceImage } from "@/types"
import { useChat } from "ai/react"
import { useRouter } from "next/navigation"
import { FC, useEffect, useState } from "react"

interface GlobalStateProps {
  children: React.ReactNode
}

export const GlobalState: FC<GlobalStateProps> = ({ children }) => {
  const router = useRouter()

  // PROFILE STORE
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null)

  // ITEMS STORE
  const [chats, setChats] = useState<Tables<"chats">[]>([])
  const [workspaces, setWorkspaces] = useState<Tables<"workspaces">[]>([])

  // WORKSPACE STORE
  const [selectedWorkspace, setSelectedWorkspace] =
    useState<Tables<"workspaces"> | null>(null)
  const [workspaceImages, setWorkspaceImages] = useState<WorkspaceImage[]>([])

  // PASSIVE CHAT STORE

  const [selectedChat, setSelectedChat] = useState<Tables<"chats"> | null>(null)
  const [topicDescription, setTopicDescription] = useState<string>("")
  const [chatStudyState, setChatStudyState] = useState<StudyState>("home")
  const [chatRecallMetadata, setChatRecallMetadata] =
    useState<ChatRecallMetadata | null>(null)
  const [allChatRecallAnalysis, setAllChatRecallAnalysis] = useState<
    { chatId: string; recallAnalysis: any }[]
  >([])

  const handleResponse = async (response: Response) => {
    const newStudyState = response.headers.get("NEW-STUDY-STATE") as StudyState

    if (newStudyState) {
      setChatStudyState(newStudyState)
    }

    const score = response.headers.get("SCORE")
    if (score) {
      const dueDateFromNow = response.headers.get("DUE-DATE-FROM-NOW")

      setChatRecallMetadata({
        score: parseInt(score),
        dueDateFromNow: dueDateFromNow!
      })
    }
  }

  const {
    input,
    isLoading,
    handleInputChange,
    handleSubmit,
    stop,
    setInput,
    messages,
    append,
    setMessages
  } = useChat({
    keepLastMessageOnError: true,
    onResponse: response => {
      handleResponse(response)
    }
  })

  useEffect(() => {
    ;(async () => {
      const profile = await fetchStartingData()
    })()
  }, [])

  const fetchStartingData = async () => {
    const session = (await supabase.auth.getSession()).data.session

    if (session) {
      const user = session.user

      const profile = await getProfileByUserId(user.id)
      setProfile(profile)

      if (!profile.has_onboarded) {
        return router.push("/setup")
      }

      const workspaces = await getWorkspacesByUserId(user.id)
      setWorkspaces(workspaces)

      for (const workspace of workspaces) {
        let workspaceImageUrl = ""

        if (workspace.image_path) {
          workspaceImageUrl =
            (await getWorkspaceImageFromStorage(workspace.image_path)) || ""
        }

        if (workspaceImageUrl) {
          const response = await fetch(workspaceImageUrl)
          const blob = await response.blob()
          const base64 = await convertBlobToBase64(blob)

          setWorkspaceImages(prev => [
            ...prev,
            {
              workspaceId: workspace.id,
              path: workspace.image_path,
              base64: base64,
              url: workspaceImageUrl
            }
          ])
        }
      }

      return profile
    }
  }

  return (
    <LearntimeContext.Provider
      value={{
        // PROFILE STORE
        profile,
        setProfile,

        chats,
        setChats,
        workspaces,
        setWorkspaces,

        // WORKSPACE STORE
        selectedWorkspace,
        setSelectedWorkspace,
        workspaceImages,
        setWorkspaceImages,

        // PASSIVE CHAT STORE
        selectedChat,
        setSelectedChat,
        topicDescription,
        setTopicDescription,
        chatStudyState,
        setChatStudyState,
        chatRecallMetadata,
        setChatRecallMetadata,
        allChatRecallAnalysis,
        setAllChatRecallAnalysis,
        input,
        isLoading,
        handleInputChange,
        handleSubmit,
        stop,
        setInput,
        messages,
        append,
        setMessages
      }}
    >
      {children}
    </LearntimeContext.Provider>
  )
}
