import { z } from "zod"

export const recallResponseSchema = z.object({
  topic_facts: z
    .array(
      z.object({
        fact: z
          .string()
          .describe(
            "Description of the fact from the topic source, including context."
          ),
        recall: z
          .enum(["correct", "partial", "incorrect", "none"])
          .describe("Status of the student's recall of this fact."),
        feedback: z
          .string()
          .nullable()
          .describe(
            "Feedback as to how the student was incorrect in recalling this fact."
          )
      })
    )
    .describe("A list of all the facts from the topic source."),
  overall_feedback: z
    .string()
    .describe(
      "General feedback on the student's recall performance without revealing correct answers."
    )
})

export type RecallResponse = z.infer<typeof recallResponseSchema>

// given list of topic_facts generate feedback for each facts as a list
// in the format of [emoji] fact.fact
// - fact.feedback (if present)
export function generateFeedbackList(
  topic_facts: RecallResponse["topic_facts"]
): string {
  return topic_facts
    .map(fact => {
      let emoji: string
      if (fact.recall === "correct") {
        emoji = "✅"
      } else if (fact.recall === "incorrect" || fact.recall === "none") {
        emoji = "❌"
      } else {
        emoji = "⚠️"
      }
      let feedback = fact.feedback ? `\n  -${fact.feedback}` : ""
      return `* ${fact.fact} ${emoji} ${feedback}\n`
    })
    .join("")
}
