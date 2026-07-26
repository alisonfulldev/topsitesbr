'use client'

import { useState } from 'react'

export function AdminGenerateReportsButton() {
  const [loading, setLoading] = useState<'email' | 'reports' | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function handle(emailOnly: boolean) {
    setLoading(emailOnly ? 'email' : 'reports')
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/admin/generate-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOnly }),
      })
      if (!res.ok) throw new Error('Falha na requisição')
      const data = await res.json()
      if (emailOnly) {
        setResult(`✅ E-mail enviado para ${data.sent} cliente(s).`)
      } else {
        setResult(`✅ ${data.generated} relatório(s) gerado(s), ${data.skipped} ignorado(s).`)
      }
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => handle(true)}
          disabled={!!loading}
          className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-50 transition-colors"
        >
          {loading === 'email' ? 'Enviando...' : '📧 Enviar e-mail semanal agora (todos os clientes)'}
        </button>
        <button
          onClick={() => handle(false)}
          disabled={!!loading}
          className="inline-flex items-center gap-2 rounded-lg bg-gray-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {loading === 'reports' ? 'Gerando...' : '📊 Gerar relatórios com dados do Umami'}
        </button>
      </div>
      {result && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          {result}
        </div>
      )}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  )
}
