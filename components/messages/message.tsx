import { ChatbotUIContext } from "@/context/context"
import { cn } from "@/lib/utils"
import { IconMoodSmile, IconPencil, IconSparkles } from "@tabler/icons-react"
import Image from "next/image"
import { FC, useContext } from "react"
import { MessageMarkdown } from "./message-markdown"
import { Message as MessageType } from "ai"

const ICON_SIZE = 32

interface MessageProps {
  message: MessageType
  isLast: boolean
}

export const Message: FC<MessageProps> = ({ message, isLast }) => {
  const { profile, isLoading } = useContext(ChatbotUIContext)

  return (
    <div
      className={cn(
        "flex w-full justify-center",
        message.role === "user" ? "" : "bg-secondary"
      )}
    >
      <div className="relative flex w-full flex-col p-6 sm:w-[550px] sm:px-0 md:w-[650px] lg:w-[650px] xl:w-[700px]">
        <div className="space-y-3">
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
                isLoading && isLast ? (
                  <svg
                    className="-ml-1 mr-3 size-5 animate-spin text-white"
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
                ) : (
                  <IconSparkles size={ICON_SIZE} />
                )
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
          <MessageMarkdown content={message.content} />
        </div>
      </div>
    </div>
  )
}

Message
