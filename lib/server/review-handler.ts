import { streamText, LanguageModel, convertToCoreMessages } from "ai"

export async function handleReview(
  defaultModel: LanguageModel,
  messages: any[],
  studentContext: string
) {
  const chatStreamResponse = await streamText({
    model: defaultModel,
    temperature: 0.5,
    messages: convertToCoreMessages([
      {
        role: "system",
        content: `Act as a study mentor, guiding student through active recall sessions. ${studentContext}`
      },
      ...messages
    ])
  })

  return chatStreamResponse.toDataStreamResponse()
}
