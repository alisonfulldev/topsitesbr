'use client'

import { useState, useTransition } from 'react'
import { markOrderDelivered } from '../actions'

type Order = {
  id: string
  clientName: string
  clientId: string
  productName: string
  amount: number
  status: 'pending' | 'paid' | 'delivered'
  asaasChargeId: string | null
  createdAt: string
}

interface Props {
  orders: Order[]
}

const STATUS_LABEL: Record<Order['status'], string> = {
  pending: 'Aguardando pagamento',
  paid: 'Pago — executar',
  delivered: 'Entregue',
}

const STATUS_BADGE: Record<Order['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  delivered: 'bg-gray-100 text-gray-500',
}

export function PedidosClient({ orders }: Props) {
  const [filter, setFilter] = useState<'todos' | Order['status']>('todos')
  const [isPending, startTransition] = useTransition()

  const filtered = filter === 'todos' ? orders : orders.filter((o) => o.status === filter)

  function handleDeliver(id: string) {
    startTransition(() => markOrderDelivered(id))
  }

  return (
    <div>
      {/* Filtros */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {(['todos', 'paid', 'pending', 'delivered'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              filter === s
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {s === 'todos' ? 'Todos' : STATUS_LABEL[s]}
            <span className="ml-1.5 text-xs opacity-60">
              {s === 'todos' ? orders.length : orders.filter((o) => o.status === s).length}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-sm text-gray-400">
          Nenhum pedido encontrado.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {filtered.map((order) => (
            <div key={order.id} className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-gray-900">{order.clientName}</span>
                  <span className="text-gray-300">·</span>
                  <span className="text-sm text-gray-600">{order.productName}</span>
                </div>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </span>
                  {order.asaasChargeId && (
                    <span className="text-xs text-gray-400 font-mono">{order.asaasChargeId}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-sm font-semibold text-gray-900">
                  R$ {order.amount.toFixed(2).replace('.', ',')}
                </span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_BADGE[order.status]}`}>
                  {STATUS_LABEL[order.status]}
                </span>
                {order.status === 'paid' && (
                  <button
                    onClick={() => handleDeliver(order.id)}
                    disabled={isPending}
                    className="text-xs px-3 py-1.5 rounded-lg bg-gray-900 text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
                  >
                    Marcar entregue
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
