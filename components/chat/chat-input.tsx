import { ChatbotUIContext } from "@/context/context"
import { cn } from "@/lib/utils"
import {
  IconCirclePlus,
  IconPlayerStopFilled,
  IconSend
} from "@tabler/icons-react"
import { FC, useContext, useRef } from "react"
import { useTranslation } from "react-i18next"
import { Input } from "../ui/input"
import { useChatHandler } from "./chat-hooks/use-chat-handler"
import QuickResponse from "./QuickResponse"
import ReactTextareaAutosize from "react-textarea-autosize"
import { Message } from "ai"

interface ChatInputProps {
  input: string
  isLoading: boolean
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>, options?: any) => void
  stop: () => void
  setInput: (input: string) => void
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  append: (message: any, options?: any) => void
}

export const ChatInput: FC<ChatInputProps> = ({
  input,
  isLoading,
  handleInputChange,
  handleSubmit,
  stop,
  setInput,
  setMessages,
  append
}) => {
  const { t } = useTranslation()
  const { chatStudyState } = useContext(ChatbotUIContext)
  const { makeMessageBody, handleCreateTopic } = useChatHandler()

  const fileInputRef = useRef<HTMLInputElement>(null)

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (chatStudyState === "topic_new") {
      handleCreateTopic(input, setMessages)
      // setInput("")
    } else {
      const body = makeMessageBody()
      handleSubmit(event, { body })
    }
  }

  return (
    <>
      <div className="flex flex-col flex-wrap justify-center gap-2">
        <QuickResponse append={append} />
      </div>

      {!chatStudyState.endsWith("hide_input") && (
        <form
          onSubmit={onSubmit}
          className="border-input relative mt-3 flex min-h-[60px] w-full items-center justify-center rounded-xl border-2"
        >
          <IconCirclePlus
            className="absolute bottom-[12px] left-3 cursor-pointer p-1 hover:opacity-50"
            size={32}
            onClick={() => fileInputRef.current?.click()}
          />

          <Input ref={fileInputRef} className="hidden" type="file" />

          <ReactTextareaAutosize
            className="ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring text-md flex w-full resize-none rounded-md border-none bg-transparent px-14 py-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            placeholder={t(`Message Mentor...`)}
            minRows={1}
            maxRows={18}
            value={input}
            onChange={handleInputChange}
          />

          <div className="absolute bottom-[14px] right-3 cursor-pointer hover:opacity-50">
            {isLoading ? (
              <IconPlayerStopFilled
                className="hover:bg-background animate-pulse rounded bg-transparent p-1"
                onClick={stop}
                size={30}
              />
            ) : (
              <button
                type="submit"
                disabled={!input}
                className={cn(
                  "bg-primary text-secondary rounded p-1",
                  !input && "cursor-not-allowed opacity-50"
                )}
              >
                <IconSend size={30} />
              </button>
            )}
          </div>
        </form>
      )}
    </>
  )
}
