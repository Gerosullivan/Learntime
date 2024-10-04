import { LearntimeContext } from "@/context/context"
import { useRouter } from "next/navigation"
import { useContext } from "react"
import { handleCreateChat } from "../chat-helpers"
import { v4 as uuidv4 } from "uuid"
import { Message } from "ai"
import { StudyState } from "@/lib/studyStates"
import { updateChat } from "@/db/chats"
import { studyStates } from "@/lib/studyStates"

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
    messages,
    setInput,
    append
  } = useContext(LearntimeContext)

  const makeMessageBody = (newStudyState?: StudyState) => {
    const thisChatStudyState = newStudyState || chatStudyState
    if (thisChatStudyState === "topic_new") {
      return // This case is now handled in ChatInput
    }

    let currentChat = selectedChat ? { ...selectedChat } : null

    let randomRecallFact: string = ""

    const isQuickQuiz: boolean = thisChatStudyState.startsWith("quick_quiz")

    let studySheet = topicDescription
    let quizFinished = allChatRecallAnalysis.length === 0
    let studyState = thisChatStudyState

    if (thisChatStudyState === "quick_quiz_question" && !quizFinished) {
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
      // console.log("randomRecallFact", randomRecallFact, updated.length)
    } else if (isQuickQuiz && quizFinished) {
      studyState = "quick_quiz_finished"
      setChatStudyState(studyState)
    }

    const systemContext = `
User Info:
${profile?.profile_context || ""}


System Instructions for module ${selectedWorkspace?.name || ""}:
${selectedWorkspace?.instructions || ""}

`

    return {
      chatId: currentChat?.id,
      studyState,
      studySheet,
      chatRecallMetadata,
      randomRecallFact,
      systemContext
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

    handleNewState("topic_name_saved" as StudyState)
  }

  const handleStartTutorial = async () => {
    setMessages([])
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
    } catch (error) {
      console.log({ error })
    }

    setTopicDescription(topic_description)
    handleNewState("tutorial")
  }

  const handleGoToWorkspace = () => {
    if (!selectedWorkspace) return

    return router.push(`/${selectedWorkspace.id}/chat`)
  }

  const handleQuickResponseLLMCall = async (
    message: string,
    newStudyState: StudyState
  ) => {
    setChatStudyState(newStudyState)
    const body = makeMessageBody(newStudyState)

    append(
      {
        content: message,
        role: "user",
        id: uuidv4()
      },
      { body }
    )
  }

  const handleNewState = (newState: StudyState) => {
    const stateObject = studyStates.find(state => state.name === newState)
    if (!stateObject) {
      console.log("No state object found for", newState)
      return
    }
    setChatStudyState(newState)
    const assistantMessage = stateObject.message
    if (assistantMessage === "{{LLM}}") {
      return
    }

    let content
    if (assistantMessage === "{{topicDescription}}") {
      content = topicDescription
    } else {
      content = assistantMessage
    }
    setMessages(prevMessages => [
      ...prevMessages,
      {
        id: uuidv4(),
        content,
        role: "assistant"
      }
    ])
  }

  const handleTopicSave = async () => {
    if (selectedChat) {
      const topicContent = messages[messages.length - 1].content
      const response = await fetch("/api/update-topic-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chatId: selectedChat.id,
          content: topicContent
        })
      })
      const data = await response.json()
      if (!data.success) {
        handleNewState("topic_describe_upload_error")
      } else {
        handleNewState("topic_saved")
        setTopicDescription(topicContent)
      }
    } else {
      handleNewState("topic_save_error")
    }
  }

  return {
    handleNewTopic,
    handleStartTutorial,
    handleCreateTopicName,
    makeMessageBody,
    handleGoToWorkspace,
    handleNewState,
    handleTopicSave,
    handleQuickResponseLLMCall
  }
}
