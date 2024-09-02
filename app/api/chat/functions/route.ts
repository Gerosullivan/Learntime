import {
  ChatRecallMetadata,
  StudyState,
  getQuickResponseByUserText
} from "@/lib/studyStates"
import {
  checkApiKey,
  getServerProfile,
  functionCalledByLLM
} from "@/lib/server/server-chat-helpers"
import { streamText, LanguageModel } from "ai"
import { formatDistanceToNow } from "date-fns/esm"
import { openai, fireworks } from "../registry"
import { generateObject } from "ai"
import {
  generateFeedbackList,
  RecallResponse,
  recallResponseSchema
} from "./recall_schema"

// export const runtime = "edge"
export const dynamic = "force-dynamic"
export const maxDuration = 180

const callLLM = async (
  chatId: string,
  studySheet: string,
  messages: any[],
  studyState: StudyState,
  studentMessage: { content: string; role: string },
  chatRecallMetadata: ChatRecallMetadata,
  randomRecallFact: string,
  noMoreQuizQuestions: boolean,
  profile_context: string
) => {
  let chatStreamResponse
  let newStudyState: StudyState

  const studentContext =
    profile_context.length > 0
      ? `Here is how the student would like you to respond:
    """${profile_context}"""`
      : ""
  const mentor_system_message = `You are helpful, friendly study mentor. 
  ${studentContext}
  IMPORTANT: When generating Corrections do not provide answers (additions) to ommited or forgotten facts. 
  When generating Hints for Forgotten facts, provide hints and clues without giving away answers.`

  const finalFeedback = `Finally, ask the student if they wish to revisit the topic's source material to enhance understanding or clarify any uncertainties.`
  const mentor_shot_hint_response = `
  Think about how long a day on Venus is compared to its year. It's quite a unique aspect of the planet. Can you remember which one is longer?
  There's an interesting point about the past state of Venus related to water. What do you think Venus might have looked like a billion years ago?
  Take a moment to think about these hints and see if you can recall more about those specific points. You’re doing wonderfully so far, and digging a bit deeper will help solidify your understanding even more!`
  const quickQuizSystemMessage = `You are helpful, friendly quiz master. Generate short answer quiz questions based on a provided fact. Never give the answer to the question when generating the question text. Do not state which step of the instuctions you are on.${studentContext}`

  let factsFeedback: RecallResponse["topic_facts"]
  try {
    const scoringModel = fireworks(
      "accounts/fireworks/models/llama-v3p1-70b-instruct"
    ) as LanguageModel

    // const defaultModel: LanguageModel = google(
    //   "models/gemini-1.5-flash-latest"
    // ) as LanguageModel

    const defaultModel = openai("gpt-4o-mini") as LanguageModel

    const hintingModel = defaultModel

    // const defaultModel = registry.languageModel(
    //   "deepinfra:meta-llama/Meta-Llama-3.1-70B-Instruct"
    // )

    switch (studyState) {
      case "topic_describe_upload":
      case "topic_generated":
        chatStreamResponse = await streamText({
          model: defaultModel,
          temperature: 0.2,
          messages: [
            {
              role: "system",
              content: `Objective: Create a detailed study sheet for a specified topic. The study sheet should be concise, informative, and well-organized to facilitate quick learning and retention. Important: generate the study sheet text only. Do not generate additional text like summary, notes or additional text not in study sheet text.
              Instructions:
                Introduction to the Topic:
                  Provide a brief overview of the topic, including its significance and general context.
                Key Components or Concepts:
                  List 10 to 30 key facts or components related to the topic. Each fact should be succinct and supported by one or two important details to aid understanding.
                Structure and Organization:
                  Group related facts into categories or themes to maintain logical coherence and enhance navigability.
  
              Formatting Instructions:
                Ensure the study sheet is clear and easy to read. Use bullet points for lists, bold headings for sections, and provide ample spacing for clarity.
                Do not generate additional text like summary, notes or additional text not in study sheet text.${studentContext}`
            },
            ...messages
          ]
        })

        newStudyState = "topic_generated"
        return chatStreamResponse.toTextStreamResponse({
          headers: {
            "NEW-STUDY-STATE": newStudyState
          }
        })

      case "recall_tutorial_first_attempt":
      case "recall_first_attempt":
        // GET FORGOTTEN FACTS AND SCORE AND SAVE TO DB ///////////////////////////////

        let date_from_now = ""
        let recallScore = 0
        let forgottenOrIncorrectFacts: string[] = []

        const result = await generateObject({
          model: openai("gpt-4o-mini", {
            structuredOutputs: true
          }),
          schemaName: "recall_response",
          schemaDescription: "Assessing student recall.",
          schema: recallResponseSchema,
          messages: [
            {
              role: "system",
              content: `
You are a study mentor tasked with assessing a student's recall performance. Your responsibilities include:

1. Listing each fact from the provided topic study sheet.
2. Determining whether the student recalled each fact correctly, partially, incorrectly, or not at all.
3. Providing specific feedback on how the student was incorrect without revealing the correct facts or giving hints.
4. Offering overall feedback on the student's recall performance, focusing on areas of strength and opportunities for improvement.

Important: Only compare the student's recall attempt against the provided topic study sheet. Avoid providing correct answers or spoilers in your feedback. Your analysis should focus on the accuracy and completeness of the student's recall based on this sheet.              
              `
            },
            {
              role: "user",
              content: `
<TopicSource>
${studySheet}
</TopicSource>
<StudentRecall>
${studentMessage.content}
</StudentRecall>              
              `
            }
          ]
        })

        const recallResponse: RecallResponse = result.object
        // calculate score based on correct (1), partial (0.5), incorrect (0), none (0)
        const recallPoints = recallResponse.topic_facts.reduce(
          (acc, fact) =>
            fact.recall === "correct"
              ? acc + 1
              : fact.recall === "partial"
                ? acc + 0.5
                : acc,
          0
        )
        // convert recall score to percentage and round to the nearest whole number
        recallScore = Math.round(
          (recallPoints / recallResponse.topic_facts.length) * 100
        )

        forgottenOrIncorrectFacts = recallResponse.topic_facts
          .filter(fact => fact.recall === "incorrect" || fact.recall === "none")
          .map(fact => fact.fact)

        const functionResponse = await functionCalledByLLM(
          "updateTopicOnRecall",
          {
            test_result: recallScore,
            recall_analysis: JSON.stringify(forgottenOrIncorrectFacts)
          },
          chatId
        )

        const { due_date } = functionResponse
        date_from_now = formatDistanceToNow(due_date)
        const allRecalled = forgottenOrIncorrectFacts.length === 0
        let finalMessage = ""

        if (allRecalled) {
          const feedbackFactList = generateFeedbackList(
            recallResponse.topic_facts
          )
          finalMessage = `
${recallResponse.overall_feedback}

## Recall Score: ${recallScore}%

## Next review: ${date_from_now}  

${feedbackFactList}
`
          newStudyState =
            studyState === "recall_tutorial_first_attempt"
              ? "tutorial_hinting_hide_input"
              : "recall_finished_hide_input"

          return new Response(finalMessage, {
            status: 200,
            headers: {
              "NEW-STUDY-STATE": newStudyState
            }
          })
        } else {
          finalMessage = `
${recallResponse.overall_feedback}

Would you like to see hints for the forgotten facts or just the final feedback for this session?`

          newStudyState =
            studyState === "recall_tutorial_first_attempt"
              ? "tutorial_recall_show_hint_or_feedback_hide_input"
              : "recall_show_hint_or_feedback_hide_input"

          return new Response(finalMessage, {
            status: 200,
            headers: {
              "NEW-STUDY-STATE": newStudyState,
              SCORE: recallScore.toString(),
              "DUE-DATE-FROM-NOW": date_from_now,
              "FACTS-FEEDBACK": JSON.stringify(recallResponse.topic_facts)
            }
          })
        }
      case "recall_tutorial_final_feedback":
      case "recall_final_feedback":
      case "recall_show_hint_or_feedback_hide_input":
        //  PROVIDE Final feedback  ////////////////////
        factsFeedback = chatRecallMetadata.factsFeedback
        const feedbackFactList = generateFeedbackList(factsFeedback)

        newStudyState =
          studyState === "recall_tutorial_final_feedback"
            ? "tutorial_final_stage_hide_input"
            : "recall_finished_hide_input"

        return new Response(
          `${feedbackFactList}
## Recall Score: ${chatRecallMetadata?.score}
  
## Next review: ${chatRecallMetadata?.dueDateFromNow}
`,
          {
            status: 200,
            headers: {
              "NEW-STUDY-STATE": newStudyState
            }
          }
        )

      case "recall_tutorial_generate_hints":
      case "recall_generate_hints":
        // Generate HINTS  ////////////////////
        factsFeedback = chatRecallMetadata.factsFeedback
        const forgottenFacts = factsFeedback
          .filter(fact => fact.recall === "none")
          .map(fact => fact.fact)
        chatStreamResponse = await streamText({
          model: hintingModel,
          temperature: 0.3,
          messages: [
            {
              role: "system",
              content: `${mentor_system_message}
                    Use this topic study sheet only when responding to the student ${studySheet}`
            },
            {
              role: "user",
              content: `Generate hints for the following forgotten facts: 
              ${forgottenFacts.join("\n")}`
            }
          ]
        })

        newStudyState =
          studyState === "recall_tutorial_generate_hints"
            ? "recall_tutorial_hinting"
            : "recall_hinting"

        return chatStreamResponse.toTextStreamResponse({
          headers: {
            "NEW-STUDY-STATE": newStudyState
          }
        })

      case "recall_tutorial_hinting":
      case "recall_hinting":
        // PROVIDE ANSWER TO HINTS  ////////////////////
        let mentorHintsMessage: { content: string; role: string } =
          messages.slice(-2, -1)[0]
        studentMessage

        if (studyState === "recall_tutorial_hinting") {
          mentorHintsMessage = messages.slice(-4, -3)[0]
        }

        chatStreamResponse = await streamText({
          model: hintingModel,
          temperature: 0.3,
          messages: [
            {
              role: "system",
              content: `${mentor_system_message}
              Use this topic study sheet only when responding to the student ${studySheet}`
            },
            {
              role: "user",
              content: `
              Mentor hint response:
              """
              ${mentor_shot_hint_response}
              """
  
              Student answer to hints:
              """
              Venus has a day that's longer than its year because of its slow rotation, right? As for Venus a long time ago, I think it used to be completely dry and desert-like, without any oceans or water.
              """
  
              Pre-hint Score:
              """
              50%
              """
  
              Next review:
              """
              2 days time
              """
  
              Mentor:
              """
              Great effort! 🌟 You got the first part right; indeed, Venus has a day that is longer than its year due to its incredibly slow rotation. That's an interesting fact not many remember! 🕒
  
              However, about Venus's past, it was actually thought to have been a habitable ocean world similar to Earth, not a dry desert. Scientists believe it may have had large amounts of surface water which later disappeared due to a runaway greenhouse effect. 🌊➡️🔥
  
              You're doing well with a 50% correct recall before we went through the hints. Keep it up!
  
              Your next recall session is due in 2 days. 📅 Review the topic study sheet now to help reinforce and expand your memory on Venus. 📚
  
              Take some time to go over the details, especially the parts about Venus's past climate and its atmospheric composition. This will set us up perfectly for enhancing your understanding in our upcoming session.
              """
  
              ---
              Mentor hint response:
              """
              ${mentorHintsMessage.content}
              """
  
              Student answer to hints:
              """
              ${studentMessage.content}
              """
  
              Pre-hint Score:
              """
              ${chatRecallMetadata?.score}
              """
  
              Next review:
              """
              ${chatRecallMetadata?.dueDateFromNow}
              """
  
              Mentor:
              `
            }
          ]
        })

        newStudyState =
          studyState === "recall_tutorial_hinting"
            ? "tutorial_final_stage_hide_input"
            : "recall_finished_hide_input"

        return chatStreamResponse.toTextStreamResponse({
          headers: {
            "NEW-STUDY-STATE": newStudyState
          }
        })

      case "recall_finished_hide_input":
      case "reviewing":
        // SHOW FULL study sheet ///////////////////////////////

        chatStreamResponse = await streamText({
          model: defaultModel,
          temperature: 0.5,
          messages: [
            {
              role: "system",
              content: `Act as a study mentor, guiding student through active recall sessions. ${studentContext}`
            },
            ...messages
          ]
        })

        return chatStreamResponse.toTextStreamResponse()
      case "quick_quiz_ready_hide_input":
        chatStreamResponse = await streamText({
          model: defaultModel,
          temperature: 0.3,
          messages: [
            {
              role: "system",
              content: quickQuizSystemMessage
            },
            {
              role: "user",
              content: `Given this topic study sheet as context:
              """${studySheet}"""
              Generate a short answer quiz question based on the following fact the student previously got incorrect:
                """${randomRecallFact}"""
                Important: Do not provide the answer when generating the question or mention the fact used to generate quiz question.`
            }
          ]
        })
        newStudyState = "quick_quiz_answer"
        return chatStreamResponse.toTextStreamResponse({
          headers: {
            "NEW-STUDY-STATE": newStudyState
          }
        })
      case "quick_quiz_answer":
      case "quick_quiz_finished_hide_input":
        const previousQuizQuestion = messages[messages.length - 2].content
        const finalFeeback = noMoreQuizQuestions
          ? "Finally advise the student there are no more quiz questions available. Come back again another time."
          : ""

        chatStreamResponse = await streamText({
          model: defaultModel,
          temperature: 0.3,
          messages: [
            {
              role: "system",
              content: `${quickQuizSystemMessage}.  Always provide the answer when giving feedback to the student. If the students answers "I don't know.", just give the answer.`
            },
            {
              role: "user",
              content: `Provide feedback and answer to the following quiz question:
              """${previousQuizQuestion}"""
              Based on the following student response:
              """${studentMessage.content}"""
              Given this topic study sheet as context:
              """${studySheet}"""
              ${finalFeeback}
              `
            }
          ]
        })
        newStudyState =
          studyState === "quick_quiz_finished_hide_input"
            ? "quick_quiz_finished_hide_input"
            : "quick_quiz_ready_hide_input"
        return chatStreamResponse.toTextStreamResponse({
          headers: {
            "NEW-STUDY-STATE": newStudyState
          }
        })

      default:
        // Handle other states or error
        throw new Error("Invalid study state")
    }
  } catch (error: any) {
    console.error(error)
    throw new Error(error.message)
  }
}

