import { NextResponse } from 'next/server'
import { trackOpen } from '@/lib/online-proposal/sequence'

// Pixel de abertura (1x1 transparente). Indicativo apenas: Gmail e Apple abrem imagens sozinhos.
const GIF = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64')

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  await trackOpen(params.id)
  return new NextResponse(GIF, {
    headers: { 'Content-Type': 'image/gif', 'Cache-Control': 'no-store, max-age=0', 'X-Robots-Tag': 'noindex' },
  })
}
