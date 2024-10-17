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
        When providing feedback on a student's recall attempt, use only the information from this topic source:
        
        <StudySheet>
        ${studySheet}
        </StudySheet>

        Respond in a conversational tone, as if you're chatting with a friend. Avoid sounding like a teacher giving formal feedback. Instead of using a structured format, blend your feedback into a natural conversation. Here are some points to cover in your response:

        - Start with a friendly, encouraging comment about their effort.
        - Mention what they got right, but do it casually.
        - If they missed anything, bring it up gently without making a big deal of it.
        - Add a bit of extra info if it's relevant, but keep it light.
        - Throw in some encouragement for their next study session.
        - Let them know when their next recall is due, like this: "By the way, your next recall is coming up in ${dueDateFromNow}. 📅"
        - Suggest a quick study tip if you think it'll help.

        Keep your tone upbeat and supportive throughout. Wrap up your response naturally, as if you're ending a chat with a friend. Don't offer additional help or add any closing remarks – just end it when you've covered these points.`
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
