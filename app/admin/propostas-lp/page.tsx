import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { APP_URL } from '@/lib/config'
import { CopyLinkButton } from './_components/ProposalLpCard'
import { ReminderButton, ReactivationButton } from './_components/EmailActionButtons'

type Status = 'aprovada' | 'ativa' | 'expirada' | 'nao_aberta'

function getStatus(p: {
  openedAt: Date | null
  expiresAt: Date | null
  approvedAt: Date | null
}): Status {
  const now = new Date()
  if (p.approvedAt) return 'aprovada'
  if (!p.openedAt) return 'nao_aberta'
  if (p.expiresAt && p.expiresAt < now) return 'expirada'
  return 'ativa'
}

const STATUS_LABEL: Record<Status, string> = {
  aprovada: 'Aprovada',
  ativa: 'Ativa',
  expirada: 'Expirada',
  nao_aberta: 'Não aberta',
}

const STATUS_CLASS: Record<Status, string> = {
  aprovada: 'bg-yellow-100 text-yellow-700',
  ativa: 'bg-green-100 text-green-700',
  expirada: 'bg-red-100 text-red-700',
  nao_aberta: 'bg-gray-100 text-gray-500',
}

export default async function PropostasLpPage() {
  const proposals = await prisma.presentationProposal.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { leads: true } } },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Propostas LP</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Propostas-apresentação com link único para o cliente.
          </p>
        </div>
        <Link
          href="/admin/propostas-lp/nova"
          className="bg-brand text-brand-dark font-bold text-sm px-4 py-2 rounded-lg hover:bg-brand-hover transition-colors"
        >
          + Nova Proposta
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Cliente</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Valor</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Leads</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Criada em</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Link</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">E-mail</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {proposals.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400 text-sm">
                    Nenhuma proposta criada ainda.{' '}
                    <Link href="/admin/propostas-lp/nova" className="text-brand-text underline">
                      Criar primeira proposta
                    </Link>
                  </td>
                </tr>
              )}
              {proposals.map((p) => {
                const status = getStatus(p)
                const link = `${APP_URL}/p/${p.token}`
                const value = new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(Number(p.value))
                const date = new Date(p.createdAt).toLocaleDateString('pt-BR')

                return (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{p.clientName}</td>
                    <td className="px-4 py-3 font-semibold text-gray-700">{value}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_CLASS[status]}`}>
                        {STATUS_LABEL[status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{p._count.leads}</td>
                    <td className="px-4 py-3 text-gray-400">{date}</td>
                    <td className="px-4 py-3">
                      <CopyLinkButton link={link} />
                    </td>
                    <td className="px-4 py-3">
                      {status === 'ativa' && (
                        <ReminderButton
                          proposalId={p.id}
                          reminderSentAt={p.reminderSentAt}
                        />
                      )}
                      {status === 'expirada' && (
                        <ReactivationButton
                          proposalId={p.id}
                          reactivationSentAt={p.reactivationSentAt}
                        />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/propostas-lp/${p.id}`}
                        className="text-xs text-gray-400 hover:text-gray-700 transition-colors font-medium"
                      >
                        Ver →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
