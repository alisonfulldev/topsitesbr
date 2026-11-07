import { NextRequest, NextResponse } from 'next/server'
import { recordWhatsappClick } from '@/lib/prospecting/service'

// Chamado pela página /r/w/[id] (via JavaScript) antes de abrir o WhatsApp.
// Por ser um POST disparado no navegador, os robôs que verificam links nos e-mails não contam como clique.
export async function POST(req: NextRequest) {
  const { emailId, test } = await req.json().catch(() => ({}))
  if (typeof emailId === 'string' && emailId.length <= 64) {
    await recordWhatsappClick(emailId, test === true).catch((err) => console.error('[prospeccao/clique]', err))
  }
  return NextResponse.json({ ok: true })
}
