import { ChatbotUIContext } from "@/context/context"
import { useRouter } from "next/navigation"
import { useContext } from "react"
import { handleCreateChat } from "../chat-helpers"
import { v4 as uuidv4 } from "uuid"
import { useChat } from "ai/react"
import { Message } from "ai"
import { StudyState } from "@/lib/studyStates"
import { getChatById } from "@/db/chats"

export const useChatHandler = () => {
  const router = useRouter()

  const {
    profile,
    selectedWorkspace,
    setSelectedChat,
    setChats,
    setChatStudyState,
    chats,
    selectedChat,
    chatStudyState,
    topicDescription,
    setTopicDescription,
    allChatRecallAnalysis,
    setAllChatRecallAnalysis,
    chatRecallMetadata,
    setChatRecallMetadata
  } = useContext(ChatbotUIContext)

  const handleSendMessage = (
    event: React.FormEvent<HTMLFormElement> | React.MouseEvent<SVGSVGElement>
  ) => {
    event.preventDefault()
    if (chatStudyState === "topic_new") {
      handleCreateTopic(input)
      return
    }

    let currentChat = selectedChat ? { ...selectedChat } : null

    const workspaceInstructions = selectedWorkspace!.instructions

    let prePrompt = ""

    if (profile?.profile_context) {
      prePrompt += `User Info:\n${profile.profile_context}\n\n`
    }

    if (workspaceInstructions) {
      prePrompt += `System Instructions:\n${workspaceInstructions}\n\n`
    }

    setInput(prePrompt + input)

    let randomRecallFact: string = ""

    const isQuickQuiz: boolean =
      chatStudyState === "quick_quiz_ready_hide_input" ||
      chatStudyState === "quick_quiz_answer"

    let studySheet = topicDescription
    let quizFinished = allChatRecallAnalysis.length === 0
    let studyState = chatStudyState

    if (chatStudyState === "quick_quiz_ready_hide_input" && !quizFinished) {
      const randomIndex = Math.floor(
        Math.random() * allChatRecallAnalysis.length
      )
      const { recallAnalysis, chatId } = allChatRecallAnalysis[randomIndex]
      randomRecallFact = recallAnalysis
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

    handleSubmit(event as React.FormEvent<HTMLFormElement>, {
      body: {
        chatId: currentChat?.id,
        studyState,
        studySheet,
        chatRecallMetadata,
        randomRecallFact,
        profile_context: profile?.profile_context || ""
      }
    })
  }

  const handleResponse = async (response: Response) => {
    console.log("Received HTTP response from server:", response)
    const newStudyState = response.headers.get("NEW-STUDY-STATE") as StudyState

    if (newStudyState) {
      setChatStudyState(newStudyState)
      if (newStudyState === "topic_saved_hide_input") {
        const newTopicContent = await getChatById(selectedChat!.id)
        const topicDescription = newTopicContent!.topic_description || ""
        setTopicDescription(topicDescription)
      }
      if (newStudyState === "recall_first_attempt") {
        setMessages([])
      }
    }

    const score = response.headers.get("SCORE")
    if (score) {
      const dueDateFromNow = response.headers.get("DUE-DATE-FROM-NOW")

      setChatRecallMetadata({
        score: parseInt(score),
        dueDateFromNow: dueDateFromNow!
      })
    }

    const isQuickQuiz: boolean =
      chatStudyState === "quick_quiz_ready_hide_input" ||
      chatStudyState === "quick_quiz_answer"

    if (!selectedChat && !isQuickQuiz) {
      const lastUserMessage = messages.find(message => message.role === "user")
      const messageTitle = lastUserMessage?.content.substring(0, 100) || ""
      await handleCreateChat(
        profile!,
        selectedWorkspace!,
        messageTitle,
        setSelectedChat,
        setChats
      )
    } else if (!isQuickQuiz) {
      const updatedChat = await getChatById(selectedChat!.id)

      if (updatedChat) {
        setChats(prevChats => {
          const updatedChats = prevChats.map(prevChat =>
            prevChat.id === updatedChat.id ? updatedChat : prevChat
          )

          return updatedChats
        })
      }
    }
  }

  const { setMessages, setInput, handleSubmit, input, messages } = useChat()

  const handleGoHome = async () => {
    if (!selectedWorkspace) return

    setSelectedChat(null)

    // setChatStudyState("home")

    return router.push(`/${selectedWorkspace.id}/chat`)
  }

  const handleNewChat = async () => {
    if (!selectedWorkspace) return

    setSelectedChat(null)

    return router.push(`/${selectedWorkspace.id}/chat`)
  }

  const handleStartTutorial = async () => {
    setChatStudyState("tutorial_hide_input")

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
      await handleCreateChat(
        profile!,
        selectedWorkspace!,
        "States of matter",
        setSelectedChat,
        setChats,
        topic_description
      )

      setMessages([
        {
          id: uuidv4(),
          role: "assistant",
          content: `👋 Hello! I'm your AI Study Mentor.
I'm here to boost your learning by assisting with creating a topic study sheet and guiding you through optimally spaced free recall study sessions.
This tutorial will walk you through how to craft a revision topic.
You'll find topics listed in the panel on the left side of the chat window. 👈
Open the panel, and you'll see "States of matter" as our example topic for this tutorial.
Please click 'Next' below to proceed with the tutorial.`
        }
      ])
    } catch (error) {
      console.log({ error })
    }
  }

  const handleCreateTopic = async (input: string) => {
    setMessages(prevMessages => [
      ...prevMessages,
      {
        id: uuidv4(),
        role: "user",
        content: input
      } as Message
    ])

    // add new chat to db
    await handleCreateChat(
      profile!,
      selectedWorkspace!,
      input,
      setSelectedChat,
      setChats
    )

    setChatStudyState("topic_describe_upload" as StudyState)

    setMessages(prevMessages => [
      ...prevMessages,
      {
        id: uuidv4(),
        role: "assistant",
        content: `Topic successfully created. Please describe your topic below.
You can also upload files ⨁ as source material for me to generate your study notes.`
      }
    ])
  }

  return {
    prompt,
    handleNewChat,
    handleGoHome,
    handleStartTutorial,
    handleCreateTopic,
    handleSendMessage,
    handleResponse // Add this to the returned object
  }
}
