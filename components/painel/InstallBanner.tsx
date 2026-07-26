'use client'

import { useEffect, useState } from 'react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISSED_KEY = 'pwa_install_dismissed'
const IOS_DISMISSED_KEY = 'pwa_ios_dismissed'

export function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showIos, setShowIos] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (localStorage.getItem(DISMISSED_KEY)) return

    // Detect iOS
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
    if (isIos && !isInStandaloneMode && !localStorage.getItem(IOS_DISMISSED_KEY)) {
      setShowIos(true)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function handleInstall() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
      setDismissed(true)
      localStorage.setItem(DISMISSED_KEY, '1')
    }
  }

  function dismissIos() {
    setShowIos(false)
    localStorage.setItem(IOS_DISMISSED_KEY, '1')
  }

  if (dismissed) return null
  if (!deferredPrompt && !showIos) return null

  if (showIos) {
    return (
      <div className="fixed bottom-20 md:bottom-4 left-4 right-4 z-40 bg-gray-900 text-white rounded-xl p-4 shadow-xl max-w-sm mx-auto">
        <div className="flex items-start gap-3">
          <span className="text-2xl shrink-0">📱</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">Instalar o app</p>
            <p className="text-xs text-gray-300 mt-0.5">
              Toque em <strong>compartilhar</strong> (
              <svg className="w-3 h-3 inline" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l-1.41 1.41L16.17 9H4v2h12.17l-5.58 5.59L12 18l8-8z" />
              </svg>
              ) e depois em <strong>Adicionar à Tela de Início</strong>.
            </p>
          </div>
          <button onClick={dismissIos} className="text-gray-400 hover:text-white shrink-0">
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
      <div className="flex items-center gap-3">
        <span className="text-2xl shrink-0">📲</span>
        <div className="flex-1">
          <p className="text-sm font-semibold">Instalar o app</p>
          <p className="text-xs text-gray-300">Acesse seu painel diretamente da tela inicial.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleInstall}
            className="rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-semibold hover:bg-sky-400 transition-colors"
          >
            Instalar
          </button>
          <button
            onClick={() => { setDeferredPrompt(null); localStorage.setItem(DISMISSED_KEY, '1') }}
            className="text-gray-400 hover:text-white"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
