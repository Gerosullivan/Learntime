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
  | "recall_tutorial_first_attempt"
  | "tutorial_hinting_hide_input"
  | "recall_tutorial_hinting"
  | "tutorial_final_stage_hide_input"
  | "tutorial_final_review_hide_input"
  | "tutorial_finished_hide_input"
  | "tutorial_finished_hide_input_2"
  | "final_review_hide_input"
  | "quick_quiz_ready_hide_input"
  | "quick_quiz_answer"
  | "quick_quiz_finished_hide_input"

export interface QuickResponse {
  quickText: string
  newStudyState: StudyState
}

interface StudyStateObject {
  name: StudyState
  message: string
  quickResponses?: QuickResponse[]
}

export interface ChatRecallMetadata {
  score: number
  dueDateFromNow: string
}

export const studyStates: StudyStateObject[] = [
  {
    name: "topic_new",
    message: "Enter your topic name below to start."
  },
  {
    name: "topic_describe_upload",
    message: "What updates should we make to the topic study sheet?"
  },
  {
    name: "topic_generated",
    message: "{{DB}}",
    quickResponses: [
      {
        quickText: "Save study sheet.",
        newStudyState: "topic_saved_hide_input"
      }
    ]
  },
  {
    name: "topic_saved_hide_input",
    message: "{{DB}}",
    quickResponses: [
      {
        quickText: "Start recall now.",
        newStudyState: "recall_first_attempt"
      },
      {
        quickText: "Edit topic.",
        newStudyState: "topic_describe_upload"
      }
    ]
  },
  {
    name: "topic_default_hide_input",
    message: `Welcome back to the topic "{{chat.name}}".
Please select from the options below.`,
    quickResponses: [
      {
        quickText: "Start recall now.",
        newStudyState: "recall_first_attempt"
      },
      {
        quickText: "Show study sheet.",
        newStudyState: "reviewing"
      }
    ]
  },
  {
    name: "recall_first_attempt",
    message: "Try to recall as much as you can. Good luck!"
  },
  {
    name: "recall_hinting",
    message: "{{LLM}}"
  },
  {
    name: "recall_finished_hide_input",
    message: "{{LLM}}",
    quickResponses: [
      {
        quickText: "Show study sheet.",
        newStudyState: "final_review_hide_input"
      }
    ]
  },
  {
    name: "final_review_hide_input",
    message: "{{topicDescription}}"
  },
  {
    name: "reviewing",
    message: "{{topicDescription}}",
    quickResponses: [
      {
        quickText: "Edit topic.",
        newStudyState: "topic_describe_upload"
      },
      {
        quickText: "Start recall now.",
        newStudyState: "recall_first_attempt"
      }
    ]
  },
  {
    name: "tutorial_hide_input",
    message: "",
    quickResponses: [
      {
        quickText: "Next.",
        newStudyState: "tutorial_2_hide_input"
      }
    ]
  },
  {
    name: "tutorial_2_hide_input",
    message: `To create a new set of notes you click on the [+ New topic] button located in the left panel.
     
I've already done this for you.
    
Now, select [States of matter] below as an example topic name I have already generated for you.`,
    quickResponses: [
      {
        quickText: "States of matter.",
        newStudyState: "tutorial_3_hide_input"
      }
    ]
  },
  {
    name: "tutorial_3_hide_input",
    message: `After entering a topic name, the next step is to create a sheet of study notes.
You can enter this information in several ways:
      
- Drag and drop your own text documents or images into the input box below
- Upload files by clicking the ⨁ button
- Type your own notes directly into the box
- Ask me to create a set of notes for you (Example: "Generate notes for me")

For this tutorial, I have already generated a sheet of notes on "States of matter" as an example topic. Please select [View topic] below and then [Save tutorial study sheet].`,
    quickResponses: [
      {
        quickText: "View topic.",
        newStudyState: "tutorial_4_hide_input"
      }
    ]
  },
  {
    name: "tutorial_4_hide_input",
    message: "{{topicDescription}}",
    quickResponses: [
      {
        quickText: "Save tutorial study sheet.",
        newStudyState: "recall_tutorial_first_attempt"
      }
    ]
  },
  {
    name: "recall_tutorial_first_attempt",
    message: `Now comes the fun part - it's time for your first recall attempt! 😃

Type or dictate (using the microphone key on your keyboard) into the input box below what you remember from the notes above.

I'll assess your attempt, help jog your memory, and set up a recall session based on your performance. Give it your best shot to recall as much as you can about the 'States of matter' topic now.`
  },
  {
    name: "tutorial_hinting_hide_input",
    message: "{{LLM}}",
    quickResponses: [
      {
        quickText: "Next step - reply to hints.",
        newStudyState: "recall_tutorial_hinting"
      }
    ]
  },
  {
    name: "recall_tutorial_hinting",
    message:
      "Great work so far! So now that some hints have been provided, try your best to recall the missing facts."
  },
  {
    name: "tutorial_final_stage_hide_input",
    message: "{{LLM}}",
    quickResponses: [
      {
        quickText: "Final stage - review.",
        newStudyState: "tutorial_final_review_hide_input"
      }
    ]
  },
  {
    name: "tutorial_final_review_hide_input",
    message: `Amazing work! 
The final stage of an effective study session is reviewing the topic one last time with an eye on what was missed. This is where you'll get a chance to solidify your understanding of the topic.`,
    quickResponses: [
      {
        quickText: "Show topic content for final review.",
        newStudyState: "tutorial_finished_hide_input"
      }
    ]
  },
  {
    name: "tutorial_finished_hide_input",
    message: "{{topicDescription}}",
    quickResponses: [
      {
        quickText: "Finish tutorial.",
        newStudyState: "tutorial_finished_hide_input_2"
      }
    ]
  },
  {
    name: "tutorial_finished_hide_input_2",
    message: `Excellent work!

On the left, you'll notice the icon next to this topic name has changed to indicate that you've successfully completed a recall session. As days pass leading up to your next session, this icon will update to reflect an estimate of your recall strength. Don't worry, we'll email you with a gentle reminder when it's time for another session.

You're now ready to create your own topics! Simply click the [+ New topic] button in the top left corner, create your notes, and save the study sheets. I'll schedule revision sessions based on how much you recall.

Feel free to revisit "States of matter" anytime to further solidify your understanding.

Enjoy your learning journey!`
  },
  {
    name: "quick_quiz_ready_hide_input",
    message: `Are you ready to start a 🔥 Quick quiz?`,
    quickResponses: [
      {
        quickText: "Next question.",
        newStudyState: "quick_quiz_answer"
      }
    ]
  },
  {
    name: "quick_quiz_answer",
    message: "{{LLM}}",
    quickResponses: [
      {
        quickText: "I don't know.",
        newStudyState: "quick_quiz_answer"
      }
    ]
  },
  {
    name: "quick_quiz_finished_hide_input",
    message: "{{LLM}}"
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
