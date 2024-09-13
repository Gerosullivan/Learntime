import Link from "next/link"

const FeedbackButton = () => {
  return (
    <div className="text-sm text-zinc-400">
      AI mentor can make mistakes.{" "}
      <Link
        href="https://learntime.canny.io"
        data-canny-link
        target="_blank"
        className="underline"
      >
        Report 🪲 bugs or submit 💡 ideas.
      </Link>
    </div>
  )
}

export default FeedbackButton
