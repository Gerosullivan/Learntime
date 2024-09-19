"use client"

import { Dashboard } from "@/components/ui/dashboard"
import { LearntimeContext } from "@/context/context"
import { getChatsByWorkspaceId } from "@/db/chats"
import { getWorkspaceById } from "@/db/workspaces"
import { supabase } from "@/lib/supabase/browser-client"
import { useParams, useRouter } from "next/navigation"
import { ReactNode, useContext, useEffect, useState } from "react"
import Loading from "../loading"

interface WorkspaceLayoutProps {
  children: ReactNode
}

export default function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  const router = useRouter()

  const params = useParams()
  const workspaceId = params.workspaceid as string

  const { setChats, setSelectedWorkspace, setSelectedChat } =
    useContext(LearntimeContext)

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const session = (await supabase.auth.getSession()).data.session
      // console.warn("logging out layout!")
      // supabase.auth.signOut()
      if (!session) {
        return router.push("/login")
      } else {
        await fetchWorkspaceData(workspaceId)
      }
    })()
  }, [])

  useEffect(() => {
    ;(async () => await fetchWorkspaceData(workspaceId))()

    setSelectedChat(null)
  }, [workspaceId])

  const fetchWorkspaceData = async (workspaceId: string) => {
    setLoading(true)

    const workspace = await getWorkspaceById(workspaceId)
    setSelectedWorkspace(workspace)

    const chats = await getChatsByWorkspaceId(workspaceId)
    setChats(chats)

    setLoading(false)
  }

  if (loading) {
    return <Loading />
  }

  return <Dashboard>{children}</Dashboard>
}
