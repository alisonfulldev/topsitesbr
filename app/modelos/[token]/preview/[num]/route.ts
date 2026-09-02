import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const HEADERS = {
  'Content-Type': 'text/html; charset=utf-8',
  'X-Frame-Options': 'SAMEORIGIN',
  'Cache-Control': 'private, no-store',
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string; num: string } },
) {
  const slot = params.num === '2' ? 2 : 1

  const presentation = await prisma.templatePresentation.findUnique({
    where: { token: params.token },
    select: { template1Html: true, template2Html: true, status: true },
  })

  if (!presentation || presentation.status === 'cancelado') {
    return new NextResponse('Template não encontrado', { status: 404 })
  }

  const html = slot === 2 ? presentation.template2Html : presentation.template1Html
  if (!html) {
    return new NextResponse('Template não configurado ainda.', {
      status: 404,
      headers: { 'Content-Type': 'text/plain' },
    })
  }

  return new NextResponse(html, { headers: HEADERS })
}
