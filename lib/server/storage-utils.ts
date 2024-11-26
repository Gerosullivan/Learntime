import { createAdminClient } from "@/lib/supabase/server"

export async function uploadToStorage(file: Buffer, fileName: string) {
  const supabase = createAdminClient()

  const { data, error } = await supabase.storage
    .from("temp-pdfs")
    .upload(`pdf-uploads/${fileName}`, file, {
      contentType: "application/pdf",
      upsert: true
    })

  if (error) throw error
  return data.path
}

export async function downloadFromStorage(path: string) {
  const supabase = createAdminClient()

  const { data, error } = await supabase.storage
    .from("temp-pdfs")
    .download(path)

  if (error) throw error
  return await data.arrayBuffer()
}

export async function deleteFromStorage(path: string) {
  const supabase = createAdminClient()

  const { error } = await supabase.storage.from("temp-pdfs").remove([path])

  if (error) throw error
}
