import useHotkey from "@/lib/hooks/use-hotkey"
import {
  IconBrandGithub,
  IconFileText,
  IconHelpCircle,
  IconMail,
  IconQuestionMark
} from "@tabler/icons-react"
import Link from "next/link"
import { FC, useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "../ui/dropdown-menu"

interface ChatHelpProps {}

export const ChatHelp: FC<ChatHelpProps> = ({}) => {
  useHotkey("/", () => setIsOpen(prevState => !prevState))

  const [isOpen, setIsOpen] = useState(false)

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <IconQuestionMark className="bg-primary text-secondary size-[24px] cursor-pointer rounded-full p-0.5 opacity-60 hover:opacity-50 lg:size-[30px] lg:p-1" />
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuItem>
          <Link
            className="flex cursor-pointer items-center gap-2 hover:opacity-50"
            href="https://github.com/Gerosullivan/learntime"
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconBrandGithub /> <span>Release Notes</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link
            className="flex cursor-pointer items-center gap-2 hover:opacity-50"
            href="https://learntime.ai/help-faq"
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconHelpCircle /> <span>Help & FAQ</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
