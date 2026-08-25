import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { APP_URL } from '@/lib/config'
import DiscountButton from './_components/DiscountButton'

function typeLabel(t: string) {
  if (t === 'landing_page') return 'Landing Page'
  if (t === 'loja_virtual') return 'Loja Virtual'
  return 'Institucional'
}

function fmtBRL(v: { toNumber(): number } | number | string) {
  const n = typeof v === 'object' ? v.toNumber() : Number(v)
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtDate(d: Date) {
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

export default async function OrcamentosAdminPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/login')

  const leads = await prisma.quoteLead.findMany({ orderBy: { createdAt: 'desc' } })

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Orçamentos</h2>
        <p className="text-sm text-gray-500 mt-1">
          {leads.length} orçamento{leads.length !== 1 ? 's' : ''} recebido{leads.length !== 1 ? 's' : ''}
        </p>
      </div>

      {leads.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500">Nenhum orçamento recebido ainda.</p>
          <p className="text-sm text-gray-400 mt-2">Os leads do formulário <strong>/orcamento</strong> aparecem aqui.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Lead</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Projeto</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Adicionais</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Valor</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Data</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Desconto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors align-top">

                    {/* Lead — nome + email + fone */}
                    <td className="px-4 py-3">
                      <p className="text-gray-900 font-semibold leading-tight">{lead.name}</p>
                      <a
                        href={`mailto:${lead.email}`}
                        className="text-[12px] text-gray-500 hover:text-gray-800 transition-colors"
                      >
                        {lead.email}
                      </a>
                      {lead.phone && (
                        <a
                          href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-[12px] text-gray-400 hover:text-green-600 transition-colors"
                        >
                          {lead.phone}
                        </a>
                      )}
                    </td>

                    {/* Projeto — tipo + segmento + link */}
                    <td className="px-4 py-3">
                      <p className="text-gray-800 font-medium leading-tight">
                        {typeLabel(lead.projectType)}
                        {lead.projectType === 'institucional' && lead.pageCount != null && (
                          <span className="text-gray-400 font-normal"> · {lead.pageCount} pág.</span>
                        )}
                      </p>
                      <p className="text-[12px] text-gray-400 mt-0.5 truncate max-w-[200px]">{lead.segment}</p>
                      {lead.token && (
                        <a
                          href={`${APP_URL}/orcamento/${lead.token}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-amber-600 hover:underline"
                        >
                          ver orçamento →
                        </a>
                      )}
                    </td>

                    {/* Adicionais */}
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {lead.hasAdmin && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">Admin</span>
                        )}
                        {!lead.hasLogo && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">Logo</span>
                        )}
                        {!lead.hasDomain && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">Domínio</span>
                        )}
                        {!lead.hasAdmin && lead.hasLogo && lead.hasDomain && (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </div>
                    </td>

                    {/* Valor */}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <span className="text-gray-900 font-bold">{fmtBRL(lead.totalValue)}</span>
                    </td>

                    {/* Data */}
                    <td className="px-4 py-3 text-gray-400 text-xs hidden sm:table-cell whitespace-nowrap">
                      {fmtDate(lead.createdAt)}
                    </td>

                    {/* Desconto */}
                    <td className="px-4 py-3">
                      <DiscountButton
                        leadId={lead.id}
                        name={lead.name}
                        totalValue={lead.totalValue.toNumber()}
                        discountType={lead.discountType}
                        discountValue={lead.discountValue ? lead.discountValue.toNumber() : null}
                        discountedTotal={lead.discountedTotal ? lead.discountedTotal.toNumber() : null}
                        discountSentAt={lead.discountSentAt ? lead.discountSentAt.toISOString() : null}
                        discountExpiresAt={lead.discountExpiresAt ? lead.discountExpiresAt.toISOString() : null}
                      />
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
