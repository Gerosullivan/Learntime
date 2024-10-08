import { z } from "zod"

export const scoringSchema = z.object({
  forgotten_facts: z
    .array(z.string())
    .describe(
      "An array of strings, each summarizing a key fact or concept omitted from the student's recall when compared to the original topic study sheet. If the students recalled all facts correctly, provide an empty array."
    ),

  score: z
    .number()
    .describe(
      "A numerical value between 0 and 100 indicating the recall accuracy."
    ),

  scoring_breakdown: z.object({
    total_facts: z
      .number()
      .int()
      .describe("Total number of key facts in the topic source"),
    recalled_facts: z
      .number()
      .int()
      .describe("Number of facts correctly recalled by the student"),
    calculation: z
      .string()
      .describe(
        'A string showing the calculation, e.g., "(7 / 10) * 100 = 70%"'
      )
  }),

  confidence: z
    .number()
    .describe(
      "A numerical value between 0 and 1 indicating the model's confidence in its assessment"
    )
})

export const getScoringSystemMessage = () => `
You are a study mentor. You assess student recall performance and list incorrect or missed facts. Given the Topic source and a Student's recall attempt below (delimited with XML tags), perform the following tasks:

1. Carefully read the Topic source and Student's recall attempt.
2. Create a list of key facts or concepts from the Topic source.
3. Compare each key fact or concept with the Student's recall:
   a. Mark as "recalled" if present and correct.
   b. Mark as "forgotten" if missing or incorrect.
4. Calculate the score:
   a. Count the total number of key facts/concepts.
   b. Count the number of "recalled" items.
   c. Calculate the percentage: (recalled items / total items) * 100.
5. Compile the list of forgotten facts.
6. Assess your confidence in the evaluation (0 to 1).
7. Double-check your calculations and lists for accuracy.
8. Provide the output in the requested JSON format.

Explain your reasoning for each step, especially when determining if a fact was recalled or forgotten.

Provide the following fields in a JSON dict:
{
  "forgotten_facts": [
    // An array of strings, each summarizing a key fact or concept omitted from the student's recall when compared to the original topic study sheet. If the students recalled all facts correctly, provide an empty array.
  ],
  "score": 0, // A numerical value between 0 and 100 indicating the recall accuracy.
  "scoring_breakdown": {
    "total_facts": 0, // Total number of key facts in the topic source
    "recalled_facts": 0, // Number of facts correctly recalled by the student
    "calculation": "" // A string showing the calculation, e.g., "(7 / 10) * 100 = 70%"
  },
  "confidence": 0 // A numerical value between 0 and 1 indicating the model's confidence in its assessment
}

Ensure that the scoring_breakdown matches the final score.
`

export type ScoringSchema = z.infer<typeof scoringSchema>