export async function POST(request: Request) {
  try {
    const profile = await getServerProfile()
    checkApiKey(profile.deepinfra_api_key, "Deep infra")
    checkApiKey(profile.openai_api_key, "OpenAI")

    const json = await request.json()
    const {
      messages,
      chatId,
      studyState,
      studySheet,
      chatRecallMetadata,
      randomRecallFact,
      profile_context
    } = json

    const studentMessage = messages[messages.length - 1]

    const quickResponse = getQuickResponseByUserText(studentMessage.content)
    if (quickResponse && quickResponse.responseText !== "{{LLM}}") {
      let responseText
      let newStudyState: StudyState = quickResponse.newStudyState

      switch (quickResponse.responseText) {
        case "{{DB}}":
          // for now assume its a topic update
          const topicContent = messages[messages.length - 2].content
          const functionResponse = await functionCalledByLLM(
            "updateTopicContent",
            { content: topicContent },
            chatId
          )
          if (functionResponse.success === false) {
            responseText = "Server error saving topic content."

            newStudyState = "topic_describe_upload"
            return new Response(responseText, {
              status: 500,
              headers: {
                "NEW-STUDY-STATE": newStudyState
              }
            })
          } else {
            responseText = "Save successful."
          }
          break
        case "{{topicDescription}}":
          responseText = studySheet
          break
        default:
          responseText = quickResponse.responseText
          break
      }

      return new Response(responseText, {
        status: 200,
        headers: {
          "NEW-STUDY-STATE": newStudyState
        }
      })
    }

    const noMoreQuizQuestions = studyState === "quick_quiz_finished_hide_input"
    // return new Response("hello", {
    //   status: 200
    // })

    const response = await callLLM(
      chatId,
      studySheet,
      messages,
      studyState,
      studentMessage,
      chatRecallMetadata,
      randomRecallFact,
      noMoreQuizQuestions,
      profile_context
    )

    return response
  } catch (error: any) {
    console.error(error)
    const errorMessage = error.message || "An unexpected error occurred"
    const errorCode = error.status || 500
    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
