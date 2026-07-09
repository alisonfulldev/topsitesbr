import { createClient } from '@supabase/supabase-js'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function uploadFile(
  bucket: string,
  path: string,
  file: File | Buffer,
  contentType?: string
) {
  const supabase = getAdminClient()
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType, upsert: true })

  if (error) throw new Error(`Storage upload error: ${error.message}`)
  return data
}

export async function deleteFile(bucket: string, path: string) {
  const supabase = getAdminClient()
  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) throw new Error(`Storage delete error: ${error.message}`)
}

export function getPublicUrl(bucket: string, path: string): string {
  const supabase = getAdminClient()
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}
