import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { APP_URL } from '@/lib/config'
import { CopyLinkButton } from '../_components/ProposalLpCard'
import { ReminderButton, ReactivationButton } from '../_components/EmailActionButtons'

export default async function PropostaDetailPage({ params }: { params: { id: string } }) {
  const proposal = await prisma.presentationProposal.findUnique({
    where: { id: params.id },
    include: {
      leads: { orderBy: { capturedAt: 'asc' } },
    },
  })

  if (!proposal) notFound()

  const now = new Date()
  const link = `${APP_URL}/p/${proposal.token}`
  const value = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    Number(proposal.value),
  )

  const isExpired =
    !!proposal.openedAt && !!proposal.expiresAt && proposal.expiresAt < now
  const isActive = !!proposal.openedAt && !proposal.approvedAt && !isExpired

  const statusLabel = proposal.approvedAt
    ? 'Aprovada'
    : !proposal.openedAt
      ? 'Não aberta'
      : isExpired
        ? 'Expirada'
        : 'Ativa'
  const statusClass = proposal.approvedAt
    ? 'bg-yellow-100 text-yellow-700'
    : !proposal.openedAt
      ? 'bg-gray-100 text-gray-500'
      : isExpired
        ? 'bg-red-100 text-red-700'
        : 'bg-green-100 text-green-700'

  function fmt(d: Date | null) {
    if (!d) return '—'
    return new Date(d).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/admin/propostas-lp" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            ← Propostas LP
          </Link>
          <h1 className="text-xl font-bold text-gray-900 mt-1">{proposal.clientName}</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Criada em {fmt(proposal.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isActive && (
            <ReminderButton
              proposalId={proposal.id}
              reminderSentAt={proposal.reminderSentAt}
            />
          )}
          {isExpired && (
            <ReactivationButton
              proposalId={proposal.id}
              reactivationSentAt={proposal.reactivationSentAt}
            />
          )}
          <span className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full ${statusClass}`}>
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Main data */}
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        <div className="px-5 py-4 flex items-center justify-between">
          <span className="text-sm text-gray-500">Valor</span>
          <span className="font-bold text-gray-900">{value}</span>
        </div>
        <div className="px-5 py-4 flex items-center justify-between">
          <span className="text-sm text-gray-500">Aberta em</span>
          <span className="text-sm text-gray-700">{fmt(proposal.openedAt)}</span>
        </div>
        <div className="px-5 py-4 flex items-center justify-between">
          <span className="text-sm text-gray-500">Expira em</span>
          <span className="text-sm text-gray-700">{fmt(proposal.expiresAt)}</span>
        </div>
        <div className="px-5 py-4 flex items-center justify-between">
          <span className="text-sm text-gray-500">Aprovada em</span>
          <span className="text-sm text-gray-700">{fmt(proposal.approvedAt)}</span>
        </div>
        {proposal.reminderSentAt && (
          <div className="px-5 py-4 flex items-center justify-between">
            <span className="text-sm text-gray-500">Lembrete enviado em</span>
            <span className="text-sm text-green-700 font-medium">{fmt(proposal.reminderSentAt)}</span>
          </div>
        )}
        {proposal.reactivationSentAt && (
          <div className="px-5 py-4 flex items-center justify-between">
            <span className="text-sm text-gray-500">Reativação enviada em</span>
            <span className="text-sm text-orange-700 font-medium">{fmt(proposal.reactivationSentAt)}</span>
          </div>
        )}
        <div className="px-5 py-4 flex items-center justify-between gap-3">
          <span className="text-sm text-gray-500 shrink-0">Link</span>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs text-gray-400 truncate font-mono">{link}</span>
            <CopyLinkButton link={link} />
          </div>
        </div>
      </div>

      {/* Scope */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Escopo do Projeto</h2>
        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{proposal.scope}</p>
      </div>

      {/* Details */}
      {proposal.details && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Detalhes Adicionais</h2>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{proposal.details}</p>
        </div>
      )}

      {/* Leads */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-3">
          E-mails captados ({proposal.leads.length})
        </h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {proposal.leads.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              Nenhum e-mail captado ainda.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">E-mail</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Captado em</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {proposal.leads.map((lead) => (
                  <tr key={lead.id}>
                    <td className="px-4 py-3 text-gray-700">{lead.email}</td>
                    <td className="px-4 py-3 text-gray-400">{fmt(lead.capturedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
