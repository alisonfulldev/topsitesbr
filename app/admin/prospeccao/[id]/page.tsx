import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { notFound, redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Badge, Card } from '@/components/ui'
import { getProspectingConfig } from '@/lib/prospecting/config'
import { EMAIL_STATUS, EVENT_LABEL, PROSPECT_STATUS, fmtDateTimeSP } from '@/lib/prospecting/labels'
import { ProspectActions } from './ProspectActions'
import { EmailEditor } from './EmailEditor'

export const dynamic = 'force-dynamic'

export default async function ProspectDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/login')

  const [config, prospect] = await Promise.all([
    getProspectingConfig(),
    prisma.prospect.findUnique({
      where: { id: params.id },
      include: { emails: { orderBy: { step: 'asc' } }, events: { orderBy: { createdAt: 'desc' }, take: 100 } },
    }),
  ])
  if (!prospect) notFound()
  const status = PROSPECT_STATUS[prospect.status]

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div>
        <Link href="/admin/prospeccao" className="text-sm text-gray-500 hover:text-gray-800">← Prospecção</Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-semibold text-gray-900">{prospect.business}</h2>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
        {prospect.stopReason && <p className="mt-1 text-sm text-gray-500">Motivo: {prospect.stopReason}</p>}
      </div>

      <Card>
        <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          <div><dt className="inline text-gray-500">Nome: </dt><dd className="inline">{prospect.name}</dd></div>
          <div><dt className="inline text-gray-500">E-mail: </dt><dd className="inline break-all">{prospect.email}</dd></div>
          {prospect.segment && <div><dt className="inline text-gray-500">Segmento: </dt><dd className="inline">{prospect.segment}</dd></div>}
          {prospect.site && <div><dt className="inline text-gray-500">Site: </dt><dd className="inline break-all">{prospect.site}</dd></div>}
          {prospect.score !== null && <div><dt className="inline text-gray-500">Nota: </dt><dd className="inline">{prospect.score}</dd></div>}
          <div><dt className="inline text-gray-500">Cadastrado: </dt><dd className="inline">{fmtDateTimeSP(prospect.createdAt)}</dd></div>
        </dl>
        <div className="mt-5 border-t border-gray-100 pt-4">
          <ProspectActions id={prospect.id} status={prospect.status} testEmail={config.testEmail} />
          {!config.liveMode && prospect.status === 'ativo' && (
            <p className="mt-3 text-xs text-yellow-700">Modo teste: os e-mails estão agendados, mas só saem depois que você ligar os envios reais.</p>
          )}
        </div>
      </Card>

      <div className="space-y-3">
        {prospect.emails.map((email) => {
          const s = EMAIL_STATUS[email.status]
          const tracking = [
            email.deliveredAt && 'entregue ' + fmtDateTimeSP(email.deliveredAt),
            email.openedAt && 'aberto ' + fmtDateTimeSP(email.openedAt),
            email.clickedAt && 'clicou no WhatsApp ' + fmtDateTimeSP(email.clickedAt),
            email.bouncedAt && 'bounce ' + fmtDateTimeSP(email.bouncedAt),
            email.complainedAt && 'spam ' + fmtDateTimeSP(email.complainedAt),
          ].filter(Boolean)
          const when = email.sentAt
            ? 'Enviado ' + fmtDateTimeSP(email.sentAt)
            : email.status === 'agendado' && email.scheduledAt ? 'Previsto ' + fmtDateTimeSP(email.scheduledAt) : ''
          return (
            <Card key={email.id}>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">E-mail {email.step}</span>
                  <Badge variant={s.variant}>{s.label}</Badge>
                </div>
                <span className="text-xs text-gray-500">{when}</span>
              </div>
              {tracking.length > 0 && <p className="mb-3 text-xs text-gray-500">{tracking.join(' · ')}</p>}
              {email.lastError && <p className="mb-3 rounded bg-red-50 px-2 py-1 text-xs text-red-700">{email.lastError}</p>}
              <details>
                <summary className="cursor-pointer text-sm text-gray-700">{email.subject}</summary>
                <div className="mt-3">
                  <EmailEditor id={email.id} subject={email.subject} body={email.body} editable={email.status === 'rascunho' || email.status === 'agendado'} />
                </div>
              </details>
            </Card>
          )
        })}
      </div>

      <Card>
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Histórico</h3>
        <ul className="space-y-2 text-sm">
          {prospect.events.map((event) => (
            <li key={event.id} className="flex gap-3">
              <span className="w-24 shrink-0 text-xs text-gray-400">{fmtDateTimeSP(event.createdAt)}</span>
              <span className="text-gray-700">
                {EVENT_LABEL[event.type] ?? event.type}
                {event.detail && <span className="text-gray-500"> — {event.detail}</span>}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
