import { LanguageModel, streamText, convertToCoreMessages } from "ai"
import { StudyState } from "@/lib/studyStates"

export async function handleRecallShowHints(context: {
  defaultModel: LanguageModel
  studySheet: string
  chatRecallInfo: any
  systemContext: string
  nextStudyState: StudyState
}) {
  const forgottenFacts = JSON.parse(
    context.chatRecallInfo.forgottenFacts || "[]"
  )

  const chatStreamResponse = await streamText({
    model: context.defaultModel,
    messages: convertToCoreMessages([
      {
        role: "system",
        content: `You are helpful, friendly study mentor. 
${context.systemContext}

CRITICAL INSTRUCTION: NEVER PROVIDE ANSWERS TO FORGOTTEN FACTS. ONLY GIVE HINTS AND CLUES.

Your task is to generate hints for forgotten facts without revealing answers. Follow these strict guidelines:

1. Provide only hints and clues that guide the student towards recalling the information.
2. NEVER give away the actual answer or any part of it.
3. Use general terms, analogies, or related concepts to create hints.
4. If you catch yourself about to reveal an answer, STOP and rephrase as a hint.
5. Conclude with a directive for the student to attempt answering the hints before moving on.

Examples of good hints:
- For a historical date: "This event occurred in the same decade as [another well-known event]."
- For a scientific term: "This concept is related to [broader scientific field] and often involves [general process]."

Examples of what NOT to do (never do this):
- Directly stating the answer: "The capital of France is Paris."
- Giving away part of the answer: "The first two letters of the answer are 'Pa'."

Output Format:
For each forgotten fact, provide a hint in this format:
Hint #[number]: [Your hint here]

Now, generate a list of hints for the forgotten facts below. Remember: Do not provide answers, only hints and clues.`
      },
      {
        role: "user",
        content: `
<TopicSource>
${context.studySheet}
</TopicSource>

<ForgottenFacts>
${forgottenFacts.map((fact: string, index: number) => `${index + 1}. ${fact}`).join("\n")}
</ForgottenFacts>

Instructions for generating hints:
1. Carefully review each forgotten fact.
2. For each fact, create a hint that guides the student towards recall without revealing the answer.
3. Ensure your hints are challenging but fair, encouraging critical thinking.
4. Double-check that your hints do not contain any part of the actual answer.
5. Present your hints in the following format:

Hint #1: [Your hint for forgotten fact 1]
Hint #2: [Your hint for forgotten fact 2]
...

6. After providing all hints, conclude with a paragraph instructing the student to attempt answering the hints before moving on. Do not use encouraging or cheery language in this conclusion.`
      }
    ])
  })

  return chatStreamResponse.toDataStreamResponse({
    headers: {
      "NEW-STUDY-STATE": context.nextStudyState
    }
  })
}
