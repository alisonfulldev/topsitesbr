import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string; num: string } },
) {
  const presentation = await prisma.templatePresentation.findUnique({
    where: { token: params.token },
    select: { template1Html: true, template2Html: true, status: true },
  })

  if (!presentation || presentation.status === 'cancelado') {
    return new NextResponse('Not found', { status: 404 })
  }

  const html = params.num === '2' ? presentation.template2Html : presentation.template1Html

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Frame-Options': 'SAMEORIGIN',
      'Cache-Control': 'private, no-store',
    },
  })
}
