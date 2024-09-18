import type { QuickResponse as QuickResponseType } from "@/lib/studyStates"
import {
  getQuickResponses,
  getQuickResponseByUserText
} from "@/lib/studyStates"
import { useContext } from "react"
import { LearntimeContext } from "@/context/context"
import { useChatHandler } from "./chat-hooks/use-chat-handler"
import { IconSend } from "@tabler/icons-react"
import { v4 as uuidv4 } from "uuid"
import { useRouter } from "next/navigation"

const QuickResponse: React.FC = () => {
  const {
    chatStudyState,
    setMessages,
    setChatStudyState,
    topicDescription,
    selectedChat,
    messages,
    append
  } = useContext(LearntimeContext)

  const { makeMessageBody } = useChatHandler()

  const router = useRouter()

  const handleQuickResponse = async (message: string) => {
    const quickResponse = getQuickResponseByUserText(message)
    if (quickResponse && quickResponse.responseText !== "{{LLM}}") {
      if (message === "Start recall now.") {
        setMessages([])
      } else {
        setMessages(prevMessages => [
          ...prevMessages,
          {
            content: message,
            role: "user",
            id: uuidv4()
          }
        ])
      }

      let responseText
      let newStudyState = quickResponse.newStudyState

      switch (quickResponse.responseText) {
        case "{{DB}}":
          if (selectedChat) {
            const topicContent = messages[messages.length - 1].content
            const response = await fetch("/api/update-topic-content", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                chatId: selectedChat.id,
                content: topicContent
              })
            })
            const data = await response.json()
            if (!data.success) {
              responseText = "Server error saving topic content."
              newStudyState = "topic_describe_upload"
            } else {
              responseText = "Save successful."
              router.refresh() // Refresh the page to reflect the changes
            }
          } else {
            responseText = "Error: No chat selected."
          }
          break
        case "{{topicDescription}}":
          responseText = topicDescription
          break
        default:
          responseText = quickResponse.responseText
          break
      }

      setMessages(prevMessages => [
        ...prevMessages,
        {
          content: responseText,
          role: "assistant",
          id: uuidv4()
        }
      ])

      setChatStudyState(newStudyState)
      // setInput("")
    } else {
      // If it's not a quick response, append / call LLM
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
      {quickResponses.map((quickResponse: QuickResponseType, index) => (
        <div key={index} className={`${widthClass(index)} p-2`}>
          <button
            className="flex w-full items-center justify-between rounded-md border border-blue-500 px-4 py-2 text-left text-blue-500 transition-colors hover:bg-blue-500 hover:text-white"
            onClick={event => handleQuickResponse(quickResponse.quickText)}
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
