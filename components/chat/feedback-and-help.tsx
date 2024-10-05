import FeedbackButton from "./chat-ideas-bugs"
import { ChatHelp } from "./chat-help"

const FeedbackAndHelp = () => {
  return (
    <>
      <div className="fixed bottom-1  hidden md:block">
        <FeedbackButton />
      </div>
      <div className="absolute right-2 top-2  md:block lg:bottom-4 lg:right-4">
        <ChatHelp />
      </div>
    </>
  )
}

export default FeedbackAndHelp
