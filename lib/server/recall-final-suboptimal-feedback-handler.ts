import { LanguageModel, streamText, convertToCoreMessages } from "ai"
import { StudyState } from "@/lib/studyStates"

export async function handleRecallFinalSuboptimalFeedback(
  defaultModel: LanguageModel,
  messages: any[],
  studyState: StudyState,
  studySheet: string,
  chatRecallMetadata: any,
  systemContext: string
) {
  const chatStreamResponse = await streamText({
    model: defaultModel,
    messages: convertToCoreMessages([
      {
        role: "system",
        content: `You are a friendly study mentor. ${systemContext}`
      },
      ...messages,
      {
        role: "user",
        content: `Generate a final message to the student.
1. Compare their attempt to the study sheet: ${studySheet} 
2. Advice them on the next recall due date from now: ${chatRecallMetadata.dueDateFromNow}. Use calendar emoji for visual reinforcement. Example: "Your next recall session is due in {{dueDateFromNow}}. 📅"
Recommend the student that they should review the topic study sheet now to improve their recall.
Don't finish with a final summary or wrap up message. Don't suggest they can ask you questions.`
      }
    ])
  })

  return chatStreamResponse.toDataStreamResponse({
    headers: {
      "NEW-STUDY-STATE": "recall_finished"
    }
  })
}
