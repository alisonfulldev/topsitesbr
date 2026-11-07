'use client'

import { useEffect } from 'react'

// Registra o clique (POST) e abre o WhatsApp. Se o registro demorar, segue para o WhatsApp mesmo assim.
export function WhatsappRedirect({ emailId, test, waUrl }: { emailId: string; test: boolean; waUrl: string }) {
  useEffect(() => {
    let done = false
    const go = () => {
      if (done) return
      done = true
      window.location.href = waUrl
    }
    fetch('/api/prospeccao/clique', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailId, test }),
      keepalive: true,
    }).finally(go)
    const timer = setTimeout(go, 1500)
    return () => clearTimeout(timer)
  }, [emailId, test, waUrl])

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="space-y-4 text-center">
        <p className="text-2xl font-bold uppercase tracking-widest text-black">TOP SITE</p>
        <p className="text-sm text-gray-600">Abrindo o WhatsApp…</p>
        <p className="text-xs text-gray-400">
          Não abriu? <a href={waUrl} className="underline">Toque aqui</a>.
        </p>
      </div>
    </div>
  )
}
