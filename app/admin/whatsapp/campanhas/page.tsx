import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Badge, Card, EmptyState } from '@/components/ui'
import { WA_CAMPAIGN_STATUS, WA_CATEGORY } from '@/lib/whatsapp/labels'
import { CampaignForm } from './CampaignForm'

export const dynamic = 'force-dynamic'

export default async function CampanhasPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/login')

  const [campaigns, stats] = await Promise.all([
    prisma.waCampaign.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.waCampaignSend.groupBy({ by: ['campaignId', 'status'], _count: true }),
  ])
  const statOf = (id: string, status: string) => stats.find((s) => s.campaignId === id && s.status === status)?._count ?? 0

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/admin/whatsapp" className="text-sm text-gray-500 hover:text-gray-800">← WhatsApp</Link>
      <h2 className="mb-1 mt-2 text-xl font-semibold text-gray-900">Campanhas de oferta</h2>
      <p className="mb-5 text-sm text-gray-500">
        A IA lê a conversa de cada contato e personaliza a oferta. Quem não tem a ver com a oferta é pulado, com o motivo registrado.
      </p>

      {campaigns.length === 0 ? (
        <EmptyState title="Nenhuma campanha ainda" description="Crie a primeira abaixo. Ela começa como rascunho e só envia depois que você ativar." />
      ) : (
        <div className="mb-6 space-y-3">
          {campaigns.map((c) => (
            <Link key={c.id} href={'/admin/whatsapp/campanhas/' + c.id} className="block">
              <Card className="hover:border-gray-300">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-gray-900">{c.name}</span>
                  <Badge variant={WA_CAMPAIGN_STATUS[c.status]?.variant ?? 'neutral'}>{WA_CAMPAIGN_STATUS[c.status]?.label ?? c.status}</Badge>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-gray-600">{c.offer}</p>
                <p className="mt-2 text-xs text-gray-500">
                  Para: {c.categories.map((k) => WA_CATEGORY[k].label).join(', ')} · Modelo: {c.templateName ?? 'nenhum (só janela aberta)'} ·{' '}
                  {statOf(c.id, 'enviado')} enviada(s), {statOf(c.id, 'simulado')} simulada(s), {statOf(c.id, 'pulado')} pulada(s), {statOf(c.id, 'falhou')} falha(s)
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <CampaignForm />
    </div>
  )
}
