import { LearntimeContext } from "@/context/context"
import { cn } from "@/lib/utils"
import { IconMoodSmile, IconPencil, IconSparkles } from "@tabler/icons-react"
import Image from "next/image"
import { FC, useContext } from "react"
import { MessageMarkdown } from "./message-markdown"
import { Message as MessageType } from "ai"
import { motion } from "framer-motion"

const ICON_SIZE = 32

interface MessageProps {
  message: MessageType & { name?: string }
  isLast: boolean
}

export const Message: FC<MessageProps> = ({ message, isLast }) => {
  const { profile, isLoading } = useContext(LearntimeContext)

  const getTextFromDataUrl = (dataUrl: string) => {
    const base64 = dataUrl.split(",")[1]
    return window.atob(base64)
  }

  const isTopicDescription = message.name === "topic_description"

  return (
    <motion.div initial={{ y: 5, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
      <div
        className={cn(
          "flex w-full justify-center",
          message.role === "user" ? "" : "bg-secondary",
          isTopicDescription && "bg-orange-50 p-4 shadow-md dark:bg-gray-800"
        )}
      >
        <div className="relative flex w-full flex-col p-6 sm:w-[550px] sm:px-0 md:w-[650px] lg:w-[650px] xl:w-[700px]">
          <div className="space-y-3">
            {!isTopicDescription && (
              <>
                {message.role === "system" ? (
                  <div className="flex items-center space-x-4">
                    <IconPencil
                      className="border-primary bg-primary text-secondary rounded border-DEFAULT p-1"
                      size={ICON_SIZE}
                    />
                    <div className="text-lg font-semibold">Prompt</div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    {message.role === "assistant" ? (
                      <IconSparkles size={ICON_SIZE} />
                    ) : profile?.image_url ? (
                      <Image
                        unoptimized
                        className={`size-[32px] rounded`}
                        src={profile?.image_url}
                        height={32}
                        width={32}
                        alt="user image"
                      />
                    ) : (
                      <IconMoodSmile
                        className="bg-primary text-secondary border-primary rounded border-DEFAULT p-1"
                        size={ICON_SIZE}
                      />
                    )}
                    <div className="font-semibold">
                      {message.role === "assistant"
                        ? "Mentor"
                        : (profile?.display_name ?? profile?.username)}
                    </div>
                  </div>
                )}
              </>
            )}
            <div
              className={cn(
                "prose dark:prose-invert max-w-none",
                isTopicDescription &&
                  "font-serif text-orange-950 dark:text-orange-200"
              )}
            >
              <MessageMarkdown content={message.content} />
            </div>

            {message.experimental_attachments &&
              message.experimental_attachments.length > 0 && (
                <div className="mt-2 flex flex-row gap-2">
                  {message.experimental_attachments.map((attachment, index) =>
                    attachment.contentType?.startsWith("image") ? (
                      <div key={index} className="relative mb-3 size-40">
                        <Image
                          src={attachment.url}
                          alt={attachment.name ?? "attachment"}
                          fill
                          className="rounded-md object-cover"
                        />
                      </div>
                    ) : attachment.contentType?.startsWith("text") ? (
                      <div
                        key={index}
                        className="mb-3 h-24 w-40 overflow-hidden rounded-md border p-2 text-xs text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800"
                      >
                        {getTextFromDataUrl(attachment.url)}
                      </div>
                    ) : null
                  )}
                </div>
              )}
          </div>
          {isLoading && isLast && (
            <svg
              className="-ml-1 mr-3 mt-2 size-5 animate-spin text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="indigo"
                strokeWidth="4"
              ></circle>
              <path
                className="fill-blue-500"
                fill="indigo"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          )}
        </div>
      </div>
    </motion.div>
  )
}
