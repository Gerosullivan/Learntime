import { ChatMessage } from "."

export interface ChatPayload {
  workspaceInstructions: string
  chatMessages: ChatMessage[]
}
