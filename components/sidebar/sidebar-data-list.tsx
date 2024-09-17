import { ChatbotUIContext } from "@/context/context"
import { cn, isDateBeforeToday } from "@/lib/utils"
import { Tables } from "@/supabase/types"
import { FC, useContext, useEffect, useRef, useState } from "react"
import { ChatItem } from "./items/chat/chat-item"
import {
  isToday,
  isTomorrow,
  isThisWeek,
  addWeeks,
  endOfWeek,
  isThisMonth,
  startOfWeek,
  endOfMonth,
  addMonths,
  endOfDay,
  addDays
} from "date-fns"
import { fsrs } from "ts-fsrs"
import { QuickQuiz } from "./items/chat/quick-quiz"

interface SidebarDataListProps {
  data: Tables<"chats">[]
}

export const SidebarDataList: FC<SidebarDataListProps> = ({ data }) => {
  const { allChatRecallAnalysis } = useContext(ChatbotUIContext)

  const divRef = useRef<HTMLDivElement>(null)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const currentTime = new Date()

  const getSortedData = (
    data: Tables<"chats">[],
    dateCategory:
      | "Today"
      | "Tomorrow"
      | "Later this week"
      | "Next week"
      | "Later this month"
      | "Next month"
      | "After next month"
  ) => {
    return data
      .filter((item: Tables<"chats">) => {
        const dueDate = item.due_date ? new Date(item.due_date) : currentTime

        const revisionNextWeek =
          dueDate >= addWeeks(startOfWeek(currentTime), 1) &&
          dueDate <= endOfWeek(addWeeks(currentTime, 1))

        const dueTomorrow = isTomorrow(dueDate)

        const endOfNextMonth = endOfMonth(addMonths(currentTime, 1))
        switch (dateCategory) {
          case "Today":
            return isToday(dueDate) || isDateBeforeToday(dueDate)
          case "Tomorrow":
            return dueTomorrow
          case "Later this week":
            return (
              dueDate > endOfDay(addDays(new Date(), 1)) && isThisWeek(dueDate)
            )
          case "Next week":
            return revisionNextWeek
          case "Later this month":
            return (
              dueDate > currentTime &&
              !isThisWeek(dueDate) &&
              !revisionNextWeek &&
              isThisMonth(dueDate)
            )
          case "Next month":
            return (
              !dueTomorrow &&
              dueDate > endOfMonth(currentTime) &&
              dueDate <= endOfNextMonth &&
              !revisionNextWeek
            )
          case "After next month":
            return dueDate > endOfNextMonth
          default:
            return true
        }
      })
      .sort(
        (a: { predictedRecall: number }, b: { predictedRecall: number }) =>
          a.predictedRecall - b.predictedRecall
      )
  }

  useEffect(() => {
    if (divRef.current) {
      setIsOverflowing(
        divRef.current.scrollHeight > divRef.current.clientHeight
      )
    }
  }, [data])

  const f = fsrs()
  const now = new Date()

  const dataWithPredictedRecall = data.map(item => {
    let predictedRecall = -1

    if (item.srs_card && typeof item.srs_card === "string") {
      const retrievability = f.get_retrievability(
        JSON.parse(item.srs_card),
        now
      )
      predictedRecall = parseFloat(retrievability?.toString() || "75")
    }

    return {
      ...item,
      predictedRecall
    }
  })

  return (
    <>
      <div ref={divRef} className="mt-2 flex flex-col overflow-auto">
        {data.length === 0 && (
          <div className="flex grow flex-col items-center justify-center">
            <div className="text-muted-foreground p-8 text-lg italic">
              No chats.
            </div>
          </div>
        )}

        {data.length > 0 && (
          <div
            className={`h-full ${
              isOverflowing ? "w-[calc(100%-8px)]" : "w-full"
            } space-y-2 pt-2 ${isOverflowing ? "mr-2" : ""}`}
          >
            {allChatRecallAnalysis.length > 0 && (
              <div className="pb-2">
                <div className={cn("flex grow flex-col")}>
                  <QuickQuiz />
                </div>
              </div>
            )}

            {[
              "Today",
              "Tomorrow",
              "Later this week",
              "Next week",
              "Later this month",
              "Next month",
              "After next month"
            ].map(dateCategory => {
              const sortedData = getSortedData(
                dataWithPredictedRecall,
                dateCategory as
                  | "Today"
                  | "Tomorrow"
                  | "Later this week"
                  | "Next week"
                  | "Later this month"
                  | "Next month"
                  | "After next month"
              )

              return (
                sortedData.length > 0 && (
                  <div key={dateCategory} className="pb-2">
                    <div className="text-muted-foreground mb-1 text-sm font-bold">
                      {dateCategory}
                    </div>

                    <div className={cn("flex grow flex-col")}>
                      {sortedData.map((item: Tables<"chats">) => (
                        <ChatItem key={item.id} chat={item} />
                      ))}
                    </div>
                  </div>
                )
              )
            })}
          </div>
        )}
      </div>

      <div className={cn("flex grow")} />
    </>
  )
}
