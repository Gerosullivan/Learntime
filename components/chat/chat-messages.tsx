import { ChatbotUIContext } from "@/context/context"
import { FC, useContext, useState } from "react"
import { Message } from "../messages/message"

interface ChatMessagesProps {}

export const ChatMessages: FC<ChatMessagesProps> = ({}) => {
  const { chatMessages } = useContext(ChatbotUIContext)

  return chatMessages
    .sort((a, b) => a.message.sequence_number - b.message.sequence_number)
    .map((chatMessage, index, array) => {
      return (
        <Message
          key={chatMessage.message.sequence_number}
          message={chatMessage.message}
          isLast={index === array.length - 1}
        />
      )
    })
}
