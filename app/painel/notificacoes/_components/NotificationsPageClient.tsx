'use client'

import { useState, useTransition } from 'react'
import { markNotificationRead, markAllNotificationsRead } from '../../actions'

type NotifItem = {
  id: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const CHANNEL_LABEL: Record<string, string> = {
  painel: 'Painel',
  email: 'E-mail',
  whatsapp: 'WhatsApp',
}

export function NotificationsPageClient({
  notifications: initial,
}: {
  notifications: (NotifItem & { channel: string })[]
}) {
  const [items, setItems] = useState(initial)
  const [isPending, startTransition] = useTransition()

  const unread = items.filter((n) => !n.read).length

  function handleMarkRead(id: string) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    startTransition(() => markNotificationRead(id))
  }

  function handleMarkAll() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })))
    startTransition(() => markAllNotificationsRead())
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Notificações</h2>
          {unread > 0 && (
            <p className="text-sm text-gray-500 mt-0.5">
              {unread} não lida{unread !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        {unread > 0 && (
          <button
            onClick={handleMarkAll}
            disabled={isPending}
            className="text-sm text-indigo-600 hover:underline disabled:opacity-50"
          >
            Marcar todas como lidas
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-sm text-gray-400">
          Nenhuma notificação ainda.
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((n) => (
            <li
              key={n.id}
              className={`bg-white rounded-xl border p-4 flex items-start gap-4 transition-colors ${
                !n.read ? 'border-indigo-200 bg-indigo-50/30' : 'border-gray-200'
              }`}
            >
              <div
                className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                  !n.read ? 'bg-indigo-500' : 'bg-gray-200'
                }`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-medium ${!n.read ? 'text-gray-900' : 'text-gray-600'}`}>
                    {n.title}
                  </p>
                  <span className="text-xs text-gray-400 shrink-0">{formatDate(n.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{n.message}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                    {CHANNEL_LABEL[n.channel] ?? n.channel}
                  </span>
                  {!n.read && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      disabled={isPending}
                      className="text-xs text-indigo-600 hover:underline disabled:opacity-50"
                    >
                      Marcar como lida
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
