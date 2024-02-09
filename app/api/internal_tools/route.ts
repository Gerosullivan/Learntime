import { Database, Tables } from "@/supabase/types"
import { ServerRuntime } from "next"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export const runtime: ServerRuntime = "edge"

export async function POST(request: Request) {
  const cookieStore = cookies()

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        }
      }
    }
  )

  console.log("internal tools POST request")
  const json = await request.json()
  const { new_topic_name } = json
  // get chat id from last path on URL
  const url = new URL(request.url)
  const path = url.pathname.split("/")
  const chat_id = path[path.length - 1]
  console.log("chat_id", chat_id)

  try {
    // Update the chat name in the database
    const { error } = await supabase
      .from("chats")
      .update({ name: new_topic_name })
      .eq("id", chat_id)

    if (error) throw error

    return new Response(
      JSON.stringify({ message: `New topic name ${new_topic_name}` }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      }
    )
  } catch (error: any) {
    const errorMessage = error.error?.message || "An unexpected error occurred"
    const errorCode = error.status || 500
    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
