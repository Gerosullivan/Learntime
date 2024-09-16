import { ChatbotUIContext } from "@/context/context"
import { getChatById } from "@/db/chats"
import { deleteMessagesIncludingAndAfter } from "@/db/messages"
import { buildFinalMessages } from "@/lib/build-prompt"
import { Tables } from "@/supabase/types"
import { ChatMessage, ChatPayload } from "@/types"
import { useRouter } from "next/navigation"
import { useContext, useEffect, useRef } from "react"
import {
  createTempMessages,
  handleCreateAssistantMessage,
  handleCreateChat,
  handleCreateMessages,
  processResponse
} from "../chat-helpers"
import { StudyState } from "@/lib/studyStates"

export const useChatHandler = () => {
  const router = useRouter()

  const {
    userInput,
    setUserInput,
    profile,
    setIsGenerating,
    setChatMessages,
    setFirstTokenReceived,
    selectedChat,
    selectedWorkspace,
    setSelectedChat,
    setChats,
    abortController,
    setAbortController,
    chatMessages,
    chatStudyState,
    setChatStudyState,
    topicDescription,
    setTopicDescription,
    setChatRecallMetadata,
    chatRecallMetadata,
    allChatRecallAnalysis,
    setAllChatRecallAnalysis,
    chats
  } = useContext(ChatbotUIContext)

  const chatInputRef = useRef<HTMLTextAreaElement>(null)

  const handleGoHome = async () => {
    if (!selectedWorkspace) return

    setUserInput("")
    setSelectedChat(null)

    setIsGenerating(false)
    setFirstTokenReceived(false)

    setChatMessages([])

    setChatStudyState("home")

    return router.push(`/${selectedWorkspace.id}/chat`)
  }

  const handleNewChat = async () => {
    if (!selectedWorkspace) return

    setUserInput("")
    setSelectedChat(null)

    setIsGenerating(false)
    setFirstTokenReceived(false)

    setChatMessages([
      {
        content: `Enter your topic name below to start.`,
        role: "assistant",
        sequence_number: 0
      }
    ])

    setChatStudyState("topic_new")

    return router.push(`/${selectedWorkspace.id}/chat`)
  }

  const handleFocusChatInput = () => {
    chatInputRef.current?.focus()
  }

  const handleStopMessage = () => {
    if (abortController) {
      abortController.abort()
    }
  }

  const handleSendMessage = async (
    messageContent: string,
    chatMessages: ChatMessage[]
  ) => {
    const startingInput = messageContent

    if (chatStudyState === "topic_new") {
      handleCreateTopic(messageContent, chatMessages)
      return
    }

    try {
      setUserInput("")
      setIsGenerating(true)

      const newAbortController = new AbortController()
      setAbortController(newAbortController)

      let currentChat = selectedChat ? { ...selectedChat } : null

      let retrievedFileItems: Tables<"file_items">[] = []

      const { tempUserChatMessage, tempAssistantChatMessage } =
        createTempMessages(messageContent, chatMessages, setChatMessages)

      let payload: ChatPayload = {
        workspaceInstructions: selectedWorkspace!.instructions || "",
        chatMessages: [...chatMessages, tempUserChatMessage]
      }

      let generatedText = ""

      const formattedMessages = await buildFinalMessages(payload, profile!)

      let response: Response

      const formattedMessagesWithoutSystem = formattedMessages.slice(1)

      let randomRecallFact: string = ""

      const isQuickQuiz: boolean =
        chatStudyState === "quick_quiz_ready_hide_input" ||
        chatStudyState === "quick_quiz_answer"

      let studySheet = topicDescription
      let quizFinished = allChatRecallAnalysis.length === 0
      let studyState = chatStudyState

      if (chatStudyState === "quick_quiz_ready_hide_input" && !quizFinished) {
        // randomly remove and return one item from allChatRecallAnalysis
        const randomIndex = Math.floor(
          Math.random() * allChatRecallAnalysis.length
        )
        const { recallAnalysis, chatId } = allChatRecallAnalysis[randomIndex]
        randomRecallFact = recallAnalysis
        // set topicDescription based on topicDescription allChatRecallAnalysis[randomIndex].id
        studySheet =
          chats.find(chat => chat.id === chatId)?.topic_description || ""

        setTopicDescription(studySheet)

        const updated = [...allChatRecallAnalysis]
        updated.splice(randomIndex, 1)
        setAllChatRecallAnalysis(updated)
        console.log("randomRecallFact", randomRecallFact, updated.length)
      } else if (isQuickQuiz && quizFinished) {
        studyState = "quick_quiz_finished_hide_input"
        setChatStudyState(studyState)
      }

      response = await fetch("/api/chat/functions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: formattedMessagesWithoutSystem,
          chatId: currentChat?.id,
          studyState,
          studySheet,
          chatRecallMetadata,
          randomRecallFact,
          profile_context: profile?.profile_context || ""
        })
      })

      const newStudyState = response.headers.get(
        "NEW-STUDY-STATE"
      ) as StudyState

      if (newStudyState) {
        setChatStudyState(newStudyState)
        if (newStudyState === "topic_saved_hide_input") {
          const newTopicContent = await getChatById(currentChat!.id)
          const topicDescription = newTopicContent!.topic_description || "" // Provide a default value if topicDescription is null
          setTopicDescription(topicDescription)
        }
        if (newStudyState === "recall_first_attempt") {
          chatMessages = []
        }
      }

      const score = response.headers.get("SCORE")
      if (score) {
        // there will be a DUE-DATE-FROM-NOW
        const dueDateFromNow = response.headers.get("DUE-DATE-FROM-NOW")

        setChatRecallMetadata({
          score: parseInt(score),
          dueDateFromNow: dueDateFromNow!
        })
      }

      generatedText = await processResponse(
        response,
        tempAssistantChatMessage,
        newAbortController,
        setFirstTokenReceived,
        setChatMessages
      )

      if (!currentChat && !isQuickQuiz) {
        currentChat = await handleCreateChat(
          profile!,
          selectedWorkspace!,
          messageContent,
          newMessageFiles,
          setSelectedChat,
          setChats,
          setChatFiles
        )
      } else if (!isQuickQuiz) {
        const updatedChat = await getChatById(currentChat!.id)

        if (updatedChat) {
          setChats(prevChats => {
            const updatedChats = prevChats.map(prevChat =>
              prevChat.id === updatedChat.id ? updatedChat : prevChat
            )

            return updatedChats
          })
        }
      }

      await handleCreateMessages(
        chatMessages,
        currentChat,
        profile!,
        { modelId: "llama2-uncensored:latest" },
        messageContent,
        generatedText,
        retrievedFileItems,
        setChatMessages,
        setChatFileItems
      )
      setIsGenerating(false)
      setFirstTokenReceived(false)
    } catch (error) {
      console.log({ error })
      setIsGenerating(false)
      setFirstTokenReceived(false)
      setUserInput(startingInput)
    }
  }

  const handleCreateTopic = async (
    messageContent: string,
    chatMessages: ChatMessage[]
  ) => {
    try {
      setUserInput("")
      setIsFilePickerOpen(false)
      setNewMessageImages([])

      const currentChat = await handleCreateChat(
        profile!,
        selectedWorkspace!,
        messageContent,
        newMessageFiles,
        setSelectedChat,
        setChats,
        setChatFiles
      )

      const generatedText = `Topic successfully created. Please describe your topic below.
You can also upload files ⨁ as source material for me to generate your study notes.`

      const retrievedFileItems: Tables<"file_items">[] = []

      await handleCreateMessages(
        chatMessages,
        currentChat,
        profile!,
        { modelId: "llama2-uncensored:latest" },
        messageContent,
        generatedText,
        retrievedFileItems,
        setChatMessages,
        setChatFileItems
      )

      const newStudyState: StudyState = "topic_describe_upload"
      setChatStudyState(newStudyState)

      setUserInput("")
    } catch (error) {
      console.log({ error })
      setUserInput(messageContent)
    }
  }

  const handleStartTutorial = async () => {
    setIsGenerating(true)
    setChatStudyState("tutorial_hide_input")

    const messageContent = `👋 Hello! I'm your AI Study Mentor.
I'm here to boost your learning by assisting with creating a topic study sheet and guiding you through optimally spaced free recall study sessions.
This tutorial will walk you through how to craft a revision topic.
You'll find topics listed in the panel on the left side of the chat window. 👈
Open the panel, and you'll see "States of matter" as our example topic for this tutorial.
Please click 'Next' below to proceed with the tutorial.`

    const topic_description = `### States of Matter

    ### Overview 
       - Matter exists in three main states: solid, liquid, and gas.
       - These states are defined by how particles are arranged and how they move.
    
       ### The Three States of Matter
       - **Solid:**  
         - Particles are tightly packed and vibrate in place.
         - Keeps a definite shape and volume.
         - Example: Ice.
    
       - **Liquid:**  
         - Particles are less tightly packed and can move around each other.
         - Has a definite volume but changes shape to fit the container.
         - Example: Water.
    
       - **Gas:**  
         - Particles are spread out and move freely.
         - Takes both the shape and volume of the container.
         - Example: Water vapour.
    
    ### Transitions Between States
       - **Melting:** Solid to liquid (Ice to water).
       - **Freezing:** Liquid to solid (Water to ice).
       - **Vaporisation:** Liquid to gas (Water to vapour).
       - **Condensation:** Gas to liquid (Vapour to water).
    
    ### Key Insights
       - Changes in temperature or pressure cause these transitions.
       - Understanding the transitions helps explain natural phenomena like ice melting, water boiling, and dew forming.`

    try {
      setUserInput("")
      setIsGenerating(true)
      setIsFilePickerOpen(false)
      setNewMessageImages([])

      const currentChat = await handleCreateChat(
        profile!,
        selectedWorkspace!,
        messageContent,
        newMessageFiles,
        setSelectedChat,
        setChats,
        setChatFiles,
        true,
        topic_description
      )

      await handleCreateAssistantMessage(
        chatMessages,
        currentChat,
        profile!,
        messageContent,
        setChatMessages
      )

      setIsGenerating(false)
      setFirstTokenReceived(false)
    } catch (error) {
      console.log({ error })
      setIsGenerating(false)
      setFirstTokenReceived(false)
      setUserInput(messageContent)
    }
  }

  return {
    chatInputRef,
    prompt,
    handleNewChat,
    handleGoHome,
    handleSendMessage,
    handleFocusChatInput,
    handleStopMessage,
    handleStartTutorial
  }
}
