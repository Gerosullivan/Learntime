import type { QuickResponse } from "@/lib/studyStates"
import { getQuickResponses } from "@/lib/studyStates"
import { useContext } from "react"
import { ChatbotUIContext } from "@/context/context"
import { useChatHandler } from "./chat-hooks/use-chat-handler"
import { IconSend } from "@tabler/icons-react"
import { useChat } from "ai/react"
import { v4 as uuidv4 } from "uuid"

const QuickResponse = () => {
  const { chatStudyState } = useContext(ChatbotUIContext)

  const { append } = useChat()

  const { makeMessageBody } = useChatHandler()

  const handleQuickResponse = async (
    event: React.MouseEvent<HTMLButtonElement>,
    message: string
  ) => {
    event.preventDefault()

    const body = makeMessageBody()

    append(
      {
        content: message,
        role: "user",
        id: uuidv4()
      },
      { body }
    )
  }

  const quickResponses = getQuickResponses(chatStudyState)

  const widthClass = (index: number): string => {
    const totalButtons = quickResponses.length
    if (totalButtons === 1) return "w-full"
    // For the last button in an odd-numbered array, it should take full width
    if (totalButtons % 2 !== 0 && index === totalButtons - 1) return "w-full"
    return "w-1/2"
  }

  // Render buttons based on the available quickResponses
  return (
    <div className="flex flex-wrap">
      {quickResponses.map((quickResponse: QuickResponse, index) => (
        <div key={index} className={`${widthClass(index)} p-2`}>
          <button
            className="flex w-full items-center justify-between rounded-md border border-blue-500 px-4 py-2 text-left text-blue-500 transition-colors hover:bg-blue-500 hover:text-white"
            onClick={event =>
              handleQuickResponse(event, quickResponse.quickText)
            }
          >
            <span>{quickResponse.quickText}</span>
            <IconSend size={20} />
          </button>
        </div>
      ))}
    </div>
  )
}

export default QuickResponse
