import Loading from "@/app/[locale]/loading"
import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"
import { ChatbotUIContext } from "@/context/context"
import { getChatById } from "@/db/chats"
import useHotkey from "@/lib/hooks/use-hotkey"
import { useParams } from "next/navigation"
import { FC, useContext, useEffect, useState } from "react"
import { ChatHelp } from "./chat-help"
import { useScroll } from "./chat-hooks/use-scroll"
import { ChatInput } from "./chat-input"
import { ChatMessages } from "./chat-messages"
import { ChatScrollButtons } from "./chat-scroll-buttons"
import { useChat } from "ai/react"

interface ChatUIProps {}

export const ChatUI: FC<ChatUIProps> = ({}) => {
  useHotkey("o", () => handleNewChat())

  const params = useParams()

  const {
    setChatMessages,
    selectedChat,
    setSelectedChat,
    setTopicDescription,
    chats,
    setChatStudyState,
    allChatRecallAnalysis
  } = useContext(ChatbotUIContext)

  const { handleNewChat, handleFocusChatInput } = useChatHandler()

  const {
    messagesStartRef,
    messagesEndRef,
    handleScroll,
    scrollToBottom,
    setIsAtBottom,
    isAtTop,
    isAtBottom,
    isOverflowing,
    scrollToTop
  } = useScroll()

  const [loading, setLoading] = useState(true)
  const [chatTitle, setChatTitle] = useState("Chat")

  useEffect(() => {
    const fetchData = async () => {
      await fetchChat()

      setIsAtBottom(true)
    }

    const startQuickQuiz = async () => {
      setSelectedChat(null)
      if (allChatRecallAnalysis.length > 0) {
        setChatMessages([
          {
            content: `Are you ready to start a 🔥 Quick quiz?`,
            role: "assistant",
            sequence_number: 0
          }
        ])
        setChatStudyState("quick_quiz_ready_hide_input")
      }
    }

    if (params.chatid) {
      if (params.chatid === "quick-quiz") {
        startQuickQuiz()
        setLoading(false)
      } else {
        fetchData().then(() => {
          handleFocusChatInput()
          setLoading(false)
        })
      }
    } else {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // find selected chat in chats
    const chat = chats.find(chat => chat.id === selectedChat?.id)
    setTopicDescription(chat?.topic_description || "")
  }, [chats])

  const fetchChat = async () => {
    const chat = await getChatById(params.chatid as string)
    if (!chat) return

    if (chat.topic_description) {
      setTopicDescription(chat.topic_description)

      setChatStudyState("topic_default_hide_input")

      setChatMessages([
        {
          content: `Welcome back to the topic "${chat.name}".
Please select from the options below.`,
          role: "assistant",
          sequence_number: 0
        }
      ])
    } else {
      setChatMessages([
        {
          content: `Please add topic description below for ${chat.name}.`,
          role: "assistant",
          sequence_number: 0
        }
      ])
      setChatStudyState("topic_describe_upload")
    }

    setSelectedChat(chat)

    setChatTitle(chat.name || "Chat")
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div className="relative flex h-full flex-col items-center">
      <div className="absolute left-4 top-2.5 flex justify-center">
        <ChatScrollButtons
          isAtTop={isAtTop}
          isAtBottom={isAtBottom}
          isOverflowing={isOverflowing}
          scrollToTop={scrollToTop}
          scrollToBottom={scrollToBottom}
        />
      </div>

      <div className="bg-secondary flex max-h-[50px] min-h-[50px] w-full items-center justify-center border-b-2 font-bold">
        <div className="max-w-[200px] truncate sm:max-w-[400px] md:max-w-[500px] lg:max-w-[600px] xl:max-w-[700px]">
          {chatTitle}
        </div>
      </div>

      <div
        className="flex size-full flex-col overflow-auto border-b"
        onScroll={handleScroll}
      >
        <div ref={messagesStartRef} />

        <ChatMessages />

        <div ref={messagesEndRef} />
      </div>

      <div className="relative w-full min-w-[300px] items-end px-2 pb-3 pt-0 sm:w-[600px] sm:pb-8 sm:pt-5 md:w-[700px] lg:w-[700px] xl:w-[800px]">
        <ChatInput />
      </div>

      <div className="absolute bottom-2 right-2 hidden md:block lg:bottom-4 lg:right-4">
        <ChatHelp />
      </div>
    </div>
  )
}
