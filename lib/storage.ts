import * as fs from 'fs'
import * as nodePath from 'path'
import {
  uploadFile,
  getPublicUrl,
  deleteFile,
} from '@/lib/integrations/supabase-storage'

// ── Interface ─────────────────────────────────────────────────────────────────

export interface FileStorage {
  /** Uploads a site ZIP and returns its public URL, or null on mock/dry-run. */
  uploadSiteFile(path: string, file: File | Buffer, contentType?: string): Promise<string | null>
  deleteSiteFile(path: string): Promise<void>
  /** Synchronous URL construction — no network call. */
  getSiteFileUrl(path: string): string
  /** Uploads a ticket image attachment and returns its URL. */
  uploadTicketAttachment(filename: string, file: File | Buffer, contentType?: string): Promise<string>
}

// ── Local implementation (dev / STORAGE_DRIVER=local) ─────────────────────────

const LOCAL_UPLOADS_DIR = nodePath.join(process.cwd(), 'public', 'uploads')

class LocalFileStorage implements FileStorage {
  private async write(relativePath: string, file: File | Buffer): Promise<void> {
    const fullPath = nodePath.join(LOCAL_UPLOADS_DIR, relativePath)
    await fs.promises.mkdir(nodePath.dirname(fullPath), { recursive: true })
    const buf = file instanceof Buffer ? file : Buffer.from(await (file as File).arrayBuffer())
    await fs.promises.writeFile(fullPath, buf)
  }

  async uploadSiteFile(path: string, file: File | Buffer, contentType?: string): Promise<string | null> {
    await this.write(nodePath.join('site-files', path), file)
    return `/uploads/site-files/${path}`
  }

  async deleteSiteFile(path: string): Promise<void> {
    const fullPath = nodePath.join(LOCAL_UPLOADS_DIR, 'site-files', path)
    await fs.promises.rm(fullPath, { force: true })
  }

  getSiteFileUrl(path: string): string {
    return `/uploads/site-files/${path}`
  }

  async uploadTicketAttachment(filename: string, file: File | Buffer, contentType?: string): Promise<string> {
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
    const timestampedName = `${Date.now()}-${safeName}`
    await this.write(nodePath.join('ticket-attachments', timestampedName), file)
    return `/uploads/ticket-attachments/${timestampedName}`
  }
}

// ── Supabase implementation (STORAGE_DRIVER=supabase) ─────────────────────────

const SITE_FILES_BUCKET = 'site-files'
const TICKET_ATTACHMENTS_BUCKET = 'ticket-attachments'

class SupabaseFileStorage implements FileStorage {
  async uploadSiteFile(path: string, file: File | Buffer, contentType?: string): Promise<string | null> {
    await uploadFile(SITE_FILES_BUCKET, path, file, contentType)
    return getPublicUrl(SITE_FILES_BUCKET, path)
  }

  async deleteSiteFile(path: string): Promise<void> {
    await deleteFile(SITE_FILES_BUCKET, path)
  }

  getSiteFileUrl(path: string): string {
    return getPublicUrl(SITE_FILES_BUCKET, path)
  }

  async uploadTicketAttachment(filename: string, file: File | Buffer, contentType?: string): Promise<string> {
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = `${Date.now()}-${safeName}`
    await uploadFile(TICKET_ATTACHMENTS_BUCKET, path, file, contentType)
    return getPublicUrl(TICKET_ATTACHMENTS_BUCKET, path)
  }
}

// ── Factory ───────────────────────────────────────────────────────────────────

let _storage: FileStorage | undefined

function getStorage(): FileStorage {
  if (_storage) return _storage
  const driver = process.env.STORAGE_DRIVER ?? 'local'
  _storage = driver === 'supabase' ? new SupabaseFileStorage() : new LocalFileStorage()
  return _storage
}

// ── Public API (same signatures as before — callers unchanged) ─────────────────

export async function uploadSiteFile(
  path: string,
  file: File | Buffer,
  contentType?: string,
): Promise<string | null> {
  return getStorage().uploadSiteFile(path, file, contentType)
}

export async function deleteSiteFile(path: string): Promise<void> {
  return getStorage().deleteSiteFile(path)
}

export function getSiteFileUrl(path: string): string {
  return getStorage().getSiteFileUrl(path)
}

export async function uploadTicketAttachment(
  filename: string,
  file: File | Buffer,
  contentType?: string,
): Promise<string> {
  return getStorage().uploadTicketAttachment(filename, file, contentType)
}
