'use client'

import { useState, useTransition } from 'react'

type ChargeRow = {
  id: string
  chargeId: string
  clientName: string
  description: string
  amount: number
  status: string
}

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
  open: 'bg-yellow-100 text-yellow-700',
  delivered: 'bg-blue-100 text-blue-700',
}

function ChargesTable({
  title,
  rows,
  onSimulate,
  isPending,
}: {
  title: string
  rows: ChargeRow[]
  onSimulate: (chargeId: string, event: 'PAYMENT_RECEIVED' | 'PAYMENT_OVERDUE') => void
  isPending: boolean
}) {
  if (rows.length === 0) {
    return (
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">{title}</p>
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-sm text-gray-400">
          Nenhuma cobrança encontrada.
        </div>
      </div>
    )
  }

  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-2">{title}</p>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Cliente</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Descrição</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Valor</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Charge ID</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-3 font-medium text-gray-900">{row.clientName}</td>
                <td className="px-4 py-3 text-gray-600">{row.description}</td>
                <td className="px-4 py-3 text-gray-600">
                  R$ {row.amount.toFixed(2).replace('.', ',')}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                      STATUS_COLOR[row.status] ?? 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <code className="font-mono text-xs text-gray-500">{row.chargeId}</code>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onSimulate(row.chargeId, 'PAYMENT_RECEIVED')}
                      disabled={isPending || row.status === 'paid'}
                      className="px-2 py-1 rounded bg-green-600 text-white text-xs font-medium hover:bg-green-700 disabled:opacity-40"
                    >
                      Pago
                    </button>
                    <button
                      onClick={() => onSimulate(row.chargeId, 'PAYMENT_OVERDUE')}
                      disabled={isPending || row.status === 'overdue'}
                      className="px-2 py-1 rounded bg-red-600 text-white text-xs font-medium hover:bg-red-700 disabled:opacity-40"
                    >
                      Atrasado
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function SimuladorClient({
  invoiceRows,
  orderRows,
}: {
  invoiceRows: ChargeRow[]
  orderRows: ChargeRow[]
}) {
  const [invoices, setInvoices] = useState(invoiceRows)
  const [orders, setOrders] = useState(orderRows)
  const [log, setLog] = useState<string[]>([])
  const [isPending, startTransition] = useTransition()

  async function simulate(chargeId: string, event: 'PAYMENT_RECEIVED' | 'PAYMENT_OVERDUE') {
    startTransition(async () => {
      const res = await fetch('/api/dev/pagamento-simulado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chargeId, event }),
      })
      const data = await res.json()
      setLog((prev) => [
        `[${new Date().toLocaleTimeString('pt-BR')}] ${event} → ${data.message ?? data.error}`,
        ...prev,
      ])

      const newStatus = event === 'PAYMENT_RECEIVED' ? 'paid' : 'overdue'
      setInvoices((prev) =>
        prev.map((r) => (r.chargeId === chargeId ? { ...r, status: newStatus } : r)),
      )
      setOrders((prev) =>
        prev.map((r) => (r.chargeId === chargeId ? { ...r, status: newStatus } : r)),
      )
    })
  }

  return (
    <div className="space-y-6">
      <ChargesTable
        title="Assinaturas (faturas)"
        rows={invoices}
        onSimulate={simulate}
        isPending={isPending}
      />
      <ChargesTable
        title="Cobranças avulsas (pedidos / upsells)"
        rows={orders}
        onSimulate={simulate}
        isPending={isPending}
      />

      {/* Event log */}
      {log.length > 0 && (
        <div className="bg-gray-900 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-2 font-mono">LOG</p>
          <div className="space-y-1">
            {log.map((entry, i) => (
              <p key={i} className="text-xs font-mono text-green-400">
                {entry}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
