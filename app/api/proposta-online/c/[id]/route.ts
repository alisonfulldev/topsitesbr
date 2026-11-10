import { NextResponse } from 'next/server'
import { trackClick } from '@/lib/online-proposal/sequence'
import { SITE_URL } from '@/lib/marketing'

// Botão "Ver meu site" dos e-mails: registra o clique e leva para a proposta
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const target = await trackClick(params.id)
  return NextResponse.redirect(target ?? SITE_URL, { headers: { 'X-Robots-Tag': 'noindex' } })
}
