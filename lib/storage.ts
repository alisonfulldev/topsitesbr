import {
  uploadFile,
  getPublicUrl,
  deleteFile,
} from '@/lib/integrations/supabase-storage'

const SITE_FILES_BUCKET = 'site-files'
const TICKET_ATTACHMENTS_BUCKET = 'ticket-attachments'

export async function uploadSiteFile(
  path: string,
  file: File | Buffer,
  contentType?: string
): Promise<string | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY === 'PREENCHER') {
    console.log('[MOCK:uploadSiteFile]', path)
    return null
  }
  await uploadFile(SITE_FILES_BUCKET, path, file, contentType)
  return getPublicUrl(SITE_FILES_BUCKET, path)
}

export async function deleteSiteFile(path: string): Promise<void> {
  await deleteFile(SITE_FILES_BUCKET, path)
}

export function getSiteFileUrl(path: string): string {
  return getPublicUrl(SITE_FILES_BUCKET, path)
}

export async function uploadTicketAttachment(
  filename: string,
  file: File | Buffer,
  contentType?: string,
): Promise<string> {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('[MOCK:uploadTicketAttachment]', safeName)
    return `/mock-uploads/ticket-attachments/${Date.now()}-${safeName}`
  }
  const path = `${Date.now()}-${safeName}`
  await uploadFile(TICKET_ATTACHMENTS_BUCKET, path, file, contentType)
  return getPublicUrl(TICKET_ATTACHMENTS_BUCKET, path)
}
