import { NextResponse } from 'next/server'
import { unsubscribeByToken } from '@/lib/online-proposal/sequence'

// Descadastro de um clique: GET (link no rodapé) e POST (List-Unsubscribe-Post, RFC 8058)
const page = (ok: boolean) => `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Descadastro</title></head>
<body style="margin:0;padding:48px 16px;background:#f3f4f6;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;text-align:center;color:#111827">
<div style="max-width:420px;margin:0 auto;background:#fff;border-radius:12px;padding:32px">
<h1 style="font-size:20px;margin:0 0 8px">${ok ? 'Pronto, você foi descadastrado' : 'Link inválido'}</h1>
<p style="color:#6b7280;margin:0">${ok ? 'Você não vai mais receber e-mails sobre esta proposta.' : 'Não encontramos esta proposta.'}</p>
</div></body></html>`

export async function GET(_req: Request, { params }: { params: { token: string } }) {
  const ok = await unsubscribeByToken(params.token)
  return new NextResponse(page(ok), { headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex' } })
}

export async function POST(_req: Request, { params }: { params: { token: string } }) {
  await unsubscribeByToken(params.token)
  return new NextResponse(null, { status: 200 })
}
