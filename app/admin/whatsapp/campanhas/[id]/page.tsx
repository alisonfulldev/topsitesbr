import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { notFound, redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Badge, Card, EmptyState } from '@/components/ui'
import { WA_CAMPAIGN_STATUS, WA_CATEGORY, WA_SEND_STATUS, fmtDateTimeSP } from '@/lib/whatsapp/labels'
import { CampaignActions } from './CampaignActions'

export const dynamic = 'force-dynamic'

export default async function CampanhaPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/login')

  const campaign = await prisma.waCampaign.findUnique({
    where: { id: params.id },
    include: { sends: { orderBy: { createdAt: 'desc' }, take: 300, include: { contact: { select: { id: true, name: true, waId: true } } } } },
  })
  if (!campaign) notFound()
  const audience = await prisma.waContact.count({ where: { category: { in: campaign.categories }, optedOutAt: null, aiPaused: false } })
  const st = WA_CAMPAIGN_STATUS[campaign.status]

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/admin/whatsapp/campanhas" className="text-sm text-gray-500 hover:text-gray-800">← Campanhas</Link>
      <div className="mb-5 mt-2 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-gray-900">{campaign.name}</h2>
          <Badge variant={st?.variant ?? 'neutral'}>{st?.label ?? campaign.status}</Badge>
        </div>
        <CampaignActions id={campaign.id} status={campaign.status} />
      </div>

      <Card className="mb-5">
        <p className="whitespace-pre-wrap text-sm text-gray-800">{campaign.offer}</p>
        <dl className="mt-3 space-y-1 text-xs text-gray-500">
          <div>Para: {campaign.categories.map((k) => WA_CATEGORY[k].label).join(', ')} · {audience} contato(s) no público hoje</div>
          <div>Modelo: {campaign.templateName ? `${campaign.templateName} (${campaign.templateLanguage}) — ${campaign.templateBody}` : 'nenhum: só alcança quem está com a janela de 24h aberta'}</div>
        </dl>
      </Card>

      {campaign.sends.length === 0 ? (
        <EmptyState title="Nada enviado ainda" description="Com a campanha ativa, a IA manda poucas por vez, no horário configurado e dentro do limite diário." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <ul className="divide-y divide-gray-100">
            {campaign.sends.map((s) => (
              <li key={s.id} className="px-4 py-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Link href={'/admin/whatsapp/' + s.contact.id} className="font-medium text-gray-900 hover:underline">{s.contact.name ?? s.contact.waId}</Link>
                  <span className="flex items-center gap-2 text-xs text-gray-500">
                    {fmtDateTimeSP(s.createdAt)}
                    <Badge variant={WA_SEND_STATUS[s.status]?.variant ?? 'neutral'}>{WA_SEND_STATUS[s.status]?.label ?? s.status}</Badge>
                  </span>
                </div>
                {s.reason && <p className="mt-1 text-xs text-gray-500">{s.reason}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
