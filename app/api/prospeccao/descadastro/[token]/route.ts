import { NextRequest, NextResponse } from 'next/server'
import { unsubscribeByToken } from '@/lib/prospecting/service'
import { unsubscribePageUrl } from '@/lib/prospecting/render'

// One-click do cabeçalho List-Unsubscribe-Post (RFC 8058): o Gmail/Outlook chama com POST, sem abrir página.
// Nos e-mails de teste o link leva "?teste=1" e nada é alterado.
export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  if (req.nextUrl.searchParams.get('teste') !== '1') await unsubscribeByToken(params.token, 'one-click')
  return new NextResponse(null, { status: 200 })
}

// Quem abrir o endereço no navegador vai para a página de confirmação
export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  return NextResponse.redirect(unsubscribePageUrl(params.token, req.nextUrl.searchParams.get('teste') === '1'))
}
