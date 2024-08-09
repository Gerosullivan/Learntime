export type StudyState =
  | "home"
  | "topic_new"
  | "topic_describe_upload"
  | "topic_generated"
  | "topic_saved_hide_input"
  | "topic_default_hide_input"
  | "recall_first_attempt"
  | "recall_hinting"
  | "recall_finished_hide_input"
  | "reviewing"
  | "tutorial_hide_input"
  | "tutorial_2_hide_input"
  | "tutorial_3_hide_input"
  | "tutorial_4_hide_input"
  | "tutorial_restart_hide_input"
  | "tutorial_hinting_hide_input"
  | "recall_tutorial_first_attempt"
  | "recall_tutorial_hinting"
  | "tutorial_final_stage_hide_input"
  | "tutorial_final_review_hide_input"
  | "tutorial_finished_hide_input"
  | "final_review_hide_input"
  | "quick_quiz_ready_hide_input"
  | "quick_quiz_answer"
  | "quick_quiz_finished_hide_input"

export interface QuickResponse {
  quickText: string
  responseText: string
  newStudyState: StudyState
}

interface StudyStateObject {
  name: StudyState
  quickResponses?: QuickResponse[]
}

export interface ChatRecallMetadata {
  score: number
  dueDateFromNow: string
}

export const studyStates: StudyStateObject[] = [
  {
    name: "topic_generated",
    quickResponses: [
      {
        quickText: "Save study sheet.",
        responseText: "{{DB}}",
        newStudyState: "topic_saved_hide_input"
      }
    ]
  },
  {
    name: "topic_saved_hide_input",
    quickResponses: [
      {
        quickText: "Start recall now.",
        responseText: "Try to recall as much as you can. Good luck!",
        newStudyState: "recall_first_attempt"
      },
      {
        quickText: "Edit topic.",
        responseText: "What updates should we make to the topic study sheet?",
        newStudyState: "topic_describe_upload"
      }
    ]
  },
  {
    name: "topic_default_hide_input",
    quickResponses: [
      {
        quickText: "Start recall now.",
        responseText:
          "Let's see what you remember about the topic. Give it your best shot!",
        newStudyState: "recall_first_attempt"
      },
      {
        quickText: "Show study sheet.",
        responseText: "{{topicDescription}}",
        newStudyState: "reviewing"
      }
    ]
  },
  {
    name: "recall_first_attempt"
  },
  {
    name: "recall_hinting"
  },
  {
    name: "recall_finished_hide_input",
    quickResponses: [
      {
        quickText: "Show study sheet.",
        responseText: "{{topicDescription}}",
        newStudyState: "final_review_hide_input"
      }
    ]
  },
  {
    name: "final_review_hide_input"
  },
  {
    name: "reviewing",
    quickResponses: [
      {
        quickText: "Edit topic.",
        responseText: "What updates should we make to the topic study sheet?",
        newStudyState: "topic_describe_upload"
      },
      {
        quickText: "Start recall now.",
        responseText:
          "Let's see what you remember about the topic. Give it your best shot!",
        newStudyState: "recall_first_attempt"
      }
    ]
  },
  {
    name: "tutorial_hide_input",
    quickResponses: [
      {
        quickText: "Next.",
        responseText: `Now I'll guide you on how to add a study sheet. It's quite exciting to create a new topic together!
A study sheet typically includes 10 to 30 key facts, each with a few important details. The content and depth may vary based on the topic's complexity and your needs.
Let's start with 'States of matter' Click on it below.`,
        newStudyState: "tutorial_2_hide_input"
      }
    ]
  },
  {
    name: "tutorial_2_hide_input",
    quickResponses: [
      {
        quickText: "States of matter.",
        responseText: `If at this stage you've only entered a topic name, like now, I'll step in to help craft a suitable study sheet for you. Alternatively, you're more than welcome to add a description yourself, whether by uploading a document or typing directly into our chat. For the moment, I'll take care of generating the description for you. Please 'View topic.' now, and afterwards, 'Save...'`,
        newStudyState: "tutorial_3_hide_input"
      }
    ]
  },
  {
    name: "tutorial_3_hide_input",
    quickResponses: [
      {
        quickText: "View topic.",
        responseText: "{{topicDescription}}",
        newStudyState: "tutorial_4_hide_input"
      }
    ]
  },
  {
    name: "tutorial_4_hide_input",
    quickResponses: [
      {
        quickText: "Save tutorial study sheet.",
        responseText: `Now comes the fun part! After taking some time to study the topic, it's time for your first recall attempt. Let's make it a good one, no peeking allowed! 👀😉
I'll be here to assess your attempt and set up a recall session based on how you do. Give it your best shot to recall as much as you can about "States of matter" topic but leave out some facts for the purpose of this tutorial; select the chat area below (Message Mentor...) then type or hit the microphone key on your keyboard.
After you receive feedback on your attempt, select "Next step..." to move forward.`,
        newStudyState: "recall_tutorial_first_attempt"
      }
    ]
  },
  {
    name: "recall_tutorial_first_attempt"
  },
  {
    name: "tutorial_hinting_hide_input",
    quickResponses: [
      {
        quickText: "Next step - reply to hints.",
        responseText:
          "Great work so far! So now that some hints have been provided, try your best to recall the missing facts.",
        newStudyState: "recall_tutorial_hinting"
      }
    ]
  },
  {
    name: "recall_tutorial_hinting"
  },
  {
    name: "tutorial_final_stage_hide_input",
    quickResponses: [
      {
        quickText: "Final stage - review.",
        responseText: `Amazing work! 
The final stage of an effective study session is reviewing the topic one last time with an eye on what was missed. This is where you'll get a chance to solidify your understanding of the topic.`,
        newStudyState: "tutorial_final_review_hide_input"
      }
    ]
  },
  {
    name: "tutorial_final_review_hide_input",
    quickResponses: [
      {
        quickText: "Show topic content for final review.",
        responseText: "{{topicDescription}}",
        newStudyState: "tutorial_finished_hide_input"
      }
    ]
  },
  {
    name: "tutorial_finished_hide_input",
    quickResponses: [
      {
        quickText: "Finish tutorial.",
        responseText: `Amazing work! 
On the topic list to the left, you will notice the icon next to this topic name has changed to indicat that you've successfully reviewed the topic. Return to this topic shortly and based on how much you remember, Mentor will schedule a revision in a couple of days. 
As days go by leading up to your next review session, this icon will change, reflecting an estimate of your recall strength. Don't worry, we'll email you on that day with a gentle nudge when it's time for a refresh.
Now, you're all set to begin creating your own topics! Just click on the "+ New topic" button located at the top left corner.
And of course, feel free to dive back in to further solidify your mastery of States of matter!
Enjoy your learning journey!`,
        newStudyState: "home"
      }
    ]
  },
  {
    name: "tutorial_restart_hide_input",
    quickResponses: [
      {
        quickText: "Restart tutorial.",
        responseText: "{{topicDescription}}",
        newStudyState: "tutorial_hide_input"
      }
    ]
  },
  {
    name: "quick_quiz_ready_hide_input",
    quickResponses: [
      {
        quickText: "Next question.",
        responseText: "{{LLM}}",
        newStudyState: "quick_quiz_answer"
      }
    ]
  },
  {
    name: "quick_quiz_answer",
    quickResponses: [
      {
        quickText: "I don't know.",
        responseText: "{{LLM}}",
        newStudyState: "quick_quiz_answer"
      }
    ]
  }
]

export function getQuickResponses(studyState: StudyState): QuickResponse[] {
  const stateObject = studyStates.find(state => state.name === studyState)

  return stateObject?.quickResponses ?? []
}

export function getQuickResponseByUserText(
  userText: string
): QuickResponse | undefined {
  for (const state of studyStates) {
    const quickResponse = state.quickResponses?.find(
      qr => qr.quickText === userText
    )
    if (quickResponse) {
      return quickResponse
    }
  }
  return undefined
}
