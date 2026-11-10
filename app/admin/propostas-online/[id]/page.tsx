import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { notFound, redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { STATUS_LABEL } from '@/lib/online-proposal/config'
import { parseExtras, parseKeys, proposalLink, setupTotal } from '@/lib/online-proposal/service'
import { formatBRL } from '@/lib/monthly-plan'
import { ProposalAdminActions, EmailRowActions } from '../_components/ProposalAdminActions'

export const dynamic = 'force-dynamic'

const fmt = (d: Date | null) =>
  d ? d.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'

const EMAIL_STATUS: Record<string, string> = {
  agendado: 'Agendado', enviando: 'Enviando', enviado: 'Enviado', cancelado: 'Cancelado', erro: 'Erro',
}

export default async function OnlineProposalDetail({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/login')

  const p = await prisma.onlineProposal.findUnique({
    where: { id: params.id },
    include: {
      events: { orderBy: { createdAt: 'desc' } },
      emails: { orderBy: [{ round: 'desc' }, { step: 'asc' }] },
    },
  })
  if (!p) notFound()

  const extras = parseExtras(p.extras)
  const selected = parseKeys(p.selectedExtras)
  const link = proposalLink(p.token)
  const card = 'bg-white rounded-xl border border-gray-200 p-5 mb-4'
  const th = 'text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider'

  return (
    <div className="max-w-5xl">
      <div className="flex items-center gap-2 mb-1 text-sm text-gray-500">
        <Link href="/admin/propostas-online" className="hover:text-gray-800">Propostas online</Link><span>/</span><span>{p.name}</span>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        {p.name}{p.company ? ` — ${p.company}` : ''}{' '}
        <span className="ml-2 align-middle inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">{STATUS_LABEL[p.status] ?? p.status}</span>
      </h2>

      <div className={card}>
        <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
          <div><dt className="text-xs text-gray-500">E-mail</dt><dd className="text-gray-900 break-all">{p.email}</dd></div>
          <div><dt className="text-xs text-gray-500">WhatsApp</dt><dd className="text-gray-900">{p.whatsapp ?? '—'}</dd></div>
          <div><dt className="text-xs text-gray-500">CNPJ/CPF</dt><dd className="text-gray-900">{p.document ?? '—'}</dd></div>
          <div><dt className="text-xs text-gray-500">Plano</dt><dd className="text-gray-900">{p.planName}</dd></div>
          <div><dt className="text-xs text-gray-500">Setup (com extras)</dt><dd className="text-gray-900">{formatBRL(setupTotal(p))}</dd></div>
          <div><dt className="text-xs text-gray-500">Mensalidade</dt><dd className="text-gray-900">{formatBRL(Number(p.monthlyPrice))}/mês</dd></div>
          <div><dt className="text-xs text-gray-500">Extras oferecidos</dt><dd className="text-gray-900">{extras.length ? extras.map((e) => `${e.name}${selected.includes(e.key) ? ' ✓' : ''}`).join(', ') : '—'}</dd></div>
          <div><dt className="text-xs text-gray-500">Ajustes</dt><dd className="text-gray-900">{p.revisionsUsed} de {p.maxRevisions}</dd></div>
          <div><dt className="text-xs text-gray-500">Link expira em</dt><dd className="text-gray-900">{fmt(p.expiresAt)}</dd></div>
          <div className="sm:col-span-3"><dt className="text-xs text-gray-500">Prévia</dt><dd className="text-gray-900 break-all">{p.previewHtml ? 'HTML enviado' : p.previewUrl ?? 'não cadastrada'}</dd></div>
          {p.signedAt && (
            <div className="sm:col-span-3"><dt className="text-xs text-gray-500">Assinatura</dt><dd className="text-gray-900 break-all">{p.signerName} · CPF {p.signerDocument} · {fmt(p.signedAt)} · IP {p.signerIp ?? '—'} · hash {p.contractHash}</dd></div>
          )}
          {p.clientId && (
            <div className="sm:col-span-3"><dt className="text-xs text-gray-500">Cliente</dt><dd><Link href={`/admin/clientes/${p.clientId}`} className="text-brand-text hover:underline">Abrir cadastro do cliente →</Link></dd></div>
          )}
        </dl>
      </div>

      <ProposalAdminActions id={p.id} status={p.status} link={link} sequencePaused={p.sequencePaused} unsubscribed={!!p.unsubscribedAt} />

      <div className={card}>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Sequência de e-mails</h3>
        {p.emails.length === 0 ? (
          <p className="text-sm text-gray-500">A sequência começa quando você envia a prévia.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50"><tr>{['Rodada', 'E-mail', 'Agendado', 'Status', 'Enviado', 'Aberto*', 'Clicado', ''].map((h) => <th key={h} className={th}>{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-100">
                {p.emails.map((e) => (
                  <tr key={e.id}>
                    <td className="px-3 py-2 text-gray-500">{e.round}</td>
                    <td className="px-3 py-2 text-gray-900">{e.step + 1}{e.subject ? <span className="block text-xs text-gray-500">{e.subject}</span> : null}</td>
                    <td className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap">{fmt(e.scheduledAt)}</td>
                    <td className="px-3 py-2 text-xs">{EMAIL_STATUS[e.status] ?? e.status}{e.error ? <span className="block text-gray-400">{e.error}</span> : null}</td>
                    <td className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap">{fmt(e.sentAt)}</td>
                    <td className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap">{fmt(e.openedAt)}</td>
                    <td className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap">{fmt(e.clickedAt)}</td>
                    <td className="px-3 py-2"><EmailRowActions proposalId={p.id} emailId={e.id} canResend={e.status !== 'agendado' && e.status !== 'enviando'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-xs text-gray-400">* Abertura é indicativa: Gmail e iPhone abrem imagens automaticamente. Cliques são confiáveis.</p>
          </div>
        )}
      </div>

      <div className={card}>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Histórico</h3>
        <ul className="divide-y divide-gray-100">
          {p.events.map((ev) => (
            <li key={ev.id} className="py-2 text-sm">
              <span className="text-xs text-gray-500 mr-3 whitespace-nowrap">{fmt(ev.createdAt)}</span>
              <span className="font-medium text-gray-800">{ev.type.startsWith('status:') ? (STATUS_LABEL[ev.type.slice(7)] ?? ev.type) : ev.type.replace(/_/g, ' ')}</span>
              {ev.detail && <span className="block text-gray-600 whitespace-pre-line">{ev.detail}</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
