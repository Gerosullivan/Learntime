import { LearntimeContext } from "@/context/context"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useContext, useEffect, useRef, useState } from "react"

export const QuickQuiz = () => {
  const { selectedWorkspace } = useContext(LearntimeContext)
  const [isActive, setIsActive] = useState(false)

  const router = useRouter()

  // chat id is quick-quiz

  useEffect(() => {
    if (router.isReady) {
      // Safely access router.asPath here
      const currentPath = router.asPath
      setIsActive(currentPath.includes("/chat/quick-quiz"))
    }
  }, [router.isReady])

  const itemRef = useRef<HTMLDivElement>(null)

  const handleClick = () => {
    if (!selectedWorkspace) return
    return router.push(`/${selectedWorkspace.id}/chat/quick-quiz`)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      e.stopPropagation()
      itemRef.current?.click()
    }
  }

  return (
    <div
      ref={itemRef}
      className={cn(
        "hover:bg-accent focus:bg-accent group flex w-full cursor-pointer items-center rounded p-2 hover:opacity-50 focus:outline-none",
        isActive && "bg-accent"
      )}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
    >
      🔥
      <div className="ml-3 flex-1 truncate text-sm font-semibold">
        Quick quiz
      </div>
      <div
        onClick={e => {
          e.stopPropagation()
          e.preventDefault()
        }}
        className={`ml-2 flex space-x-2 ${!isActive && "w-11 opacity-0 group-hover:opacity-100"}`}
      ></div>
    </div>
  )
}
