"use client"

import { LearntimeContext } from "@/context/context"
import { useContext } from "react"

export default function WorkspacePage() {
  const { selectedWorkspace } = useContext(LearntimeContext)

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center">
      <div className="text-4xl">{selectedWorkspace?.name}</div>
    </div>
  )
}
