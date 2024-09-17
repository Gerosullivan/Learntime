import { Message } from "../messages/message"
import { useChat } from "ai/react"

export const ChatMessages = () => {
  const { messages } = useChat()

  return messages.map((message, index, array) => {
    return (
      <Message
        key={index}
        message={message}
        isLast={index === array.length - 1}
      />
    )
  })
}
