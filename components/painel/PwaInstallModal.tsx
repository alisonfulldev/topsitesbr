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
const SESSION_INSTALL_KEY = 'pwa_install_dismissed_session'
const SESSION_PUSH_KEY = 'pwa_push_dismissed_session'
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

export function PwaInstallModal({ show }: Props) {
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
    // Após 'accepted' o Chrome recarrega em standalone —
    // subscribeToPush() é chamado quando a página voltar no modo 'push'
    if (outcome === 'dismissed') {
      sessionStorage.setItem(SESSION_INSTALL_KEY, '1')
    }
  }

  async function handleActivatePush() {
    await subscribeToPush()
    setMode(null)
  }

  function dismissInstall() {
    sessionStorage.setItem(SESSION_INSTALL_KEY, '1')
    setMode(null)
  }

  function dismissIos() {
    localStorage.setItem(IOS_COOLDOWN_KEY, String(Date.now()))
    setMode(null)
  }

  function dismissPush() {
    sessionStorage.setItem(SESSION_PUSH_KEY, '1')
    setMode(null)
  }

  if (!mode) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full shadow-2xl">

        {/* ── Modo Android ─────────────────────────────────────────────────── */}
        {mode === 'install' && (
          <>
            <div className="text-center mb-4">
              <span className="text-5xl">📲</span>
            </div>
            <h2 className="text-lg font-bold text-gray-900 text-center mb-1">
              Instale o app TOP SITE
            </h2>
            <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
              Receba avisos em tempo real sobre seu projeto, promoções e novidades — direto na tela inicial.
            </p>
            <button
              onClick={handleInstall}
              className="w-full bg-gray-900 text-white font-semibold py-3 rounded-xl text-sm hover:bg-gray-800 transition-colors mb-3"
            >
              Instalar agora
            </button>
            <div className="text-center">
              <button
                onClick={dismissInstall}
                className="text-xs text-gray-400 underline"
              >
                Agora não
              </button>
            </div>
          </>
        )}

        {/* ── Modo iOS ──────────────────────────────────────────────────────── */}
        {mode === 'ios' && (
          <>
            <div className="text-center mb-4">
              <span className="text-5xl">📱</span>
            </div>
            <h2 className="text-lg font-bold text-gray-900 text-center mb-4">
              Adicione o app à tela inicial
            </h2>
            <ol className="space-y-3 mb-4">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center mt-0.5">1</span>
                <span className="text-sm text-gray-700">
                  Toque no ícone de Compartilhar <span className="inline-block">⬆️</span> na barra do Safari
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center mt-0.5">2</span>
                <span className="text-sm text-gray-700">
                  Role até encontrar <strong>"Adicionar à Tela de Início"</strong>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center mt-0.5">3</span>
                <span className="text-sm text-gray-700">
                  Toque em <strong>"Adicionar"</strong> no canto superior direito
                </span>
              </li>
            </ol>
            <p className="text-xs text-gray-500 text-center mb-5 leading-relaxed">
              Assim você recebe notificações do projeto em tempo real.
            </p>
            <div className="text-center">
              <button
                onClick={dismissIos}
                className="text-xs text-gray-400 underline"
              >
                Já entendi, fechar
              </button>
            </div>
          </>
        )}

        {/* ── Modo push ─────────────────────────────────────────────────────── */}
        {mode === 'push' && (
          <>
            <div className="text-center mb-4">
              <span className="text-5xl">🔔</span>
            </div>
            <h2 className="text-lg font-bold text-gray-900 text-center mb-1">
              Ativar notificações
            </h2>
            <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
              Receba avisos de avanço no projeto, promoções e upgrades disponíveis direto no celular.
            </p>
            <button
              onClick={handleActivatePush}
              className="w-full bg-gray-900 text-white font-semibold py-3 rounded-xl text-sm hover:bg-gray-800 transition-colors mb-3"
            >
              Ativar notificações
            </button>
            <div className="text-center">
              <button
                onClick={dismissPush}
                className="text-xs text-gray-400 underline"
              >
                Agora não
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
