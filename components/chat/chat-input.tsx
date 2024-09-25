import { LearntimeContext } from "@/context/context"
import {
  IconCirclePlus,
  IconPlayerStopFilled,
  IconSend
} from "@tabler/icons-react"
import { FC, useContext, useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { Input } from "../ui/input"
import { useChatHandler } from "./chat-hooks/use-chat-handler"
import QuickResponse from "./QuickResponse"
import ReactTextareaAutosize from "react-textarea-autosize"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { ChangeEvent } from "react"
import { KeyboardEvent } from "react" // Add this import
import { cn } from "@/lib/utils" // Make sure to import the cn function

interface ChatInputProps {
  files: FileList | null
  setFiles: React.Dispatch<React.SetStateAction<FileList | null>>
}

function TextFilePreview({ file }: { file: File }) {
  const [content, setContent] = useState<string>("")

  useEffect(() => {
    const reader = new FileReader()
    reader.onload = e => {
      const text = e.target?.result
      setContent(typeof text === "string" ? text.slice(0, 100) : "")
    }
    reader.readAsText(file)
  }, [file])

  return (
    <div>
      {content}
      {content.length >= 100 && "..."}
    </div>
  )
}

export const ChatInput: FC<ChatInputProps> = ({ files, setFiles }) => {
  const { t } = useTranslation()
  const {
    chatStudyState,
    input,
    isLoading,
    handleInputChange,
    handleSubmit,
    stop
  } = useContext(LearntimeContext)
  const { makeMessageBody, handleCreateTopicName } = useChatHandler()

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePaste = (event: React.ClipboardEvent) => {
    const items = event.clipboardData?.items

    if (items) {
      const pastedFiles = Array.from(items)
        .map(item => item.getAsFile())
        .filter((file): file is File => file !== null)

      if (pastedFiles.length > 0) {
        const validFiles = pastedFiles.filter(
          file =>
            file.type.startsWith("image/") || file.type.startsWith("text/")
        )

        if (validFiles.length === pastedFiles.length) {
          const dataTransfer = new DataTransfer()
          validFiles.forEach(file => dataTransfer.items.add(file))
          setFiles(dataTransfer.files)
        } else {
          toast.error("Only image and text files are allowed")
        }
      }
    }
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(event.target.files)
    }
  }

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (chatStudyState === "topic_new") {
      handleCreateTopicName(input)
    } else {
      const body = makeMessageBody()
      const options = files ? { experimental_attachments: files } : {}
      handleSubmit(event, { body, ...options })
      setFiles(null)
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      handleFormSubmit(event as unknown as React.FormEvent<HTMLFormElement>)
    }
  }

  return (
    <>
      <div className="flex flex-col flex-wrap justify-center gap-2">
        <QuickResponse setFiles={setFiles} />
        <AnimatePresence>
          {files && files.length > 0 && (
            <div className="flex w-full flex-row flex-wrap gap-2">
              {Array.from(files).map(file =>
                file.type.startsWith("image") ? (
                  <div key={file.name}>
                    <motion.img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-16 rounded-md"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{
                        y: -10,
                        scale: 1.1,
                        opacity: 0,
                        transition: { duration: 0.2 }
                      }}
                    />
                  </div>
                ) : file.type.startsWith("text") ? (
                  <motion.div
                    key={file.name}
                    className="leading-1 h-16 w-28 overflow-hidden rounded-lg border bg-white p-2 text-[8px] text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{
                      y: -10,
                      scale: 1.1,
                      opacity: 0,
                      transition: { duration: 0.2 }
                    }}
                  >
                    <TextFilePreview file={file} />
                  </motion.div>
                ) : null
              )}
            </div>
          )}
        </AnimatePresence>
      </div>

      {!chatStudyState.endsWith("hide_input") && (
        <form
          onSubmit={handleFormSubmit}
          className="border-input relative mt-3 flex min-h-[60px] w-full items-center justify-center rounded-xl border-2"
        >
          <IconCirclePlus
            className="absolute bottom-[12px] left-3 cursor-pointer p-1 hover:opacity-50"
            size={32}
            onClick={() => fileInputRef.current?.click()}
          />

          <Input
            ref={fileInputRef}
            className="hidden"
            type="file"
            onChange={handleFileChange}
            multiple
            accept="image/*,text/*"
          />

          <ReactTextareaAutosize
            className="ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring text-md flex w-full resize-none rounded-md border-none bg-transparent px-14 py-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            placeholder={t(`Message Mentor...`)}
            minRows={1}
            maxRows={18}
            value={input}
            onChange={handleInputChange}
            onPaste={handlePaste}
            onKeyDown={handleKeyDown}
          />

          <div className="absolute bottom-[8px] right-3 cursor-pointer hover:opacity-50">
            {isLoading ? (
              <IconPlayerStopFilled
                className="hover:bg-background animate-pulse rounded bg-transparent p-1"
                onClick={stop}
                size={30}
              />
            ) : (
              <button
                type="submit"
                className="m-0 p-0"
                disabled={!input.trim()}
              >
                <IconSend
                  size={30}
                  className={cn(
                    "bg-primary text-secondary rounded p-1",
                    !input.trim() && "cursor-not-allowed opacity-50"
                  )}
                />
              </button>
            )}
          </div>
        </form>
      )}
    </>
  )
}
