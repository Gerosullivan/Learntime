import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"
import { IconPlus } from "@tabler/icons-react"
import { Button } from "../ui/button"

export const SidebarCreateButtons = () => {
  const { handleNewChat } = useChatHandler()

  const handleCreateChat = async () => {
    handleNewChat()
  }

  return (
    <div className="flex w-full space-x-2">
      <Button className="flex h-[36px] grow" onClick={handleCreateChat}>
        <IconPlus className="mr-1" size={20} />
        New topic
      </Button>
    </div>
  )
}
