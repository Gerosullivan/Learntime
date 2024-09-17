// Only used in use-chat-handler.tsx to keep it clean

import { createChat } from "@/db/chats"

import { Tables } from "@/supabase/types"
import React from "react"
import { createEmptyCard } from "ts-fsrs"

export const handleCreateChat = async (
  profile: Tables<"profiles">,
  selectedWorkspace: Tables<"workspaces">,
  messageTitle: string,
  setSelectedChat: React.Dispatch<React.SetStateAction<Tables<"chats"> | null>>,
  setChats: React.Dispatch<React.SetStateAction<Tables<"chats">[]>>,
  topic_description = ""
) => {
  const createdChat = await createChat({
    user_id: profile.user_id,
    workspace_id: selectedWorkspace.id,
    name: messageTitle,
    srs_card: createEmptyCard(),
    topic_description,
    due_date: new Date().toISOString()
  })

  setSelectedChat(createdChat)
  setChats(chats => [createdChat, ...chats])

  return createdChat
}
