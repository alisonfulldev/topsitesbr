'use client'

import { useState, useRef, useEffect, useTransition } from 'react'
import Link from 'next/link'

export type NotifItem = {
  id: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'agora'
  if (m < 60) return `${m}m atrás`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h atrás`
  const d = Math.floor(h / 24)
  return `${d}d atrás`
}

export function NotificationBell({
  unreadCount: initialCount,
  notifications: initialNotifs,
  onMarkRead,
  onMarkAll,
  allHref,
  theme = 'dark',
}: {
  unreadCount: number
  notifications: NotifItem[]
  onMarkRead: (id: string) => Promise<void>
  onMarkAll: () => Promise<void>
  allHref: string
  theme?: 'dark' | 'light'
}) {
  const [open, setOpen] = useState(false)
  const [notifs, setNotifs] = useState(initialNotifs)
  const [count, setCount] = useState(initialCount)
  const [isPending, startTransition] = useTransition()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  function handleMarkRead(id: string) {
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    setCount((prev) => Math.max(0, prev - 1))
    startTransition(() => onMarkRead(id))
  }

  function handleMarkAll() {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })))
    setCount(0)
    startTransition(() => onMarkAll())
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`relative p-2 rounded-md transition-colors ${
          theme === 'light'
            ? 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            : 'text-gray-300 hover:text-white hover:bg-brand-dark-hover'
        }`}
        aria-label={`Notificações — ${count} não lida${count !== 1 ? 's' : ''}`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {count > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white leading-none">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-80 bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Notificações</h3>
            {count > 0 && (
              <button
                onClick={handleMarkAll}
                disabled={isPending}
                className="text-xs text-brand-text hover:underline disabled:opacity-50"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          <ul className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {notifs.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-gray-400">
                Nenhuma notificação.
              </li>
            ) : (
              notifs.map((n) => (
                <li
                  key={n.id}
                  className={`px-4 py-3 text-sm ${!n.read ? 'bg-brand-50' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-medium truncate ${
                          !n.read ? 'text-gray-900' : 'text-gray-600'
                        }`}
                      >
                        {n.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.read && (
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        disabled={isPending}
                        className="shrink-0 mt-1 w-2 h-2 rounded-full bg-brand hover:bg-brand-hover disabled:opacity-50 transition-colors"
                        title="Marcar como lida"
                      />
                    )}
                  </div>
                </li>
              ))
            )}
          </ul>

          <div className="border-t border-gray-100 px-4 py-2.5">
            <Link
              href={allHref}
              onClick={() => setOpen(false)}
              className="text-xs text-brand-text hover:underline"
            >
              Ver todas as notificações →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
