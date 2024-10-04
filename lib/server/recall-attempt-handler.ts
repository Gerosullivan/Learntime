import { StudyState } from "@/lib/studyStates"
import { updateTopicOnRecall } from "@/lib/server/server-chat-helpers"
import {
  streamText,
  LanguageModel,
  generateText,
  convertToCoreMessages
} from "ai"
import { formatDistanceToNow } from "date-fns/esm"

export async function handleRecallAttempt(
  scoringModel: LanguageModel,
  defaultModel: LanguageModel,
  studyState: StudyState,
  studySheet: string,
  chatId: string,
  studentMessage: any,
  studentContext: string
) {
  let date_from_now = ""
  let recallScore = 0
  let forgottenOrIncorrectFacts: string[] = []

  const finalFeedback = `Finally, ask the student if they wish to revisit the topic's source material to enhance understanding or clarify any uncertainties.`

  const { text } = await generateText({
    model: scoringModel,
    messages: convertToCoreMessages([
      {
        role: "system",
        content:
          "You are a study mentor. You assess student recall performance and list incorrect or missed facts. Given the Topic source and a Student's recall attempt below  (delimited with XML tags), perform the following tasks: 1. Identify any significant omissions in the student's recall when compared against the Topic study sheet below. List these omissions as succinctly as possible, providing clear and educational summaries for review. 2. Calculate a recall score representing how accurately the student's recall matches the Topic study sheet only. Important: Only compare against the Topic study sheet below. The score should reflect the percentage of the material correctly recalled, ranging from 0 (no recall) to 100 (perfect recall). Provide the following fields in a JSON dict, \"forgotten_facts\" (An array of strings, each summarizing a key fact or concept omitted from the student's recall when compared to the original topic study sheet. If the students recalled all facts correctly, provide an empty array.), \"score\" (A numerical value between 0 and 100 indicating the recall accuracy.)"
      },
      {
        role: "user",
        content: `
<TopicSource>
${studySheet}
</TopicSource>
<StudentRecall>
${studentMessage.content}
</StudentRecall>`
      }
    ])
  })

  // extract recall score and forgotten facts from content response
  const recallResponse = JSON.parse(text)
  recallScore = recallResponse.score

  forgottenOrIncorrectFacts = recallResponse.forgotten_facts

  const DB_response = await updateTopicOnRecall(
    chatId,
    recallScore,
    JSON.stringify(forgottenOrIncorrectFacts)
  )

  if (!DB_response.success) {
    throw new Error(DB_response.error || "Failed to update topic on recall")
  }

  const due_date = DB_response.due_date
  if (!due_date) {
    throw new Error("Due date not returned from updateTopicOnRecall")
  }

  date_from_now = formatDistanceToNow(due_date)
  const allRecalled = forgottenOrIncorrectFacts.length === 0

  let chatStreamResponse
  let newStudyState: StudyState

  const mentor_system_message = `You are helpful, friendly study mentor. 
  ${studentContext}
  IMPORTANT: When generating Corrections do not provide answers (additions) to ommited or forgotten facts. 
  When generating Hints for Forgotten facts, provide hints and clues without giving away answers.`

  if (allRecalled) {
    newStudyState =
      studyState === "recall_tutorial_first_attempt"
        ? "tutorial_hinting"
        : "recall_finished"

    chatStreamResponse = await streamText({
      model: defaultModel,
      temperature: 0.2,
      messages: convertToCoreMessages([
        {
          role: "system",
          content: `${mentor_system_message} Answer in a consistent style.`
        },
        {
          role: "user",
          content: `Generate upbeat feedback based on the students recall performance. 
Topic study sheet: 
"""
${studySheet}
"""

Student recall: 
"""
${studentMessage.content}
"""

Inform the student of their recall score: ${recallScore}% and the next recall session date; ${date_from_now} from now, to ensure consistent study progress.
${finalFeedback}`
        }
      ])
    })
  } else {
    // score < 90
    chatStreamResponse = await streamText({
      model: defaultModel,
      temperature: 0.2,
      messages: convertToCoreMessages([
        {
          role: "system",
          content: `${mentor_system_message} Answer in a consistent style. Follow the following instructions:
            1. Provide positive and encouraging feedback to the student based on their recall attempt.
            2. Generate a list of hints for the list of forgotten facts below. Important: Do not provide answers to the forgotten facts, only hints and clues.
            3. Ask the student to try and provide answers to this list of hints.`
        },
        {
          role: "user",
          content: `
<TopicSource>
${studySheet}
</TopicSource>
<StudentRecall>
${studentMessage.content}
</StudentRecall> 
<ForgottenFacts>
${forgottenOrIncorrectFacts.join("\n")}
</ForgottenFacts>`
        }
      ])
    })

    newStudyState =
      studyState === "recall_tutorial_first_attempt"
        ? "tutorial_hinting"
        : "recall_hinting"
  }

  return chatStreamResponse.toDataStreamResponse({
    headers: {
      "NEW-STUDY-STATE": newStudyState,
      SCORE: recallScore.toString(),
      "DUE-DATE-FROM-NOW": date_from_now,
      "FACTS-FEEDBACK": JSON.stringify(recallResponse.topic_facts)
    }
  })
}
