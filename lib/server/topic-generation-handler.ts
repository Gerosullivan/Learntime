import { LanguageModel, streamText, convertToCoreMessages } from "ai"
import { StudyState } from "@/lib/studyStates"

export async function handleTopicGeneration(context: {
  defaultModel: LanguageModel
  messages: any[]
  systemContext: string
  nextStudyState: StudyState
  pdfContent?: string
}) {
  try {
    const lastMessage = context.messages[context.messages.length - 1]
    const userMessage = context.pdfContent
      ? `Source Material:\n${context.pdfContent}\n\nUser Query:\n${lastMessage.content}`
      : lastMessage.content

    const messages = [
      ...context.messages.slice(0, -1),
      { ...lastMessage, content: userMessage }
    ]

    const chatStreamResponse = await streamText({
      model: context.defaultModel,
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

${context.systemContext}
`
        },
        ...messages
      ])
    })

    return chatStreamResponse.toDataStreamResponse({
      headers: {
        "NEW-STUDY-STATE": context.nextStudyState
      }
    })
  } catch (error: any) {
    console.error("Error in handleTopicGeneration:", error)
    throw error
  }
}
