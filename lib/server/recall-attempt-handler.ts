import { StudyState } from "@/lib/studyStates"
import { updateTopicOnRecall } from "@/lib/server/server-chat-helpers"
import {
  streamText,
  LanguageModel,
  generateText,
  convertToCoreMessages
} from "ai"
import { formatDistanceToNow } from "date-fns/esm"
import { getMentorSystemMessage } from "./mentor-system-message"
import { getScoringSystemMessage } from "./scoring-system-message"
import { z } from "zod"

export async function handleRecallAttempt(
  scoringModel: LanguageModel,
  defaultModel: LanguageModel,
  studyState: StudyState,
  studySheet: string,
  chatId: string,
  studentMessage: any,
  systemContext: string
) {
  let date_from_now = ""
  let recallScore = 0
  let forgottenOrIncorrectFacts: string[] = []

  const result = await streamText({
    model: scoringModel,
    messages: convertToCoreMessages([
      {
        role: "system",
        content: getScoringSystemMessage()
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
    ]),
    tools: {
      saveResultInDatabase: {
        description:
          "Save the result of the recall attempt in the database. Call before feedback.",
        parameters: z.object({
          recallScore: z.number(),
          forgottenOrIncorrectFacts: z.array(z.string())
        }),
        execute: async ({ recallScore, forgottenOrIncorrectFacts }) => {
          console.log(
            "saveResultInDatabase:",
            recallScore,
            forgottenOrIncorrectFacts
          )
          const DB_response = await updateTopicOnRecall(
            chatId,
            recallScore,
            JSON.stringify(forgottenOrIncorrectFacts)
          )
          if (!DB_response.success) {
            return {
              error: DB_response.error || "Failed to update topic on recall"
            }
          }
          const due_date = DB_response.due_date
          if (!due_date) {
            return "Due date not returned from updateTopicOnRecall"
          }
          date_from_now = formatDistanceToNow(due_date)
          return {
            date_from_now,
            previous_test_result: DB_response.previous_test_result
          }
        }
      },
      optimalFeedback: {
        description:
          "Call after saveResultInDatabase. Call if user get's 100% recall. Congratulate the user for a successful recall attempt. Finally, ask the student if they wish to revisit the topic's source material to enhance understanding or clarify any uncertainties.",
        parameters: z.object({
          message: z
            .string()
            .describe(
              "The feedback message to the user: Include the score difference between the current and previous recall attempt and the due date from now of the next recall attempt."
            ),
          score: z.number().describe("The score of the recall attempt."),
          dueDateFromNow: z
            .string()
            .describe("The due date from now of the next recall attempt.")
        })
      },
      subOptimalFeedback: {
        description:
          "Call after saveResultInDatabase. Call if user get's less than 100% recall. Provide positive and encouraging feedback to the student based on their recall attempt. ",
        parameters: z.object({
          message: z
            .string()
            .describe(
              "The feedback message to the user: Include the score difference between the current and previous recall attempt."
            ),
          score: z.number().describe("The score of the recall attempt."),
          dueDateFromNow: z
            .string()
            .describe("The due date from now of the next recall attempt.")
        })
      }
    }
  })

  return result.toDataStreamResponse()

  // extract recall score and forgotten facts from content response
  //   const recallResponse = JSON.parse(text)
  //   recallScore = recallResponse.score

  //   forgottenOrIncorrectFacts = recallResponse.forgotten_facts

  //   const DB_response = await updateTopicOnRecall(
  //     chatId,
  //     recallScore,
  //     JSON.stringify(forgottenOrIncorrectFacts)
  //   )

  //   if (!DB_response.success) {
  //     throw new Error(DB_response.error || "Failed to update topic on recall")
  //   }

  //   const due_date = DB_response.due_date
  //   if (!due_date) {
  //     throw new Error("Due date not returned from updateTopicOnRecall")
  //   }

  //   const previous_test_result = DB_response.previous_test_result

  /////////////////

  //   date_from_now = formatDistanceToNow(due_date)
  //   const allRecalled = forgottenOrIncorrectFacts.length === 0

  //   let chatStreamResponse
  //   let newStudyState: StudyState

  //   const mentor_system_message = getMentorSystemMessage(systemContext)

  //   if (allRecalled) {
  //     newStudyState =
  //       studyState === "recall_tutorial_first_attempt"
  //         ? "tutorial_hinting"
  //         : "recall_finished"

  //     chatStreamResponse = await streamText({
  //       model: defaultModel,
  //       temperature: 0.2,
  //       messages: convertToCoreMessages([
  //         {
  //           role: "system",
  //           content: `${mentor_system_message} Answer in a consistent style.`
  //         },
  //         {
  //           role: "user",
  //           content: `Generate upbeat feedback based on the students recall performance.
  // Topic study sheet:
  // """
  // ${studySheet}
  // """

  // Student recall:
  // """
  // ${studentMessage.content}
  // """

  // Inform the student of their recall score: ${recallScore}% and the next recall session date; ${date_from_now} from now, to ensure consistent study progress.
  // Finally, ask the student if they wish to revisit the topic's source material to enhance understanding or clarify any uncertainties.`
  //         }
  //       ])
  //     })
  //   } else {
  //     // score < 90
  //     chatStreamResponse = await streamText({
  //       model: defaultModel,
  //       temperature: 0.2,
  //       messages: convertToCoreMessages([
  //         {
  //           role: "system",
  //           content: `${mentor_system_message} Answer in a consistent style. Follow the following instructions:
  // 1. Provide positive and encouraging feedback to the student based on their recall attempt.
  // 2. Generate a list of hints for the list of forgotten facts below. Important: Do not provide answers to the forgotten facts, only hints and clues.
  // 3. Ask the student to try and provide answers to this list of hints.`
  //         },
  //         {
  //           role: "user",
  //           content: `
  // <TopicSource>
  // ${studySheet}
  // </TopicSource>
  // <StudentRecall>
  // ${studentMessage.content}
  // </StudentRecall>
  // <ForgottenFacts>
  // ${forgottenOrIncorrectFacts.join("\n")}
  // </ForgottenFacts>`
  //         }
  //       ])
  //     })

  //     newStudyState =
  //       studyState === "recall_tutorial_first_attempt"
  //         ? "tutorial_hinting"
  //         : "recall_hinting"
  //   }

  //   return chatStreamResponse.toDataStreamResponse({
  //     headers: {
  //       "NEW-STUDY-STATE": newStudyState,
  //       SCORE: recallScore.toString(),
  //       "DUE-DATE-FROM-NOW": date_from_now
  //       // Remove the line below as recallResponse is not defined
  //       // "FACTS-FEEDBACK": JSON.stringify(recallResponse.topic_facts)
  //     }
  //   })
}
