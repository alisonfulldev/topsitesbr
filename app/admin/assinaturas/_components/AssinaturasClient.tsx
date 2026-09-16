'use client'

import { useState, useTransition } from 'react'
import { deleteSubscription } from '../actions'

export type SubscriptionRow = {
  id: string
  clientId: string
  clientName: string
  planName: string
  planPrice: number
  status: string
  nextDueDate: string | null
  asaasSubscriptionId: string | null
  createdAt: string
}

const STATUS_LABEL: Record<string, string> = {
  active: 'Ativa',
  pending: 'Aguardando pagamento',
  overdue: 'Inadimplente',
  canceled: 'Cancelada',
}

const STATUS_COLOR: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  overdue: 'bg-red-100 text-red-700',
  canceled: 'bg-gray-100 text-gray-500',
}

const FILTER_TABS = [
  { key: 'all', label: 'Todas' },
  { key: 'active', label: 'Ativas' },
  { key: 'pending', label: 'Pendentes' },
  { key: 'overdue', label: 'Inadimplentes' },
  { key: 'canceled', label: 'Canceladas' },
]

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR')
}

function formatPrice(price: number) {
  return `R$ ${price.toFixed(2).replace('.', ',')}`
}

function DeleteButton({ id, clientName, asaasId }: { id: string; clientName: string; asaasId: string | null }) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleDelete() {
    const msg = asaasId
      ? `Excluir assinatura de "${clientName}" do banco?\n\nID Asaas: ${asaasId}\n\nATENÇÃO: o registro no Asaas NÃO será cancelado automaticamente — faça isso manualmente se necessário.`
      : `Excluir assinatura de "${clientName}" do banco? (sem registro no Asaas)`
    if (!confirm(msg)) return
    setError(null)
    startTransition(async () => {
      const result = await deleteSubscription(id)
      if (result.error) setError(result.error)
    })
  }

  return (
    <div>
      <button
        onClick={handleDelete}
        disabled={pending}
        className="px-2.5 py-1 rounded text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 transition-colors"
      >
        {pending ? 'Excluindo…' : 'Excluir'}
      </button>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
}

export function AssinaturasClient({ rows }: { rows: SubscriptionRow[] }) {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = rows.filter((r) => {
    if (filter !== 'all' && r.status !== filter) return false
    if (search && !r.clientName.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const counts = Object.fromEntries(
    FILTER_TABS.map(({ key }) => [
      key,
      key === 'all' ? rows.length : rows.filter((r) => r.status === key).length,
    ]),
  )

  return (
    <div className="space-y-4">
      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Buscar cliente…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-brand/40"
        />
        <div className="flex gap-1 flex-wrap">
          {FILTER_TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === key
                  ? 'bg-brand-dark text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {label}
              <span className="ml-1 opacity-60">({counts[key]})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide">
              <th className="text-left px-4 py-3 font-medium">Cliente</th>
              <th className="text-left px-4 py-3 font-medium">Plano</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Próx. vencimento</th>
              <th className="text-left px-4 py-3 font-medium">Asaas</th>
              <th className="text-left px-4 py-3 font-medium">Criado em</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-400">
                  Nenhuma assinatura encontrada.
                </td>
              </tr>
            )}
            {filtered.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <a
                    href={`/admin/clientes/${row.clientId}/assinatura`}
                    className="font-medium text-gray-900 hover:text-brand-dark transition-colors"
                  >
                    {row.clientName}
                  </a>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {row.planName}
                  <span className="ml-1 text-gray-400">{formatPrice(row.planPrice)}</span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                      STATUS_COLOR[row.status] ?? 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {STATUS_LABEL[row.status] ?? row.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {row.nextDueDate ? formatDate(row.nextDueDate) : '—'}
                </td>
                <td className="px-4 py-3">
                  {row.asaasSubscriptionId ? (
                    <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-mono">
                      {row.asaasSubscriptionId.slice(0, 12)}…
                    </code>
                  ) : (
                    <span className="text-xs bg-orange-50 text-orange-500 px-1.5 py-0.5 rounded font-medium">
                      sem Asaas
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(row.createdAt)}</td>
                <td className="px-4 py-3">
                  <DeleteButton
                    id={row.id}
                    clientName={row.clientName}
                    asaasId={row.asaasSubscriptionId}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400">
        Excluir remove o registro do banco. Se houver ID do Asaas, cancele também manualmente lá.
      </p>
    </div>
  )
}
