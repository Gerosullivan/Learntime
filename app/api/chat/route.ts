import { StudyState } from "@/lib/studyStates"
import { updateTopicOnRecall } from "@/lib/server/server-chat-helpers"
import {
  streamText,
  LanguageModel,
  generateText,
  convertToCoreMessages
} from "ai"
import { formatDistanceToNow } from "date-fns/esm"
import { openai } from "./registry"
import { handleTopicGeneration } from "@/lib/server/topic-generation-handler"

// export const runtime = "edge"
export const dynamic = "force-dynamic"
export const maxDuration = 180

export async function POST(request: Request) {
  try {
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

    const noMoreQuizQuestions = studyState === "quick_quiz_finished"

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
    Take a moment to think about these hints and see if you can recall more about those specific points. You're doing wonderfully so far, and digging a bit deeper will help solidify your understanding even more!`
    const quickQuizSystemMessage = `You are helpful, friendly quiz master. Generate short answer quiz questions based on a provided fact. Never give the answer to the question when generating the question text. Do not state which step of the instuctions you are on.${studentContext}`

    const defaultModel = openai("gpt-4o-mini") as LanguageModel
    const scoringModel = defaultModel
    const hintingModel = defaultModel

    switch (studyState) {
      case "topic_name_saved":
      case "topic_auto_generate":
      case "topic_describe_upload":
      case "topic_no_description_in_db":
        return await handleTopicGeneration(
          defaultModel,
          messages,
          studentContext
        )

      case "recall_tutorial_first_attempt":
      case "recall_first_attempt":
        // GET FORGOTTEN FACTS AND SCORE AND SAVE TO DB ///////////////////////////////

        let date_from_now = ""
        let recallScore = 0
        let forgottenOrIncorrectFacts: string[] = []

        let content = `
  <TopicSource>
  ${studySheet}
  </TopicSource>
  <StudentRecall>
  ${studentMessage.content}
  </StudentRecall>              
                `

        const { text } = await generateText({
          model: scoringModel,
          messages: convertToCoreMessages([
            {
              role: "system",
              content:
                "You are a study mentor. You assess student recall performance and list incorrect or missed facts. Given the Topic source and a Student's recall attempt below  (delimited with XML tags), perform the following tasks: 1. Identify any significant omissions in the student's recall when compared against the Topic study sheet below. List these omissions as succinctly as possible, providing clear and educational summaries for review. 2. Calculate a recall score representing how accurately the student's recall matches the Topic study sheet only. Important: Only compare against the Topic study sheet below. The score should reflect the percentage of the material correctly recalled, ranging from 0 (no recall) to 100 (perfect recall). Provide the following fields in a JSON dict, \"forgotten_facts\" (An array of strings, each summarizing a key fact or concept omitted from the student's recall when compared to the original topic study sheet. If the students recalled all facts correctly, provide an empty array.), \"score\" (A numerical value between 0 and 100 indicating the recall accuracy.)"
            },
            {
              role: "user",
              content
            }
          ])
        })

        // extract recall score and forgotten facts from content response
        const recallResponse = JSON.parse(text)
        recallScore = recallResponse.score

        forgottenOrIncorrectFacts = recallResponse.forgotten_facts

        const DB_response = await updateTopicOnRecall(
          chatId,
          recallScore,
          JSON.stringify(forgottenOrIncorrectFacts)
        )

        if (!DB_response.success) {
          throw new Error(
            DB_response.error || "Failed to update topic on recall"
          )
        }

        const due_date = DB_response.due_date
        if (!due_date) {
          throw new Error("Due date not returned from updateTopicOnRecall")
        }

        date_from_now = formatDistanceToNow(due_date)
        const allRecalled = forgottenOrIncorrectFacts.length === 0

        if (allRecalled) {
          newStudyState =
            studyState === "recall_tutorial_first_attempt"
              ? "tutorial_hinting"
              : "recall_finished"

          chatStreamResponse = await streamText({
            model: defaultModel,
            temperature: 0.2,
            messages: convertToCoreMessages([
              {
                role: "system",
                content: `${mentor_system_message} Answer in a consistent style.`
              },
              {
                role: "user",
                content: `Generate upbeat feedback based on the students recall performance. 
  Topic study sheet: 
  """
  ${studySheet}
  """
  
  Student recall: 
  """
  ${studentMessage.content}
  """
  
  Inform the student of their recall score: ${recallScore}% and the next recall session date; ${date_from_now} from now, to ensure consistent study progress.
  ${finalFeedback}`
              }
            ])
          })

          return chatStreamResponse.toDataStreamResponse({
            headers: {
              "NEW-STUDY-STATE": newStudyState,
              SCORE: recallScore.toString(),
              "DUE-DATE-FROM-NOW": date_from_now,
              "FACTS-FEEDBACK": JSON.stringify(recallResponse.topic_facts)
            }
          })
        } else {
          // score < 90

          chatStreamResponse = await streamText({
            model: defaultModel,
            temperature: 0.2,
            messages: convertToCoreMessages([
              {
                role: "system",
                content: `${mentor_system_message} Answer in a consistent style. Follow the following instructions:
                  1. Provide positive and encouraging feedback to the student based on their recall attempt.
                  2. Generate a list of hints for the list of forgotten facts below. Important: Do not provide answers to the forgotten facts, only hints and clues.
                  3. Ask the student to try and provide answers to this list of hints.`
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
  <ForgottenFacts>
  ${forgottenOrIncorrectFacts.join("\n")}
  </ForgottenFacts>`
              }
            ])
          })

          newStudyState =
            studyState === "recall_tutorial_first_attempt"
              ? "tutorial_hinting"
              : "recall_hinting"

          return chatStreamResponse.toDataStreamResponse({
            headers: {
              "NEW-STUDY-STATE": newStudyState,
              SCORE: recallScore.toString(),
              "DUE-DATE-FROM-NOW": date_from_now,
              "FACTS-FEEDBACK": JSON.stringify(recallResponse.topic_facts)
            }
          })
        }

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
          messages: convertToCoreMessages([
            {
              role: "system",
              content: `When constructing feedback for a student's attempt at answering hints on a recall test, follow these guidelines:
  
  Positive Reinforcement:
  
  Begin with an encouraging statement that acknowledges the student's effort.
  Use positive language and emojis to create a friendly tone.
  Example: "Great effort! 🌟"
  
  
  Highlight Correct Answers:
  
  Immediately point out what the student got right using the topic source only:
  <StudySheet>
  ${studySheet}.
  <StudySheet>
  Reinforce correct information with additional context or interesting facts.
  Example: "You got the first part right; indeed, Venus has a day that is longer than its year due to its incredibly slow rotation."
  
  
  Address Incorrect Answers:
  
  Gently point out any misconceptions or errors.
  Provide the correct information in a clear, concise manner.
  Use transitional phrases like "However," to introduce corrections.
  Example: "However, about Venus's past, it was actually thought to have been a habitable ocean world similar to Earth, not a dry desert."
  
  
  Provide Additional Information:
  
  Expand on the topic with relevant facts fromt the topic source to enhance understanding.
  Use emoji icons to make key points more engaging and memorable.
  Example: "Scientists believe it may have had large amounts of surface water which later disappeared due to a runaway greenhouse effect. 🌊➡️🔥"
  
  
  Quantify Performance:
  
  Give a clear indication of how well the student performed.
  Use percentages or fractions to represent their success rate based this recall attempt: ${chatRecallMetadata?.score}%.
  Example: "You're doing well with a 50% correct recall before we went through the hints."
  
  
  Encourage Continued Effort:
  
  Include a motivational phrase to encourage further learning.
  Example: "Keep it up!"
  
  
  Next Steps and Scheduling:
  
  Inform the student about their next recall session based on this due date: ${chatRecallMetadata?.dueDateFromNow}.
  Provide a specific timeframe for the next session.
  Use calendar emoji for visual reinforcement.
  Example: "Your next recall session is due in 2 days. 📅"
  
  
  Study Recommendations:
  
  Suggest review of topic study sheet to improve understanding.
  Encourage immediate review to reinforce learning.
  Example: "Review the topic study sheet now to help reinforce and expand your memory on Venus. 📚"
  
  
  Focus Areas:
  
  Highlight specific areas or topics the student should concentrate on.
  Tie these focus areas to upcoming learning objectives.
  Example: "Take some time to go over the details, especially the parts about Venus's past climate and its atmospheric composition."
  
  
  Future Outlook:
  
  Connect current learning to future sessions or topics.
  Create anticipation for upcoming learning opportunities.
  Example: "This will set us up perfectly for enhancing your understanding in our upcoming session."
  
  
  Overall Structure:
  
  Keep paragraphs short and focused for easy readability.
  Use line breaks between different sections of feedback.
  Maintain a balance between praise, correction, and guidance.`
            },
            {
              role: "assistant",
              content: mentor_shot_hint_response
            },
            {
              role: "user",
              content:
                "Venus has a day that's longer than its year because of its slow rotation, right? As for Venus a long time ago, I think it used to be completely dry and desert-like, without any oceans or water."
            },
            {
              role: "assistant",
              content: `Great effort! 🌟 You got the first part right; indeed, Venus has a day that is longer than its year due to its incredibly slow rotation. That's an interesting fact not many remember! 🕒
    
                However, about Venus's past, it was actually thought to have been a habitable ocean world similar to Earth, not a dry desert. Scientists believe it may have had large amounts of surface water which later disappeared due to a runaway greenhouse effect. 🌊️🔥
    
                You're doing well with a 50% correct recall before we went through the hints. Keep it up!
    
                Your next recall session is due in 2 days. 📅 Review the topic study sheet now to help reinforce and expand your memory on Venus. 📚
    
                Take some time to go over the details, especially the parts about Venus's past climate and its atmospheric composition. This will set us up perfectly for enhancing your understanding in our upcoming session.`
            },
            {
              role: "assistant",
              content: mentorHintsMessage.content
            },
            {
              role: "user",
              content: studentMessage.content
            }
          ])
        })

        newStudyState =
          studyState === "recall_tutorial_hinting"
            ? "tutorial_final_stage"
            : "recall_finished"

        return chatStreamResponse.toDataStreamResponse({
          headers: {
            "NEW-STUDY-STATE": newStudyState
          }
        })

      case "recall_finished":
      case "reviewing":
        // SHOW FULL study sheet ///////////////////////////////

        chatStreamResponse = await streamText({
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
      case "quick_quiz_question":
        chatStreamResponse = await streamText({
          model: defaultModel,
          temperature: 0.3,
          messages: convertToCoreMessages([
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
          ])
        })
        newStudyState = "quick_quiz_user_answer"
        return chatStreamResponse.toDataStreamResponse({
          headers: {
            "NEW-STUDY-STATE": newStudyState
          }
        })
      case "quick_quiz_answer":
      case "quick_quiz_finished":
        const previousQuizQuestion = messages[messages.length - 2].content
        const finalFeeback = noMoreQuizQuestions
          ? "Finally advise the student there are no more quiz questions available. Come back again another time."
          : ""

        chatStreamResponse = await streamText({
          model: defaultModel,
          temperature: 0.3,
          messages: convertToCoreMessages([
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
          ])
        })
        newStudyState =
          studyState === "quick_quiz_finished"
            ? "quick_quiz_finished"
            : "quick_quiz_answer_next"
        return chatStreamResponse.toDataStreamResponse({
          headers: {
            "NEW-STUDY-STATE": newStudyState
          }
        })

      default:
        // Handle other states or error
        throw new Error("Invalid study state")
    }
  } catch (error: any) {
    console.error("Error in POST route:", error)
    const errorMessage = error.message || "An unexpected error occurred"
    const errorCode = error.status || 500
    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
