'use client'

import { useEffect, useState } from 'react'
import { Card, CardTitle } from '@/components/ui/card'
import type { PageSpeedResult } from '@/lib/integrations/pagespeed'

type Scores = Extract<PageSpeedResult, { ok: true }>['scores']

function scoreColor(n: number) {
  if (n >= 90) return { text: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', ring: '#22c55e' }
  if (n >= 50) return { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', ring: '#f59e0b' }
  return { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', ring: '#ef4444' }
}

function ScoreCircle({ value, label }: { value: number; label: string }) {
  const c = scoreColor(value)
  const r = 18
  const circ = 2 * Math.PI * r
  const dash = (value / 100) * circ

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-14 h-14">
        <svg viewBox="0 0 44 44" className="w-full h-full -rotate-90">
          <circle cx="22" cy="22" r={r} fill="none" stroke="#e5e7eb" strokeWidth="4" />
          <circle
            cx="22"
            cy="22"
            r={r}
            fill="none"
            stroke={c.ring}
            strokeWidth="4"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
          />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${c.text}`}>
          {value}
        </span>
      </div>
      <span className="text-[10px] text-gray-500 text-center leading-tight">{label}</span>
    </div>
  )
}

function SkeletonCircle() {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-14 h-14 rounded-full bg-gray-100 animate-pulse" />
      <div className="w-12 h-2.5 bg-gray-100 rounded animate-pulse" />
    </div>
  )
}

export function DesempenhoCard({ siteUrl }: { siteUrl: string }) {
  const [result, setResult] = useState<PageSpeedResult | null>(null)

  useEffect(() => {
    fetch(`/api/pagespeed?url=${encodeURIComponent(siteUrl)}`)
      .then((r) => r.json())
      .then((data) => setResult(data))
      .catch(() => setResult({ ok: false, message: 'connection_error' }))
  }, [siteUrl])

  const isLoading = result === null
  const scores = result?.ok ? (result as { ok: true; scores: Scores }).scores : null

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <CardTitle className="mb-0">Desempenho do Site</CardTitle>
        <span className="text-[10px] text-gray-400 bg-gray-50 border border-gray-100 rounded-md px-2 py-0.5">
          Google · mobile
        </span>
      </div>

      {isLoading ? (
        <div className="flex justify-around py-2">
          <SkeletonCircle />
          <SkeletonCircle />
          <SkeletonCircle />
          <SkeletonCircle />
        </div>
      ) : scores ? (
        <>
          <div className="flex justify-around py-2">
            <ScoreCircle value={scores.performance} label="Performance" />
            <ScoreCircle value={scores.seo} label="SEO" />
            <ScoreCircle value={scores.accessibility} label="Acessibil." />
            <ScoreCircle value={scores.bestPractices} label="Boas práticas" />
          </div>
          <p className="text-[10px] text-gray-400 text-center mt-3">
            Pontuação de 0 a 100 · atualizada a cada hora
          </p>
        </>
      ) : (
        <div className="py-4 text-center">
          <p className="text-sm text-gray-400">
            {result?.ok === false && result.message === 'not_configured'
              ? 'Integração com Google PageSpeed não configurada ainda.'
              : 'Não foi possível carregar as métricas de desempenho.'}
          </p>
        </div>
      )}
    </Card>
  )
}
