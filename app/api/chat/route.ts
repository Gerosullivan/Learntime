import { LanguageModel } from "ai"
import { openai } from "./registry"
import { handleTopicGeneration } from "@/lib/server/topic-generation-handler"
import { handleRecallAttempt } from "@/lib/server/recall-attempt-handler"
import { handleHinting } from "@/lib/server/hinting-handler"
import { handleReview } from "@/lib/server/review-handler"
import { handleQuickQuizQuestion } from "@/lib/server/quick-quiz-question-handler"
import { handleQuickQuizAnswer } from "@/lib/server/quick-quiz-answer-handler"
import { handleRecallShowHints } from "@/lib/server/recall-show-hints-handler"
import { StudyState, getNextStudyState } from "@/lib/studyStates"

// export const runtime = "edge"
export const dynamic = "force-dynamic"
export const maxDuration = 180

export async function POST(request: Request) {
  try {
    const json = await request.json()

    const defaultModel = openai("gpt-4o-mini") as LanguageModel
    const nextStudyState: StudyState =
      getNextStudyState(json.studyState) || json.studyState

    const context = {
      ...json,
      defaultModel,
      nextStudyState
    }

    switch (context.studyState as StudyState) {
      case "topic_name_saved":
      case "topic_describe_upload":
      case "topic_no_description_in_db":
        return await handleTopicGeneration(context)

      case "recall_first_attempt":
        return await handleRecallAttempt(context)

      case "recall_show_hints":
        return await handleRecallShowHints(context)

      case "recall_final_suboptimal_feedback":
      case "recall_answer_hints":
        return await handleHinting(context)

      case "recall_finished":
      case "reviewing":
        return await handleReview(context)

      case "quick_quiz_question":
        return await handleQuickQuizQuestion(context)

      case "quick_quiz_answer_next":
      case "quick_quiz_user_answer":
      case "quick_quiz_finished":
        return await handleQuickQuizAnswer(context)

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
