import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { APP_URL } from '@/lib/config'

function statusBadge(status: string) {
  if (status === 'pago') return <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">Pago</span>
  if (status === 'cancelado') return <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">Cancelado</span>
  return <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700">Pendente</span>
}

function planLabel(plan: string | null) {
  if (plan === 'plano1') return 'Site (R$97)'
  if (plan === 'plano2') return 'Essencial (+R$19/mês)'
  if (plan === 'plano3') return 'Completo (+R$19/mês)'
  return '—'
}

export default async function ApresentacoesPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/login')

  const list = await prisma.templatePresentation.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Apresentações de Templates</h2>
          <p className="text-sm text-gray-500 mt-1">
            {list.length} apresentaç{list.length !== 1 ? 'ões' : 'ão'}
          </p>
        </div>
        <Link
          href="/admin/apresentacoes/nova"
          className="bg-brand text-brand-dark text-sm font-semibold px-4 py-2 rounded-lg hover:bg-brand/90 transition-colors"
        >
          + Nova apresentação
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500">Nenhuma apresentação criada ainda.</p>
          <p className="text-sm text-gray-400 mt-2">Crie uma apresentação para enviar ao lead via WhatsApp.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Lead</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Templates</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Plano</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Data</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {list.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors align-top">
                    <td className="px-4 py-3">
                      <p className="text-gray-900 font-medium leading-tight">{p.leadName}</p>
                      {p.leadPhone && (
                        <a
                          href={`https://wa.me/${p.leadPhone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[12px] text-gray-400 hover:text-green-600 transition-colors"
                        >
                          {p.leadPhone}
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-700 text-xs">{p.template1Name}</p>
                      <p className="text-gray-500 text-xs">{p.template2Name}</p>
                    </td>
                    <td className="px-4 py-3">{statusBadge(p.status)}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs hidden sm:table-cell">{planLabel(p.planChosen)}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs hidden md:table-cell">
                      {p.createdAt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/admin/apresentacoes/${p.id}`}
                          className="text-xs text-brand hover:underline"
                        >
                          Detalhes
                        </Link>
                        <a
                          href={`${APP_URL}/modelos/${p.token}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-gray-500 hover:text-gray-800"
                        >
                          Ver link ↗
                        </a>
                      </div>
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
