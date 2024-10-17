import { StudyState } from "@/lib/studyStates"
import { streamText, LanguageModel, convertToCoreMessages } from "ai"

export async function handleQuickQuizQuestion(context: {
  defaultModel: LanguageModel
  studySheet: string
  randomRecallFact: string
  systemContext: string
  nextStudyState: StudyState
}) {
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
${context.systemContext}`
      },
      {
        role: "user",
        content: `Given this topic study sheet as context:
<StudySheet>${context.studySheet}</StudySheet>
Generate a short answer quiz question based on the following fact the student previously got incorrect:
<Fact>${context.randomRecallFact}</Fact>
Important: Do not provide the answer when generating the question or mention the fact used to generate quiz question.`
      }
    ])
  })

  return chatStreamResponse.toDataStreamResponse({
    headers: {
      "NEW-STUDY-STATE": context.nextStudyState
    }
  })
}
