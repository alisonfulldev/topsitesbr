import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { notFound, redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cn } from '@/lib/utils'
import { Badge, Card } from '@/components/ui'
import { windowOpen } from '@/lib/whatsapp/rules'
import { WA_AUTHOR, WA_CATEGORY, WA_KIND, WA_MESSAGE_STATUS, fmtDateTimeSP } from '@/lib/whatsapp/labels'
import { ContactControls } from './ContactControls'
import { ReplyBox } from './ReplyBox'

export const dynamic = 'force-dynamic'

export default async function WhatsappContactPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/login')

  const contact = await prisma.waContact.findUnique({
    where: { id: params.id },
    include: {
      client: { select: { id: true, name: true } },
      messages: { orderBy: { sentAt: 'desc' }, take: 300 },
    },
  })
  if (!contact) notFound()
  const messages = [...contact.messages].reverse()
  const now = new Date()
  const human = contact.humanUntil && contact.humanUntil > now

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/admin/whatsapp" className="text-sm text-gray-500 hover:text-gray-800">← WhatsApp</Link>
      <div className="mb-5 mt-2 flex flex-wrap items-center gap-2">
        <h2 className="text-xl font-semibold text-gray-900">{contact.name ?? contact.waId}</h2>
        <Badge variant={WA_CATEGORY[contact.category].variant}>{WA_CATEGORY[contact.category].label}</Badge>
        {human && <Badge variant="pink">Você atendendo até {fmtDateTimeSP(contact.humanUntil)}</Badge>}
        {contact.optedOutAt && <Badge variant="error">Descadastrado</Badge>}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <Card padding="none" className="order-2 lg:order-1">
          <div className="border-b border-gray-100 px-4 py-3 text-xs text-gray-500">
            {messages.length} mensagem(ns){contact.messages.length === 300 ? ' (as 300 mais recentes)' : ''} ·{' '}
            janela de 24h {windowOpen(contact, now) ? <span className="font-medium text-green-700">aberta</span> : 'fechada'}
          </div>
          <div className="max-h-[70vh] space-y-2 overflow-y-auto bg-gray-50 p-4">
            {messages.length === 0 && <p className="text-sm text-gray-500">Nenhuma mensagem ainda.</p>}
            {messages.map((m) => {
              const out = m.direction === 'out'
              const st = WA_MESSAGE_STATUS[m.status]
              return (
                <div key={m.id} className={cn('flex', out ? 'justify-end' : 'justify-start')}>
                  <div
                    className={cn(
                      'max-w-[85%] rounded-xl px-3 py-2 text-sm shadow-sm',
                      out ? (m.author === 'voce' ? 'bg-green-100' : 'bg-blue-50 ring-1 ring-blue-100') : 'bg-white',
                      m.status === 'simulada' && 'border border-dashed border-yellow-400',
                    )}
                  >
                    <p className="mb-0.5 text-[11px] font-medium text-gray-500">
                      {WA_AUTHOR[m.author] ?? m.author}{m.kind ? ` · ${WA_KIND[m.kind] ?? m.kind}` : ''}
                    </p>
                    <p className="whitespace-pre-wrap break-words text-gray-900">{m.body}</p>
                    {m.aiReason && <p className="mt-1 text-[11px] italic text-gray-500">Por quê: {m.aiReason}</p>}
                    {m.error && <p className="mt-1 text-[11px] text-red-700">{m.error}</p>}
                    <p className="mt-1 flex items-center justify-end gap-1.5 text-[10px] text-gray-400">
                      {fmtDateTimeSP(m.sentAt)}
                      {out && st && m.status !== 'historico' && <Badge variant={st.variant}>{st.label}</Badge>}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
          <ReplyBox contactId={contact.id} windowOpen={windowOpen(contact, now)} blocked={!!contact.optedOutAt} />
        </Card>

        <div className="order-1 space-y-4 lg:order-2">
          <Card>
            <h3 className="mb-2 text-sm font-semibold text-gray-900">O que a IA entendeu</h3>
            <p className="text-sm text-gray-700">{contact.summary ?? 'Ainda não analisado.'}</p>
            {contact.interest && <p className="mt-2 text-xs text-gray-500">Interesse: {contact.interest}</p>}
            <dl className="mt-3 space-y-1 text-xs text-gray-500">
              <div>Número: {contact.waId}</div>
              {contact.client && (
                <div>Cliente: <Link href={'/admin/clientes/' + contact.client.id} className="underline">{contact.client.name}</Link></div>
              )}
              <div>Analisado em: {fmtDateTimeSP(contact.analyzedAt)}</div>
              <div>Follow-ups nesta conversa: {contact.followUpCount}</div>
              <div>Última oferta: {fmtDateTimeSP(contact.lastOfferAt)}</div>
            </dl>
          </Card>
          <ContactControls
            id={contact.id}
            category={contact.category}
            categoryByAdmin={contact.categoryByAdmin}
            aiPaused={contact.aiPaused}
            optedOut={!!contact.optedOutAt}
            humanActive={!!human}
          />
        </div>
      </div>
    </div>
  )
}
