import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"
import { FC, useEffect, useState } from "react"
import { useScroll } from "./chat-hooks/use-scroll"
import { ChatInput } from "./chat-input"
import { ChatMessages } from "./chat-messages"
import { ChatScrollButtons } from "./chat-scroll-buttons"
import { AnimatePresence, motion } from "framer-motion"
import FeedbackAndHelp from "./feedback-and-help"
import { useDragHandlers } from "./use-drag-handlers"
import useHotkey from "@/lib/hooks/use-hotkey"

interface ChatUIProps {
  chatTitle: string
}

export const ChatUI: FC<ChatUIProps> = ({ chatTitle }) => {
  const { handleNewTopic } = useChatHandler()
  const [files, setFiles] = useState<FileList | null>(null)

  useHotkey("o", () => handleNewTopic())

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

  const { isDragging, handleDragOver, handleDragLeave, handleDrop } =
    useDragHandlers(setFiles)

  useEffect(() => {
    scrollToBottom()
    setIsAtBottom(true)
  }, [])

  return (
    <div
      className="relative flex h-full flex-col items-center"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <AnimatePresence>
        {isDragging && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-1 bg-zinc-100/90 dark:bg-zinc-900/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div>Drag and drop files here</div>
            <div className="text-sm text-zinc-500 dark:text-zinc-400">
              {"(images and text)"}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
        <ChatInput files={files} setFiles={setFiles} />
      </div>

      <FeedbackAndHelp />
    </div>
  )
}
