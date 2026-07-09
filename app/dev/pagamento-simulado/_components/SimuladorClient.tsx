'use client'

import { useState, useTransition } from 'react'

type InvoiceRow = {
  id: string
  chargeId: string
  clientName: string
  planName: string
  amount: number
  status: string
  dueDate: string
}

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
}

export function SimuladorClient({ invoices }: { invoices: InvoiceRow[] }) {
  const [rows, setRows] = useState(invoices)
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
      // Refresh status optimistically
      setRows((prev) =>
        prev.map((r) =>
          r.chargeId === chargeId
            ? { ...r, status: event === 'PAYMENT_RECEIVED' ? 'paid' : 'overdue' }
            : r,
        ),
      )
    })
  }

  return (
    <div className="space-y-6">
      {rows.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-sm text-gray-400">
          Nenhuma fatura com chargeId encontrada. Ative uma assinatura primeiro.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Cliente</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Plano</th>
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
                  <td className="px-4 py-3 text-gray-600">{row.planName}</td>
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
                        onClick={() => simulate(row.chargeId, 'PAYMENT_RECEIVED')}
                        disabled={isPending || row.status === 'paid'}
                        className="px-2 py-1 rounded bg-green-600 text-white text-xs font-medium hover:bg-green-700 disabled:opacity-40"
                      >
                        Pago
                      </button>
                      <button
                        onClick={() => simulate(row.chargeId, 'PAYMENT_OVERDUE')}
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
      )}

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
