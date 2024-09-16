// Only used in use-chat-handler.tsx to keep it clean

import { createChat } from "@/db/chats"

import { buildFinalMessages } from "@/lib/build-prompt"
import { consumeReadableStream } from "@/lib/consume-stream"
import { Tables, TablesInsert } from "@/supabase/types"
import { ChatMessage, ChatPayload } from "@/types"
import React from "react"
import { toast } from "sonner"
import { v4 as uuidv4 } from "uuid"
import { createEmptyCard } from "ts-fsrs"

export const validateChatSettings = (
  profile: Tables<"profiles"> | null,
  selectedWorkspace: Tables<"workspaces"> | null,
  messageContent: string
) => {
  if (!profile) {
    throw new Error("Profile not found")
  }

  if (!selectedWorkspace) {
    throw new Error("Workspace not found")
  }

  if (!messageContent) {
    throw new Error("Message content not found")
  }
}

export const createTempMessages = (
  messageContent: string,
  chatMessages: ChatMessage[],
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
) => {
  let tempUserChatMessage: ChatMessage = {
    content: messageContent,
    role: "user",
    sequence_number: chatMessages.length
  }

  let tempAssistantChatMessage: ChatMessage = {
    content: "",
    role: "assistant",
    sequence_number: chatMessages.length + 1
  }

  let newMessages = []

  newMessages = [...chatMessages, tempUserChatMessage, tempAssistantChatMessage]

  setChatMessages(newMessages)

  return {
    tempUserChatMessage,
    tempAssistantChatMessage
  }
}

export const processResponse = async (
  response: Response,
  lastChatMessage: ChatMessage,
  controller: AbortController,
  setFirstTokenReceived: React.Dispatch<React.SetStateAction<boolean>>,
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
) => {
  let fullText = ""
  let contentToAdd = ""

  if (response.body) {
    await consumeReadableStream(
      response.body,
      chunk => {
        setFirstTokenReceived(true)

        try {
          chunk
            .trimEnd()
            .split("\n")
            .reduce((acc, line) => acc + JSON.parse(line).message.content, "")
          fullText += contentToAdd
        } catch (error) {
          console.error("Error parsing JSON:", error)
        }

        setChatMessages(prev =>
          prev.map(chatMessage => {
            if (chatMessage.message.id === lastChatMessage.message.id) {
              const updatedChatMessage: ChatMessage = {
                message: {
                  ...chatMessage.message,
                  content: fullText
                }
              }

              return updatedChatMessage
            }

            return chatMessage
          })
        )
      },
      controller.signal
    )

    return fullText
  } else {
    throw new Error("Response body is null")
  }
}

export const handleCreateChat = async (
  profile: Tables<"profiles">,
  selectedWorkspace: Tables<"workspaces">,
  messageContent: string,
  setSelectedChat: React.Dispatch<React.SetStateAction<Tables<"chats"> | null>>,
  setChats: React.Dispatch<React.SetStateAction<Tables<"chats">[]>>,
  isTutorial = false,
  topic_description = ""
) => {
  const createdChat = await createChat({
    user_id: profile.user_id,
    workspace_id: selectedWorkspace.id,
    name: isTutorial ? "States of matter" : messageContent.substring(0, 100),
    srs_card: createEmptyCard(),
    topic_description,
    due_date: new Date().toISOString()
  })

  setSelectedChat(createdChat)
  setChats(chats => [createdChat, ...chats])

  return createdChat
}

export const handleCreateMessages = async (
  chatMessages: ChatMessage[],
  currentChat: Tables<"chats"> | null,
  profile: Tables<"profiles">,
  messageContent: string,
  generatedText: string,
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
) => {
  // removed saving to DB
  const now = new Date().toISOString()

  const finalChatMessages: ChatMessage[] = [
    ...chatMessages,
    {
      message: {
        chat_id: currentChat?.id ?? "",
        user_id: profile.user_id,
        content: messageContent,
        role: "user",
        sequence_number: chatMessages.length,
        image_paths: [],
        id: uuidv4(),
        created_at: now,
        updated_at: now
      }
    },
    {
      message: {
        chat_id: currentChat?.id ?? "",
        user_id: profile.user_id,
        content: generatedText,
        role: "assistant",
        sequence_number: chatMessages.length + 1,
        image_paths: [],
        id: uuidv4(),
        created_at: now,
        updated_at: now
      }
    }
  ]

  setChatMessages(finalChatMessages)
}
export const handleCreateAssistantMessage = async (
  chatMessages: ChatMessage[],
  currentChat: Tables<"chats">,
  profile: Tables<"profiles">,
  messageContent: string,
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
) => {
  const finalAssistantMessage: TablesInsert<"messages"> = {
    chat_id: currentChat.id,
    user_id: profile!.user_id,
    content: messageContent,
    role: "assistant",
    sequence_number: 0,
    image_paths: []
  }

  const createdMessage = await createMessage(finalAssistantMessage)

  setChatMessages([
    ...chatMessages,
    {
      message: createdMessage
    }
  ])
}
