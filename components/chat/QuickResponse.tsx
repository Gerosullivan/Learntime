import type {
  QuickResponse as QuickResponseType,
  StudyState
} from "@/lib/studyStates"
import { getQuickResponses, getStudyStateObject } from "@/lib/studyStates"
import { useContext } from "react"
import { LearntimeContext } from "@/context/context"
import { useChatHandler } from "./chat-hooks/use-chat-handler"
import { IconSend } from "@tabler/icons-react"
import { v4 as uuidv4 } from "uuid"

const QuickResponse: React.FC<{
  setFiles: (files: FileList | null) => void
}> = ({ setFiles }) => {
  const {
    chatStudyState,
    setMessages,
    allChatRecallAnalysis,
    chatRecallMetadata,
    setAllChatRecallAnalysis,
    selectedChat
  } = useContext(LearntimeContext)

  const { handleNewState, handleTopicSave, handleQuickResponseLLMCall } =
    useChatHandler()

  const handleQuickResponse = async (
    message: string,
    newStudyState: StudyState
  ) => {
    setFiles(null)

    if (!newStudyState) return

    let newStudyStateObject = getStudyStateObject(newStudyState)

    if (!newStudyStateObject) {
      console.log("No study state object found for", newStudyState)
      return
    }

    const isNotQuickQuiz = !!selectedChat

    if (newStudyState === "quick_quiz_ready" && isNotQuickQuiz) {
      if (chatRecallMetadata && chatRecallMetadata.forgottenFacts) {
        const forgottenFactsArray = JSON.parse(
          chatRecallMetadata.forgottenFacts
        ) as string[]

        if (forgottenFactsArray.length > 0) {
          setAllChatRecallAnalysis(
            forgottenFactsArray.map(fact => ({
              chatId: selectedChat?.id || "",
              recallAnalysis: fact
            }))
          )
        }
      }
    }

    if (newStudyStateObject.message === "{{LLM}}") {
      handleQuickResponseLLMCall(message, newStudyState)
      return
    }

    if (newStudyState === "recall_first_attempt") {
      setMessages([])
    } else {
      // add user message to messages stack
      setMessages(prevMessages => [
        ...prevMessages,
        {
          content: message,
          role: "user",
          id: uuidv4()
        }
      ])
    }

    if (newStudyState === "topic_save") {
      await handleTopicSave()
      return
    }

    handleNewState(newStudyState)
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
            onClick={() =>
              handleQuickResponse(
                quickResponse.quickText,
                quickResponse.newStudyState
              )
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
