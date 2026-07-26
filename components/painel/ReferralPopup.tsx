'use client'

import { useState, useEffect } from 'react'

type Props = {
  referralLink: string
  whatsappNumber: string
  onDismiss: (snooze: boolean) => void
}

export function ReferralPopup({ referralLink, whatsappNumber, onDismiss }: Props) {
  const [copied, setCopied] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 1500)
    return () => clearTimeout(t)
  }, [])

  function copyLink() {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const waMsg = encodeURIComponent(`Olá! Tenho um site profissional com hospedagem, SSL e suporte. O primeiro mês é grátis e depois R$17/mês. Você pode ter o seu também: ${referralLink}`)
  const waUrl = `https://wa.me/${whatsappNumber}?text=${waMsg}`

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => { setVisible(false); onDismiss(false) }}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm rounded-2xl bg-white shadow-2xl p-6 space-y-4">
        {/* Close */}
        <button
          onClick={() => { setVisible(false); onDismiss(false) }}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Fechar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center">
          <div className="text-4xl mb-2">🎁</div>
          <h2 className="text-lg font-bold text-gray-900">Ganhe 1 mês grátis!</h2>
          <p className="text-sm text-gray-500 mt-1">
            Indique um amigo — quando ele ativar o site dele, seu próximo mês é por nossa conta.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 font-mono break-all text-center">
          {referralLink}
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={copyLink}
            className="w-full rounded-lg bg-gray-900 text-white py-2.5 text-sm font-semibold hover:bg-gray-800 transition-colors"
          >
            {copied ? '✓ Link copiado!' : 'Copiar link'}
          </button>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full rounded-lg bg-green-500 text-white py-2.5 text-sm font-semibold hover:bg-green-600 transition-colors text-center block"
            onClick={() => { onDismiss(false) }}
          >
            Compartilhar no WhatsApp
          </a>
        </div>

        <button
          onClick={() => { setVisible(false); onDismiss(true) }}
          className="w-full text-xs text-gray-400 hover:text-gray-600 transition-colors py-1"
        >
          Não mostrar por 7 dias
        </button>
      </div>
    </div>
  )
}
