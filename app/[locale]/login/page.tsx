import { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import LoginForm from "./LoginForm"

export const metadata: Metadata = {
  title: "Login"
}

export default async function Login({
  searchParams
}: {
  searchParams: { message: string }
}) {
  const supabase = createClient()
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (session) {
    const { data: homeWorkspace, error } = await supabase
      .from("workspaces")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("is_home", true)
      .single()

    if (!homeWorkspace) {
      throw new Error(error?.message)
    }

    return redirect(`/${homeWorkspace.id}/chat`)
  }

  return <LoginForm message={searchParams?.message} />
}
