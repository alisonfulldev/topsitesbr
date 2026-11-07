import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { getProspectingConfig } from '@/lib/prospecting/config'
import { whatsappUrl } from '@/lib/prospecting/render'
import { WhatsappRedirect } from './WhatsappRedirect'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Abrindo o WhatsApp', robots: { index: false, follow: false } }

// Redirecionador do {{link_whatsapp}}: registra o clique e abre o WhatsApp com a mensagem pronta
export default async function Page({ params, searchParams }: { params: { id: string }; searchParams: { teste?: string } }) {
  const [config, email] = await Promise.all([
    getProspectingConfig(),
    prisma.prospectEmail.findUnique({ where: { id: params.id }, select: { id: true, prospect: { select: { name: true, business: true } } } }),
  ])
  const waUrl = whatsappUrl(config, email?.prospect ?? { name: '', business: 'minha empresa' })
  return <WhatsappRedirect emailId={email?.id ?? ''} test={searchParams.teste === '1'} waUrl={waUrl} />
}
