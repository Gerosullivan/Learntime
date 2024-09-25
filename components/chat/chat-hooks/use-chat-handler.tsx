import { LearntimeContext } from "@/context/context"
import { useRouter } from "next/navigation"
import { useContext } from "react"
import { handleCreateChat } from "../chat-helpers"
import { v4 as uuidv4 } from "uuid"
import { Message } from "ai"
import { StudyState } from "@/lib/studyStates"
import { updateChat } from "@/db/chats"

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
    setMessages,
    setInput
  } = useContext(LearntimeContext)

  const makeMessageBody = () => {
    if (chatStudyState === "topic_new") {
      return // This case is now handled in ChatInput
    }

    let currentChat = selectedChat ? { ...selectedChat } : null

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

    return {
      chatId: currentChat?.id,
      studyState,
      studySheet,
      chatRecallMetadata,
      randomRecallFact,
      profile_context: profile?.profile_context || ""
    }
  }

  const handleNewTopic = async () => {
    if (!selectedWorkspace) return

    // Create a new chat in the database
    const newChat = await handleCreateChat(
      profile!,
      selectedWorkspace,
      "New topic",
      setSelectedChat,
      setChats
    )

    // Navigate to the new chat
    router.push(`/${selectedWorkspace.id}/chat/${newChat.id}`)
  }

  const handleCreateTopicName = async (input: string) => {
    setInput("")
    setMessages(prevMessages => [
      ...prevMessages,
      {
        id: uuidv4(),
        role: "user",
        content: input
      } as Message
    ])

    // update chat name in db
    await updateChat(selectedChat!.id, { name: input })

    //update chats context
    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === selectedChat?.id ? { ...chat, name: input } : chat
      )
    )

    setChatStudyState("topic_describe_upload" as StudyState)

    setMessages(prevMessages => [
      ...prevMessages,
      {
        id: uuidv4(),
        role: "assistant",
        content: `Topic name saved. Please describe your topic below.
  You can also upload files ⨁ as source material for me to generate your study notes.`
      }
    ])
  }

  const handleStartTutorial = async () => {
    setChatStudyState("tutorial_hide_input")

    const topic_description = `# States of Matter

## Overview 
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

## Transitions Between States
  - **Melting:** Solid to liquid (Ice to water).
  - **Freezing:** Liquid to solid (Water to ice).
  - **Vaporisation:** Liquid to gas (Water to vapour).
  - **Condensation:** Gas to liquid (Vapour to water).

## Key Insights
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

    setTopicDescription(topic_description)
  }

  const handleGoToWorkspace = () => {
    if (!selectedWorkspace) return

    return router.push(`/${selectedWorkspace.id}/chat`)
  }

  return {
    handleNewTopic,
    handleStartTutorial,
    handleCreateTopicName,
    makeMessageBody,
    handleGoToWorkspace
  }
}
