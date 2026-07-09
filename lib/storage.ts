import {
  uploadFile,
  getPublicUrl,
  deleteFile,
} from '@/lib/integrations/supabase-storage'

const SITE_FILES_BUCKET = 'site-files'

export async function uploadSiteFile(
  path: string,
  file: File | Buffer,
  contentType?: string
): Promise<string> {
  await uploadFile(SITE_FILES_BUCKET, path, file, contentType)
  return getPublicUrl(SITE_FILES_BUCKET, path)
}

export async function deleteSiteFile(path: string): Promise<void> {
  await deleteFile(SITE_FILES_BUCKET, path)
}

export function getSiteFileUrl(path: string): string {
  return getPublicUrl(SITE_FILES_BUCKET, path)
}
