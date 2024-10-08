import { LanguageModel } from "ai"
import { openai } from "./registry"
import { handleTopicGeneration } from "@/lib/server/topic-generation-handler"
import { handleRecallAttempt } from "@/lib/server/recall-attempt-handler"
import { handleHinting } from "@/lib/server/hinting-handler"
import { handleReview } from "@/lib/server/review-handler"
import { handleQuickQuizQuestion } from "@/lib/server/quick-quiz-question-handler"
import { handleQuickQuizAnswer } from "@/lib/server/quick-quiz-answer-handler"
import { handleRecallShowHints } from "@/lib/server/recall-show-hints-handler"
import { StudyState } from "@/lib/studyStates"

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
      chatRecallInfo,
      randomRecallFact,
      systemContext
    } = json

    const studentMessage = messages[messages.length - 1]

    const defaultModel = openai("gpt-4o-mini") as LanguageModel
    const scoringModel = openai("gpt-4o", {
      structuredOutputs: true
    }) as LanguageModel
    const hintingModel = defaultModel

    switch (studyState as StudyState) {
      case "topic_name_saved":
      case "topic_describe_upload":
      case "topic_no_description_in_db":
        return await handleTopicGeneration(
          defaultModel,
          messages,
          systemContext
        )

      case "recall_first_attempt":
        return await handleRecallAttempt(
          scoringModel,
          defaultModel,
          studyState,
          studySheet,
          chatId,
          studentMessage,
          systemContext
        )

      case "recall_show_hints":
        return await handleRecallShowHints(
          defaultModel,
          studySheet,
          chatRecallInfo,
          systemContext
        )
      case "recall_final_suboptimal_feedback":
      case "recall_answer_hints":
        return await handleHinting(
          hintingModel,
          messages,
          studyState,
          studySheet,
          chatRecallInfo,
          systemContext
        )

      case "recall_finished":
      case "reviewing":
        return await handleReview(defaultModel, messages, systemContext)

      case "quick_quiz_question":
        return await handleQuickQuizQuestion(
          defaultModel,
          studySheet,
          randomRecallFact,
          systemContext
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
          systemContext
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
