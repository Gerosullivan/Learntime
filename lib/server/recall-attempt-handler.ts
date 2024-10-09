import { StudyState } from "@/lib/studyStates"
import { updateTopicOnRecall } from "@/lib/server/server-chat-helpers"
import {
  streamText,
  LanguageModel,
  convertToCoreMessages,
  generateObject
} from "ai"
import { formatDistanceToNow } from "date-fns/esm"
import {
  getScoringSystemMessage,
  scoringSchema,
  ScoringSchema
} from "./scoring-system-message"

export async function handleRecallAttempt(
  scoringModel: LanguageModel,
  defaultModel: LanguageModel,
  nextStudyState: StudyState,
  studySheet: string,
  chatId: string,
  studentMessage: any,
  systemContext: string
) {
  let date_from_now = ""
  let recallScore = 0
  let forgottenOrIncorrectFacts: string[] = []
  const systemMessage = getScoringSystemMessage()

  const { object } = await generateObject<ScoringSchema>({
    model: defaultModel,
    schema: scoringSchema,
    prompt: `
${systemMessage}
<TopicSource>
${studySheet}
</TopicSource>
<StudentRecall>
${studentMessage.content}
</StudentRecall>`
  })

  // Now 'object' is typed as ScoringSchema
  recallScore = Math.round(object.score)
  forgottenOrIncorrectFacts = object.forgotten_facts

  const DB_response = await updateTopicOnRecall(
    chatId,
    recallScore,
    JSON.stringify(forgottenOrIncorrectFacts)
  )

  if (!DB_response.success) {
    throw new Error(DB_response.error || "Failed to update topic on recall")
  }

  const { due_date, previous_test_result } = DB_response

  if (!due_date) {
    throw new Error("Due date not returned from updateTopicOnRecall")
  }

  date_from_now = formatDistanceToNow(due_date)
  const allRecalled = forgottenOrIncorrectFacts.length === 0

  let newStudyState: StudyState = nextStudyState

  const mentor_system_message = `You are helpful, friendly study mentor. 
${systemContext}`

  let content = ""

  if (allRecalled) {
    newStudyState = "recall_finished"

    content = `
Congratulate the student on their recall attempt of achieving a perfect score.

Generate additional feedback based on the previous test result: ${previous_test_result}%.

Inform the student about their next recall session based on this due date: ${date_from_now}.
  Provide a specific timeframe for the next session.
  Use calendar emoji for visual reinforcement.
  Example: "Your next recall session is due in {{dueDateFromNow}}. 📅"
  
Finally, ask the student if they wish to revisit the topic's source material to enhance understanding or clarify any uncertainties.`
  } else {
    // score < 90

    content = `Follow the following instructions:
  1. Provide positive and encouraging feedback to the student based on their recall attempt: ${recallScore}%
  2. Compare this score to the previous test result: ${previous_test_result}%.
  3. Finally, ask the student if they wish to:
      a. receive hints for the forgotten facts.
      b. start a quick quiz on this topic based on the facts they missed.
      c. finish the session.`
  }

  const chatStreamResponse = await streamText({
    model: defaultModel,
    messages: convertToCoreMessages([
      {
        role: "system",
        content: `${mentor_system_message}`
      },
      {
        role: "user",
        content: content
      }
    ])
  })

  return chatStreamResponse.toDataStreamResponse({
    headers: {
      "NEW-STUDY-STATE": newStudyState,
      "CHAT-UPDATED": "true"
    }
  })
}
