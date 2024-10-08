import { TablesUpdate } from "@/supabase/types"

import {
  Card,
  createEmptyCard,
  fsrs,
  generatorParameters,
  Rating,
  RecordLog,
  RecordLogItem
} from "ts-fsrs"
import { createAdminClient, createClient } from "../supabase/server"

export async function getServerProfile() {
  const supabase = createClient()

  const user = (await supabase.auth.getUser()).data.user
  if (!user) {
    throw new Error("User not found")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (!profile) {
    throw new Error("Profile not found")
  }

  return profile
}

export const getChatById = async (chatId: string) => {
  const supabase = createClient()

  const { data: chat } = await supabase
    .from("chats")
    .select("*")
    .eq("id", chatId)
    .maybeSingle()

  return chat
}

// getUserEmailById
export async function getUserEmailById(userId: string) {
  const supabaseAdmin = createAdminClient()

  // This gets the user details from the auth users
  const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId)

  if (error) {
    throw new Error(error.message)
  }

  return data.user.email
}

// Function that returns all chats where revise_date is today
export async function getChatsByDueDate() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayString = today.toISOString()

  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  const tomorrowString = tomorrow.toISOString()

  const supabaseAdmin = createAdminClient()

  // console.log("Today:", todayString, "Tomorrow:", tomorrowString)
  // Perform the query to get chats where revise_date is today
  const { data: chats, error } = await supabaseAdmin
    .from("chats")
    .select("*")
    .gte("due_date", todayString)
    .lt("due_date", tomorrowString)

  // Error handling
  if (error) {
    throw new Error(error.message)
  }

  if (!chats) {
    return []
  }

  return chats
}

export const updateChat = async (
  chatId: string,
  chat: TablesUpdate<"chats">
): Promise<{ success: true } | { success: false; error: string }> => {
  const supabase = createClient()

  const { error } = await supabase
    .from("chats")
    .update(chat)
    .eq("id", chatId)
    .select("*")
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function updateTopicOnRecall(
  chatId: string,
  test_result: number,
  recall_analysis: string
): Promise<
  | { success: true; due_date: Date; previous_test_result: number }
  | { success: false; error: string }
> {
  const chat = await getChatById(chatId)

  if (!chat) {
    return { success: false, error: "Chat not found" }
  }

  const previous_test_result = chat.test_result

  const params = generatorParameters({ enable_fuzz: true })
  const f = fsrs(params)

  const card: Card =
    chat.srs_card === null
      ? createEmptyCard()
      : typeof chat.srs_card === "string"
        ? JSON.parse(chat.srs_card)
        : chat.srs_card

  // map test_result to a rating
  let rating: Rating
  if (test_result < 40) {
    rating = Rating.Again
  } else if (test_result < 65) {
    rating = Rating.Hard
  } else if (test_result < 85) {
    rating = Rating.Good
  } else {
    rating = Rating.Easy
  }

  const scheduling_cards: RecordLog = f.repeat(card, Date.now())
  const record: RecordLogItem = scheduling_cards[rating]

  const chatUpdateStatus = await updateChat(chatId, {
    test_result: Math.round(test_result),
    srs_card: JSON.stringify(record.card),
    recall_analysis,
    due_date: record.card.due.toISOString()
  })

  if (chatUpdateStatus.success === false) {
    return chatUpdateStatus as { success: false; error: string }
  }

  return {
    success: true,
    due_date: record.card.due,
    previous_test_result
  }
}

// Remove the updateTopicContent function as it's not being used
