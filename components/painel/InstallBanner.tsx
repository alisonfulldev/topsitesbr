'use client'

import { useEffect, useState } from 'react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}
type WindowWithPrompt = Window & {
  __deferredInstallPrompt?: BeforeInstallPromptEvent
}

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ''
// Dismissal por sessão: zera quando o cliente fecha o navegador e abre de novo
const SESSION_INSTALL_KEY = 'pwa_install_dismissed_session'
const SESSION_PUSH_KEY = 'pwa_push_dismissed_session'
// iOS: cooldown de 7 dias (não mostra toda vez pois é instrução manual)
const IOS_COOLDOWN_KEY = 'pwa_ios_last_shown'
const IOS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000

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
    // push é opcional
  }
}

interface Props {
  show: boolean
}

export function InstallBanner({ show }: Props) {
  const [mode, setMode] = useState<'install' | 'ios' | 'push' | null>(null)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    if (!show) return

    // Só no mobile
    const isMobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent)
    if (!isMobile) return

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent)

    // App já instalado → apenas pede notificação se ainda não concedida
    if (isStandalone) {
      if (
        'Notification' in window &&
        Notification.permission === 'default' &&
        !sessionStorage.getItem(SESSION_PUSH_KEY)
      ) {
        setMode('push')
      }
      return
    }

    // iOS: instrução manual, cooldown de 7 dias
    if (isIos) {
      const last = localStorage.getItem(IOS_COOLDOWN_KEY)
      if (last && Date.now() - parseInt(last) < IOS_COOLDOWN_MS) return
      if (sessionStorage.getItem(SESSION_INSTALL_KEY)) return
      setMode('ios')
      localStorage.setItem(IOS_COOLDOWN_KEY, String(Date.now()))
      return
    }

    // Android: usa o prompt nativo capturado no script inline do layout raiz
    if (sessionStorage.getItem(SESSION_INSTALL_KEY)) return

    const existing = (window as unknown as WindowWithPrompt).__deferredInstallPrompt
    if (existing) {
      setDeferredPrompt(existing)
      setMode('install')
      return
    }
    function onReady() {
      const prompt = (window as unknown as WindowWithPrompt).__deferredInstallPrompt
      if (prompt) {
        setDeferredPrompt(prompt)
        setMode('install')
      }
    }
    document.addEventListener('pwainstallready', onReady)
    return () => document.removeEventListener('pwainstallready', onReady)
  }, [show])

  async function handleInstall() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setMode(null)
    if (outcome === 'accepted') {
      subscribeToPush()
    }
  }

  async function handleActivatePush() {
    await subscribeToPush()
    setMode(null)
  }

  function dismiss() {
    sessionStorage.setItem(SESSION_INSTALL_KEY, '1')
    setMode(null)
  }

  function dismissPush() {
    sessionStorage.setItem(SESSION_PUSH_KEY, '1')
    setMode(null)
  }

  if (!mode) return null

  // ── Prompt de notificação (app já instalado) ───────────────────────────────
  if (mode === 'push') {
    return (
      <div className="fixed bottom-20 md:bottom-4 left-4 right-4 z-40 bg-gray-900 text-white rounded-xl p-4 shadow-xl max-w-sm mx-auto">
        <div className="flex items-start gap-3">
          <span className="text-2xl shrink-0">🔔</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">Ativar notificações</p>
            <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">
              Receba avisos de avanço no projeto, promoções e novidades direto aqui.
            </p>
          </div>
          <button onClick={dismissPush} className="text-gray-400 hover:text-white shrink-0 mt-0.5" aria-label="Fechar">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleActivatePush}
            className="flex-1 rounded-lg bg-sky-500 px-3 py-2 text-xs font-semibold hover:bg-sky-400 transition-colors"
          >
            Ativar notificações
          </button>
          <button onClick={dismissPush} className="px-3 py-2 rounded-lg border border-gray-600 text-xs text-gray-300 hover:bg-gray-800">
            Agora não
          </button>
        </div>
      </div>
    )
  }

  // ── Instrução iOS ──────────────────────────────────────────────────────────
  if (mode === 'ios') {
    return (
      <div className="fixed bottom-20 md:bottom-4 left-4 right-4 z-40 bg-gray-900 text-white rounded-xl p-4 shadow-xl max-w-sm mx-auto">
        <div className="flex items-start gap-3">
          <span className="text-2xl shrink-0">📱</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">Adicione o app à tela inicial</p>
            <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">
              Toque em <strong>Compartilhar</strong> e depois em <strong>"Adicionar à Tela de Início"</strong>.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Assim você recebe avisos do projeto, promoções e novidades em tempo real.
            </p>
          </div>
          <button onClick={dismiss} className="text-gray-400 hover:text-white shrink-0 mt-0.5" aria-label="Fechar">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    )
  }

  // ── Prompt de instalação Android ───────────────────────────────────────────
  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 z-40 bg-gray-900 text-white rounded-xl p-4 shadow-xl max-w-sm mx-auto">
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0">📲</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">Instale o app e ative as notificações</p>
          <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">
            Receba avisos de avanço no projeto, promoções e upgrades disponíveis direto no celular.
          </p>
        </div>
        <button onClick={dismiss} className="text-gray-400 hover:text-white shrink-0 mt-0.5" aria-label="Fechar">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={handleInstall}
          className="flex-1 rounded-lg bg-sky-500 px-3 py-2 text-xs font-semibold hover:bg-sky-400 transition-colors"
        >
          Instalar app
        </button>
        <button onClick={dismiss} className="px-3 py-2 rounded-lg border border-gray-600 text-xs text-gray-300 hover:bg-gray-800">
          Agora não
        </button>
      </div>
    </div>
  )
}
