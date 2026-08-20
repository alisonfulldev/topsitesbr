import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type ProjectType = 'landing_page' | 'institucional' | 'loja_virtual'

function typeLabel(t: string) {
  if (t === 'landing_page')  return 'Landing Page'
  if (t === 'loja_virtual')  return 'Loja Virtual'
  return 'Institucional'
}

function fmtBRL(v: number | string) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtDate(d: Date) {
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export default async function OrcamentosAdminPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/login')

  const leads = await prisma.quoteLead.findMany({ orderBy: { createdAt: 'desc' } })

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Orçamentos</h1>
          <p className="text-sm text-gray-400 mt-1">
            {leads.length} orçamento{leads.length !== 1 ? 's' : ''} recebido{leads.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {leads.length === 0 ? (
        <div className="rounded-xl border border-brand-dark-border bg-brand-dark p-12 text-center">
          <p className="text-gray-400">Nenhum orçamento recebido ainda.</p>
          <p className="text-sm text-gray-600 mt-2">Os leads do formulário <strong>/orcamento</strong> aparecem aqui.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-brand-dark-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-dark-border bg-brand-dark">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Nome</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">E-mail</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Tipo</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Páginas</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Segmento</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Adicionais</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Valor</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-dark-border">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-brand-dark-hover transition-colors">
                    <td className="px-4 py-3 text-white font-medium">{lead.name}</td>
                    <td className="px-4 py-3 text-gray-300">
                      <a href={`mailto:${lead.email}`} className="hover:text-brand transition-colors">
                        {lead.email}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{typeLabel(lead.projectType)}</td>
                    <td className="px-4 py-3 text-gray-300 hidden md:table-cell">
                      {lead.projectType === 'institucional' && lead.pageCount != null
                        ? `${lead.pageCount} pág.`
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-400 hidden lg:table-cell max-w-xs truncate">
                      {lead.segment}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {lead.hasAdmin && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-900/40 text-blue-300 border border-blue-800/50">Admin</span>
                        )}
                        {!lead.hasLogo && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-900/40 text-purple-300 border border-purple-800/50">Logo</span>
                        )}
                        {!lead.hasDomain && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-900/40 text-amber-300 border border-amber-800/50">Domínio</span>
                        )}
                        {!lead.hasAdmin && lead.hasLogo && lead.hasDomain && (
                          <span className="text-gray-600 text-xs">Nenhum</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-brand font-bold">{fmtBRL(lead.totalValue)}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs hidden sm:table-cell whitespace-nowrap">
                      {fmtDate(lead.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
