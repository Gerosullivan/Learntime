import { LanguageModel, streamText, convertToCoreMessages } from "ai"
import { StudyState } from "@/lib/studyStates"

export async function handleRecallShowHints(
  defaultModel: LanguageModel,
  studentMessage: any,
  studyState: StudyState,
  studySheet: string,
  chatRecallMetadata: any,
  systemContext: string
) {
  const forgottenFacts = JSON.parse(chatRecallMetadata.forgottenFacts || "[]")

  const chatStreamResponse = await streamText({
    model: defaultModel,
    messages: convertToCoreMessages([
      {
        role: "system",
        content: `You are helpful, friendly study mentor. 
  ${systemContext}
  IMPORTANT: When generating Corrections do not provide answers (additions) to ommited or forgotten facts. 
  When generating Hints for Forgotten facts, provide hints and clues without giving away answers.
  Answer in a consistent style. 
  Follow the following instructions:
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
${forgottenFacts.map((fact: string, index: number) => `${index + 1}. ${fact}`).join("\n")}
</ForgottenFacts>`
      }
    ])
  })

  return chatStreamResponse.toDataStreamResponse({
    headers: {
      "NEW-STUDY-STATE": "recall_answer_hints"
    }
  })
}
