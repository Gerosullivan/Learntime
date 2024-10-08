import { LanguageModel, streamText, convertToCoreMessages } from "ai"

export async function handleRecallShowHints(
  defaultModel: LanguageModel,
  studySheet: string,
  chatRecallInfo: any,
  systemContext: string
) {
  const forgottenFacts = JSON.parse(chatRecallInfo.forgottenFacts || "[]")

  const chatStreamResponse = await streamText({
    model: defaultModel,
    messages: convertToCoreMessages([
      {
        role: "system",
        content: `You are helpful, friendly study mentor. 
  ${systemContext}
  You are a helpful, friendly study mentor.
${systemContext}

CRITICAL INSTRUCTION: NEVER PROVIDE ANSWERS TO FORGOTTEN FACTS. ONLY GIVE HINTS AND CLUES.

Your task is to generate hints for forgotten facts without revealing answers. Follow these strict guidelines:

1. Provide only hints and clues that guide the student towards recalling the information.
2. NEVER give away the actual answer or any part of it.
3. Use general terms, analogies, or related concepts to create hints.
4. If you catch yourself about to reveal an answer, STOP and rephrase as a hint.

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
${studySheet}
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

Remember: Your goal is to help the student remember on their own, not to provide the information directly.`
      }
    ])
  })

  return chatStreamResponse.toDataStreamResponse({
    headers: {
      "NEW-STUDY-STATE": "recall_answer_hints"
    }
  })
}
