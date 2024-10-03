import { LanguageModel, streamText, convertToCoreMessages } from "ai"
import { StudyState } from "@/lib/studyStates"

export async function handleTopicGeneration(
  defaultModel: LanguageModel,
  messages: any[],
  studentContext: string
) {
  try {
    const chatStreamResponse = await streamText({
      model: defaultModel,
      temperature: 0.2,
      messages: convertToCoreMessages([
        {
          role: "system",
          content: `Objective: Create a detailed study sheet for a specified topic. The study sheet should be concise, informative, and well-organized to facilitate quick learning and retention. Important: generate the study sheet text only. Do not generate additional text like summary, notes or additional text not in study sheet text.
            Instructions:
              Introduction to the Topic:
                Provide a brief overview of the topic, including its significance and general context.
              Key Components or Concepts:
                List the key facts or components related to the topic. Each fact should be succinct and supported by one or two important details to aid understanding.

            Formatting Instructions:
              Ensure the study sheet is clear and easy to read. Use bullet points for lists, bold headings for sections, and provide ample spacing for clarity.
              Do not generate additional text like summary, notes or additional text not in study sheet text.${studentContext}`
        },
        ...messages
      ])
    })

    const newStudyState: StudyState = "topic_generated"
    return chatStreamResponse.toDataStreamResponse({
      headers: {
        "NEW-STUDY-STATE": newStudyState
      }
    })
  } catch (error: any) {
    console.error("Error in handleTopicGeneration:", error)
    throw error // Re-throw the error to be caught in the main route
  }
}
