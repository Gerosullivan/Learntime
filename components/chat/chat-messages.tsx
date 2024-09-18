import { useContext } from "react"
import { LearntimeContext } from "@/context/context"
import { Message } from "../messages/message"

export const ChatMessages: React.FC = () => {
  const { messages } = useContext(LearntimeContext)
  if (!messages) return null

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
