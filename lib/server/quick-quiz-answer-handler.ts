import { StudyState } from "@/lib/studyStates"
import { streamText, LanguageModel, convertToCoreMessages } from "ai"

export async function handleQuickQuizAnswer(context: {
  defaultModel: LanguageModel
  messages: any[]
  nextStudyState: StudyState
  studySheet: string
  systemContext: string
  studyState: StudyState
}) {
  const noMoreQuizQuestions = context.studyState === "quick_quiz_finished"
  const studentMessage = context.messages[context.messages.length - 1].content
  const previousQuizQuestion =
    context.messages[context.messages.length - 2].content
  const finalFeedback = noMoreQuizQuestions
    ? "Finally advise the student there are no more quiz questions available. Come back again another time."
    : ""

  const chatStreamResponse = await streamText({
    model: context.defaultModel,
    temperature: 0.3,
    messages: convertToCoreMessages([
      {
        role: "system",
        content: `You are helpful, friendly quiz master. 
Generate short answer quiz questions based on a provided fact. 
Never give the answer to the question when generating the question text. 
Do not state which step of the instructions you are on.
Always provide the answer when giving feedback to the student. 
If the student answers "I don't know.", just give the answer.
${context.systemContext}`
      },
      {
        role: "user",
        content: `Provide feedback and answer to the following quiz question:
          """${previousQuizQuestion}"""
          Based on the following student response:
          """${studentMessage}"""
          Given this topic study sheet as context:
          """${context.studySheet}"""
          ${finalFeedback}
          `
      }
    ])
  })

  return chatStreamResponse.toDataStreamResponse({
    headers: {
      "NEW-STUDY-STATE": context.nextStudyState
    }
  })
}
