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
import { TextareaAutosize } from "../ui/textarea-autosize"
import { ChatFilesDisplay } from "./chat-files-display"
import { useChatHandler } from "./chat-hooks/use-chat-handler"
import { useSelectFileHandler } from "./chat-hooks/use-select-file-handler"
import QuickResponse from "./QuickResponse"
import { useChat } from "ai/react"

export const ChatInput: FC = () => {
  const { t } = useTranslation()
  const { chatStudyState } = useContext(ChatbotUIContext)
  const { filesToAccept, handleSelectDeviceFile } = useSelectFileHandler()
  const { handleSendMessage } = useChatHandler()

  const { input, isLoading, handleInputChange, stop } = useChat()

  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <>
      <div className="flex flex-col flex-wrap justify-center gap-2">
        <ChatFilesDisplay />
        <QuickResponse />
      </div>

      {!chatStudyState.endsWith("hide_input") && (
        <div className="border-input relative mt-3 flex min-h-[60px] w-full items-center justify-center rounded-xl border-2">
          <IconCirclePlus
            className="absolute bottom-[12px] left-3 cursor-pointer p-1 hover:opacity-50"
            size={32}
            onClick={() => fileInputRef.current?.click()}
          />

          <Input
            ref={fileInputRef}
            className="hidden"
            type="file"
            onChange={e => {
              if (!e.target.files) return
              handleSelectDeviceFile(e.target.files[0])
            }}
            accept={filesToAccept}
          />

          <TextareaAutosize
            className="ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring text-md flex w-full resize-none rounded-md border-none bg-transparent px-14 py-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            placeholder={t(`Message Mentor...`)}
            minRows={1}
            maxRows={18}
          />

          <div className="absolute bottom-[14px] right-3 cursor-pointer hover:opacity-50">
            {isLoading ? (
              <IconPlayerStopFilled
                className="hover:bg-background animate-pulse rounded bg-transparent p-1"
                onClick={stop}
                size={30}
              />
            ) : (
              <IconSend
                className={cn(
                  "bg-primary text-secondary rounded p-1",
                  !input && "cursor-not-allowed opacity-50"
                )}
                onClick={handleSendMessage}
                size={30}
              />
            )}
          </div>
        </div>
      )}
    </>
  )
}
