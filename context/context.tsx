import { Tables } from "@/supabase/types"
import { ChatRecallMetadata } from "@/lib/studyStates"
import { ChatMessage, WorkspaceImage } from "@/types"
import { Dispatch, SetStateAction, createContext } from "react"
import { StudyState } from "@/lib/studyStates"

interface ChatbotUIContext {
  // PROFILE STORE
  profile: Tables<"profiles"> | null
  setProfile: Dispatch<SetStateAction<Tables<"profiles"> | null>>

  // ITEMS STORE
  chats: Tables<"chats">[]
  setChats: Dispatch<SetStateAction<Tables<"chats">[]>>

  workspaces: Tables<"workspaces">[]
  setWorkspaces: Dispatch<SetStateAction<Tables<"workspaces">[]>>

  // WORKSPACE STORE
  selectedWorkspace: Tables<"workspaces"> | null
  setSelectedWorkspace: Dispatch<SetStateAction<Tables<"workspaces"> | null>>
  workspaceImages: WorkspaceImage[]
  setWorkspaceImages: Dispatch<SetStateAction<WorkspaceImage[]>>

  // PASSIVE CHAT STORE
  userInput: string
  setUserInput: Dispatch<SetStateAction<string>>
  chatMessages: ChatMessage[]
  setChatMessages: Dispatch<SetStateAction<ChatMessage[]>>
  selectedChat: Tables<"chats"> | null
  setSelectedChat: Dispatch<SetStateAction<Tables<"chats"> | null>>
  topicDescription: string
  setTopicDescription: Dispatch<SetStateAction<string>>
  chatStudyState: StudyState
  setChatStudyState: Dispatch<SetStateAction<StudyState>>
  chatRecallMetadata: ChatRecallMetadata | null
  setChatRecallMetadata: Dispatch<SetStateAction<ChatRecallMetadata | null>>
  allChatRecallAnalysis: { chatId: string; recallAnalysis: any }[]
  setAllChatRecallAnalysis: Dispatch<
    SetStateAction<{ chatId: string; recallAnalysis: any }[]>
  >

  // ACTIVE CHAT STORE
  abortController: AbortController | null
  setAbortController: Dispatch<SetStateAction<AbortController | null>>
  firstTokenReceived: boolean
  setFirstTokenReceived: Dispatch<SetStateAction<boolean>>
  isGenerating: boolean
  setIsGenerating: Dispatch<SetStateAction<boolean>>
}

export const ChatbotUIContext = createContext<ChatbotUIContext>({
  // PROFILE STORE
  profile: null,
  setProfile: () => {},

  // ITEMS STORE
  chats: [],
  setChats: () => {},
  workspaces: [],
  setWorkspaces: () => {},

  // WORKSPACE STORE
  selectedWorkspace: null,
  setSelectedWorkspace: () => {},
  workspaceImages: [],
  setWorkspaceImages: () => {},

  // PASSIVE CHAT STORE
  userInput: "",
  setUserInput: () => {},
  selectedChat: null,
  setSelectedChat: () => {},
  chatMessages: [],
  setChatMessages: () => {},
  topicDescription: "",
  setTopicDescription: () => {},
  chatStudyState: "home",
  setChatStudyState: () => {},
  chatRecallMetadata: null,
  setChatRecallMetadata: () => {},
  allChatRecallAnalysis: [],
  setAllChatRecallAnalysis: () => {},

  // ACTIVE CHAT STORE
  isGenerating: false,
  setIsGenerating: () => {},
  firstTokenReceived: false,
  setFirstTokenReceived: () => {},
  abortController: null,
  setAbortController: () => {}
})
