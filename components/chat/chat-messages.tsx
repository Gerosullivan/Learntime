import { Message } from "../messages/message"
import { Message as AIMessage } from "ai"

interface ChatMessagesProps {
  messages: AIMessage[]
  isLoading: boolean
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  isLoading
}) => {
  return messages.map((message, index, array) => {
    return (
      <Message
        key={index}
        message={message}
        isLast={index === array.length - 1}
        isLoading={isLoading}
      />
    )
  })
}
