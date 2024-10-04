import { LanguageModel } from "ai"
import { openai } from "./registry"
import { handleTopicGeneration } from "@/lib/server/topic-generation-handler"
import { handleRecallAttempt } from "@/lib/server/recall-attempt-handler"
import { handleHinting } from "@/lib/server/hinting-handler"
import { handleReview } from "@/lib/server/review-handler"
import { handleQuickQuizQuestion } from "@/lib/server/quick-quiz-question-handler"
import { handleQuickQuizAnswer } from "@/lib/server/quick-quiz-answer-handler"

// export const runtime = "edge"
export const dynamic = "force-dynamic"
export const maxDuration = 180

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const {
      messages,
      chatId,
      studyState,
      studySheet,
      chatRecallMetadata,
      randomRecallFact,
      profile_context,
      workspaceInstructions
    } = json

    const studentMessage = messages[messages.length - 1]

    const systemContext = [
      profile_context.length > 0
        ? `Here is how the student would like you to respond:
      """${profile_context}"""`
        : "",
      workspaceInstructions.length > 0
        ? `Here are the workspace instructions:
      """${workspaceInstructions}"""`
        : ""
    ]
      .filter(Boolean)
      .join("\n\n")

    const defaultModel = openai("gpt-4o-mini") as LanguageModel
    const scoringModel = defaultModel
    const hintingModel = defaultModel

    switch (studyState) {
      case "topic_name_saved":
      case "topic_auto_generate":
      case "topic_describe_upload":
      case "topic_no_description_in_db":
        return await handleTopicGeneration(
          defaultModel,
          messages,
          studentContext
        )

      case "recall_tutorial_first_attempt":
      case "recall_first_attempt":
        return await handleRecallAttempt(
          scoringModel,
          defaultModel,
          studyState,
          studySheet,
          chatId,
          studentMessage,
          studentContext
        )

      case "recall_tutorial_hinting":
      case "recall_hinting":
        return await handleHinting(
          hintingModel,
          messages,
          studyState,
          studySheet,
          chatRecallMetadata
        )

      case "recall_finished":
      case "reviewing":
        return await handleReview(defaultModel, messages, studentContext)

      case "quick_quiz_question":
        return await handleQuickQuizQuestion(
          defaultModel,
          studySheet,
          randomRecallFact,
          studentContext
        )

      case "quick_quiz_answer":
      case "quick_quiz_user_answer":
      case "quick_quiz_finished":
        return await handleQuickQuizAnswer(
          defaultModel,
          messages,
          studyState,
          studySheet,
          studentMessage,
          studentContext
        )

      default:
        // Handle other states or error
        throw new Error("Invalid study state")
    }
  } catch (error: any) {
    console.error("Error in POST route:", error)
    const errorMessage = error.message || "An unexpected error occurred"
    const errorCode = error.status || 500
    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
