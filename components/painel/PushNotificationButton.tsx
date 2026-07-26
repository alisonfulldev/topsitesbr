'use client'

import { useEffect, useState } from 'react'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ''

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const buffer = new ArrayBuffer(rawData.length)
  const view = new Uint8Array(buffer)
  for (let i = 0; i < rawData.length; ++i) {
    view[i] = rawData.charCodeAt(i)
  }
  return buffer
}

export function PushNotificationButton() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isIos, setIsIos] = useState(false)

  useEffect(() => {
    setIsIos(/iphone|ipad|ipod/i.test(navigator.userAgent))
    if ('Notification' in window) setPermission(Notification.permission)
    // Check if already subscribed
    if ('serviceWorker' in navigator && VAPID_PUBLIC_KEY) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          setSubscribed(!!sub)
        })
      })
    }
  }, [])

  if (!('Notification' in window) || !VAPID_PUBLIC_KEY) return null
  if (permission === 'denied') return null
  if (subscribed) return (
    <p className="text-xs text-green-600 flex items-center gap-1">
      <span>✓</span> Notificações ativas
    </p>
  )

  async function handleEnable() {
    setLoading(true)
    try {
      const perm = await Notification.requestPermission()
      setPermission(perm)
      if (perm !== 'granted') return

      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub.toJSON()),
      })
      setSubscribed(true)
    } catch {
      // User denied or error
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-1">
      <button
        onClick={handleEnable}
        disabled={loading}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {loading ? 'Ativando...' : 'Ativar notificações'}
      </button>
      {isIos && (
        <p className="text-xs text-gray-400">No iPhone, instale o app na tela inicial antes de ativar.</p>
      )}
    </div>
  )
}
