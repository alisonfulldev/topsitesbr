import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Prévia enviada como HTML: servida isolada (sandbox sem acesso ao portal) e fora do Google
export async function GET(_req: Request, { params }: { params: { token: string } }) {
  const p = await prisma.onlineProposal.findUnique({ where: { token: params.token }, select: { previewHtml: true, status: true } })
  if (!p?.previewHtml || p.status === 'cancelada') return new NextResponse('Prévia indisponível.', { status: 404 })
  return new NextResponse(p.previewHtml, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Robots-Tag': 'noindex, nofollow',
      'Content-Security-Policy': "sandbox allow-scripts allow-popups allow-forms; frame-ancestors 'self'",
      'Cache-Control': 'private, no-store',
    },
  })
}
