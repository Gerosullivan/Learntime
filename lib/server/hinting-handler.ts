import { StudyState } from "@/lib/studyStates"
import { streamText, LanguageModel, convertToCoreMessages } from "ai"
import { formatDistanceToNow } from "date-fns/esm"

export async function handleHinting(
  hintingModel: LanguageModel,
  messages: any[],
  nextStudyState: StudyState,
  studySheet: string,
  chatRecallInfo: any,
  systemContext: string
) {
  const dueDateFromNow = formatDistanceToNow(new Date(chatRecallInfo.due_date))
  const chatStreamResponse = await streamText({
    model: hintingModel,
    temperature: 0.3,
    messages: convertToCoreMessages([
      {
        role: "system",
        content: `${systemContext}
When constructing feedback for a student's attempt at answering hints on a recall test, follow these guidelines:

Use this topic source only when providing feedback:
  <StudySheet>
  ${studySheet}.
  <StudySheet>

Your response should follow this exact structure:
1. Positive reinforcement
2. Highlight of correct answers
3. Address of incorrect answers
4. Additional information
5. Encouragement for continued effort
6. Next steps and scheduling;   Inform the student about their next recall session based on this due date: ${dueDateFromNow}.
  Provide a specific timeframe for the next session.
  Use calendar emoji for visual reinforcement.
  Example: "Your next recall session is due in {{dueDateFromNow}}. 📅"
7. Study recommendations
8. Focus areas
9. Future outlook

IMPORTANT: Do not include any meta-commentary about your response or offer additional assistance. Your response should only contain the feedback for the student as instructed above.

After providing the feedback as structured above, end your response immediately. Do not add any concluding remarks or offers for further assistance`
      },
      ...messages
    ])
  })

  return chatStreamResponse.toDataStreamResponse({
    headers: {
      "NEW-STUDY-STATE": nextStudyState
    }
  })
}
