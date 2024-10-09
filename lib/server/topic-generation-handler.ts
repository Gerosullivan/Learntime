import { LanguageModel, streamText, convertToCoreMessages } from "ai"

export async function handleTopicGeneration(
  defaultModel: LanguageModel,
  messages: any[],
  systemContext: string
) {
  try {
    const chatStreamResponse = await streamText({
      model: defaultModel,
      temperature: 0.2,
      messages: convertToCoreMessages([
        {
          role: "system",
          content: `Objective: Create a detailed study sheet for a specified topic. 
The study sheet should be concise, informative, and well-organized to facilitate quick learning and retention. 
Important: if the user has provided source material, use it to generate the study sheet. Do not ignore the source material or expand on it.
Important: generate the study sheet text only. Do not generate additional text like summary, notes or additional text not in study sheet text.

Instructions:
    Introduction to the Topic:
        Provide a brief overview of the topic, including its significance and general context.
    Key Components or Concepts:
        List the key facts or components related to the topic. Each fact should be succinct and supported by one or two important details to aid understanding.

Formatting Instructions:
    Ensure the study sheet is clear and easy to read. Use bullet points for lists, bold headings for sections, and provide ample spacing for clarity.
    Do not generate additional text like summary, notes or additional text not in study sheet text.

${systemContext}
`
        },
        ...messages
      ])
    })

    return chatStreamResponse.toDataStreamResponse()
  } catch (error: any) {
    console.error("Error in handleTopicGeneration:", error)
    throw error // Re-throw the error to be caught in the main route
  }
}
