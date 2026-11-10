import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { STATUS_LABEL } from '@/lib/online-proposal/config'
import { formatBRL } from '@/lib/monthly-plan'

export const dynamic = 'force-dynamic'

const STATUS_COLOR: Record<string, string> = {
  prospect: 'bg-gray-100 text-gray-700',
  previa_enviada: 'bg-blue-50 text-blue-700',
  ajuste_solicitado: 'bg-amber-50 text-amber-700',
  aprovada: 'bg-indigo-50 text-indigo-700',
  contrato_assinado: 'bg-purple-50 text-purple-700',
  ativo: 'bg-green-50 text-green-700',
  expirada: 'bg-gray-100 text-gray-500',
  cancelada: 'bg-red-50 text-red-700',
}

export default async function OnlineProposalsPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/login')

  const proposals = await prisma.onlineProposal.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, company: true, planName: true, setupPrice: true, monthlyPrice: true, status: true, expiresAt: true, updatedAt: true },
    take: 200,
  })

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Propostas online</h2>
          <p className="text-sm text-gray-500 mt-1">Prévia → aprovação → contrato → pagamento, com sequência automática de e-mails</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/propostas-online/configuracoes" className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Configurações</Link>
          <Link href="/admin/propostas-online/nova" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700">Nova proposta</Link>
        </div>
      </div>

      {proposals.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-500">Nenhuma proposta online ainda.</div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Prospect', 'Plano', 'Valores', 'Status', 'Expira em', 'Atualizado'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {proposals.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/propostas-online/${p.id}`} className="font-medium text-gray-900 hover:underline">{p.name}</Link>
                    {p.company && <p className="text-xs text-gray-500">{p.company}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{p.planName}</td>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{formatBRL(Number(p.setupPrice))} + {formatBRL(Number(p.monthlyPrice))}/mês</td>
                  <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLOR[p.status] ?? ''}`}>{STATUS_LABEL[p.status] ?? p.status}</span></td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{p.expiresAt.toLocaleDateString('pt-BR')}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{p.updatedAt.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
