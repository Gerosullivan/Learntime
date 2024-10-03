import { StudyState } from "@/lib/studyStates"
import { streamText, LanguageModel, convertToCoreMessages } from "ai"

export async function handleQuickQuizQuestion(
  defaultModel: LanguageModel,
  studySheet: string,
  randomRecallFact: string,
  studentContext: string
) {
  const quickQuizSystemMessage = `You are helpful, friendly quiz master. Generate short answer quiz questions based on a provided fact. Never give the answer to the question when generating the question text. Do not state which step of the instructions you are on.${studentContext}`

  const chatStreamResponse = await streamText({
    model: defaultModel,
    temperature: 0.3,
    messages: convertToCoreMessages([
      {
        role: "system",
        content: quickQuizSystemMessage
      },
      {
        role: "user",
        content: `Given this topic study sheet as context:
          """${studySheet}"""
          Generate a short answer quiz question based on the following fact the student previously got incorrect:
            """${randomRecallFact}"""
            Important: Do not provide the answer when generating the question or mention the fact used to generate quiz question.`
      }
    ])
  })

  const newStudyState: StudyState = "quick_quiz_user_answer"

  return chatStreamResponse.toDataStreamResponse({
    headers: {
      "NEW-STUDY-STATE": newStudyState
    }
  })
}
