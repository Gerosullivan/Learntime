import { streamText, LanguageModel, convertToCoreMessages } from "ai"

export async function handleReview(context: {
  defaultModel: LanguageModel
  messages: any[]
  systemContext: string
}) {
  const chatStreamResponse = await streamText({
    model: context.defaultModel,
    temperature: 0.5,
    messages: convertToCoreMessages([
      {
        role: "system",
        content: `Act as a study mentor, guiding student through active recall sessions. ${context.systemContext}`
      },
      ...context.messages
    ])
  })

  return chatStreamResponse.toDataStreamResponse()
}
