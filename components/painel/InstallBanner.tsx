'use client'

import { useEffect, useState } from 'react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type WindowWithPrompt = Window & {
  __deferredInstallPrompt?: BeforeInstallPromptEvent
}

const DISMISSED_KEY = 'pwa_install_dismissed'
const IOS_DISMISSED_KEY = 'pwa_ios_dismissed'
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ''

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const buffer = new ArrayBuffer(rawData.length)
  const view = new Uint8Array(buffer)
  for (let i = 0; i < rawData.length; ++i) view[i] = rawData.charCodeAt(i)
  return buffer
}

async function subscribeToPush(): Promise<void> {
  if (!('Notification' in window) || !VAPID_PUBLIC_KEY) return
  if (Notification.permission === 'denied') return
  try {
    const perm = await Notification.requestPermission()
    if (perm !== 'granted') return
    const reg = await navigator.serviceWorker.ready
    const existingSub = await reg.pushManager.getSubscription()
    if (existingSub) return
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    })
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sub.toJSON()),
    })
  } catch {
    // ignore — push is optional
  }
}

export function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showIos, setShowIos] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (localStorage.getItem(DISMISSED_KEY)) return

    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    if (isIos && !isStandalone && !localStorage.getItem(IOS_DISMISSED_KEY)) {
      setShowIos(true)
      return
    }

    // The event fires very early — captured in an inline script in layout.tsx
    // and stored on window.__deferredInstallPrompt before React hydrates.
    const existing = (window as unknown as WindowWithPrompt).__deferredInstallPrompt
    if (existing) {
      setDeferredPrompt(existing)
      return
    }

    function onReady() {
      const prompt = (window as unknown as WindowWithPrompt).__deferredInstallPrompt
      if (prompt) setDeferredPrompt(prompt)
    }
    document.addEventListener('pwainstallready', onReady)
    return () => document.removeEventListener('pwainstallready', onReady)
  }, [])

  async function handleInstall() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
      setDismissed(true)
      localStorage.setItem(DISMISSED_KEY, '1')
      subscribeToPush()
    }
  }

  function dismiss() {
    setDeferredPrompt(null)
    setDismissed(true)
    localStorage.setItem(DISMISSED_KEY, '1')
  }

  function dismissIos() {
    setShowIos(false)
    localStorage.setItem(IOS_DISMISSED_KEY, '1')
  }

  if (dismissed || (!deferredPrompt && !showIos)) return null

  if (showIos) {
    return (
      <div className="fixed bottom-20 md:bottom-4 left-4 right-4 z-40 bg-gray-900 text-white rounded-xl p-4 shadow-xl max-w-sm mx-auto">
        <div className="flex items-start gap-3">
          <span className="text-2xl shrink-0">📱</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">Instalar o app</p>
            <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">
              Toque em <strong>Compartilhar</strong> e depois em <strong>"Adicionar à Tela de Início"</strong>.
            </p>
            <p className="text-xs text-gray-400 mt-1">Você vai receber avisos quando o site tiver novidades.</p>
          </div>
          <button onClick={dismissIos} className="text-gray-400 hover:text-white shrink-0 mt-0.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 z-40 bg-gray-900 text-white rounded-xl p-4 shadow-xl max-w-sm mx-auto">
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0">📲</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">Instalar o app</p>
          <p className="text-xs text-gray-300 mt-0.5">
            Acesso direto pela tela inicial + aviso quando seu site receber visitas.
          </p>
        </div>
        <div className="flex gap-2 shrink-0 mt-0.5">
          <button
            onClick={handleInstall}
            className="rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-semibold hover:bg-sky-400 transition-colors"
          >
            Instalar
          </button>
          <button onClick={dismiss} className="text-gray-400 hover:text-white">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
