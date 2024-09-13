import FeedbackButton from "./chat-ideas-bugs"
import { ChatHelp } from "./chat-help"

const FeedbackAndHelp = () => {
  return (
    <>
      <div className="fixed bottom-1  hidden md:block">
        <FeedbackButton />
      </div>
      <div className="absolute bottom-2 right-2 hidden md:block lg:bottom-4 lg:right-4">
        <ChatHelp />
      </div>
    </>
  )
}

export default FeedbackAndHelp
