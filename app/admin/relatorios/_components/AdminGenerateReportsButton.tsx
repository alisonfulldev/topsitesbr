'use client'

import { useState } from 'react'

export function AdminGenerateReportsButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ generated: number; skipped: number } | null>(null)
  const [error, setError] = useState('')

  async function handleGenerate() {
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/admin/generate-reports', { method: 'POST' })
      if (!res.ok) throw new Error('Falha ao gerar')
      const data = await res.json()
      setResult(data)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Gerando relatórios...' : 'Gerar e enviar relatórios agora'}
      </button>
      {result && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          ✅ Concluído: {result.generated} relatório(s) gerado(s), {result.skipped} ignorado(s).
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
