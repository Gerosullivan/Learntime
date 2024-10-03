import { StudyState } from "@/lib/studyStates"
import { streamText, LanguageModel, convertToCoreMessages } from "ai"

export async function handleHinting(
  hintingModel: LanguageModel,
  messages: any[],
  studyState: StudyState,
  studySheet: string,
  chatRecallMetadata: any,
  studentMessage: any,
  mentor_system_message: string
) {
  const mentorHintsMessage =
    studyState === "recall_tutorial_hinting"
      ? messages.slice(-4, -3)[0]
      : messages.slice(-2, -1)[0]

  const chatStreamResponse = await streamText({
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
        content: `Think about how long a day on Venus is compared to its year. It's quite a unique aspect of the planet. Can you remember which one is longer?
There's an interesting point about the past state of Venus related to water. What do you think Venus might have looked like a billion years ago?
Take a moment to think about these hints and see if you can recall more about those specific points. You're doing wonderfully so far, and digging a bit deeper will help solidify your understanding even more!`
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

  const newStudyState =
    studyState === "recall_tutorial_hinting"
      ? "tutorial_final_stage"
      : "recall_finished"

  return chatStreamResponse.toDataStreamResponse({
    headers: {
      "NEW-STUDY-STATE": newStudyState
    }
  })
}
