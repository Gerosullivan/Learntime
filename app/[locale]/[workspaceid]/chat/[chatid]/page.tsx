"use client"

import { ChatUI } from "@/components/chat/chat-ui"
import { Message } from "ai"
import { useChat } from "ai/react"
import { useState } from "react"
import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"

export default function ChatIDPage() {
  const [initialMessage, setInitialMessage] = useState<Message>()
  const { handleResponse } = useChatHandler()

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
      handleResponse(response, messages, setMessages)
    },
    initialMessages: initialMessage ? [initialMessage] : []
  })

  return (
    <ChatUI
      input={input}
      isLoading={isLoading}
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
      stop={stop}
      setInput={setInput}
      messages={messages}
      append={append}
      setInitialMessage={setInitialMessage}
      setMessages={setMessages}
    />
  )
}
