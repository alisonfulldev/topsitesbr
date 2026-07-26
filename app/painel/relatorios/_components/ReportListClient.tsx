'use client'

import { useState } from 'react'
import Link from 'next/link'

type Report = {
  id: string
  siteUrl: string | null
  siteType: string
  periodStart: string
  periodEnd: string
  generatedAt: string
  viewedAt: string | null
  data: Record<string, unknown>
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })
}

function ReportCard({ report }: { report: Report }) {
  const data = report.data as { visits?: number; changePercent?: number | null; periodLabel?: string }
  const isNew = !report.viewedAt
  const label = data.periodLabel ?? `${formatDate(report.periodStart)} a ${formatDate(report.periodEnd)}`

  return (
    <Link
      href={`/painel/relatorios/${report.id}`}
      className={`block rounded-xl border p-5 transition-all hover:shadow-md ${
        isNew
          ? 'border-sky-300 bg-sky-50 ring-1 ring-sky-200'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {isNew && (
              <span className="inline-flex items-center rounded-full bg-sky-500 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wide">
                Novo
              </span>
            )}
            <span className="text-xs text-gray-500">Semana de {label}</span>
          </div>
          <p className="font-semibold text-gray-900 text-sm">
            {data.visits ?? 0} visitas
            {data.changePercent !== null && data.changePercent !== undefined && (
              <span className={`ml-2 text-xs font-medium ${data.changePercent >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {data.changePercent >= 0 ? '+' : ''}{data.changePercent}% vs semana anterior
              </span>
            )}
          </p>
          {report.siteUrl && (
            <p className="text-xs text-gray-400 mt-0.5 truncate">{report.siteUrl}</p>
          )}
        </div>
        <svg className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  )
}

export function ReportListClient({
  active,
  archived,
}: {
  active: Report[]
  archived: Report[]
}) {
  const [showArchived, setShowArchived] = useState(false)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Relatórios do site</h1>
        <p className="text-sm text-gray-500 mt-1">Acompanhe o desempenho do seu site semana a semana.</p>
      </div>

      {active.length === 0 && archived.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <div className="text-4xl mb-3">📊</div>
          <p className="font-medium text-gray-800">Nenhum relatório disponível ainda</p>
          <p className="text-sm text-gray-500 mt-1">O primeiro relatório aparece assim que seu site tiver visitas suficientes para análise.</p>
        </div>
      )}

      {active.length > 0 && (
        <div className="space-y-3">
          {active.map((r) => <ReportCard key={r.id} report={r} />)}
        </div>
      )}

      {archived.length > 0 && (
        <div>
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-3"
          >
            <svg className={`w-4 h-4 transition-transform ${showArchived ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Histórico de relatórios ({archived.length})
          </button>
          {showArchived && (
            <div className="space-y-3">
              {archived.map((r) => <ReportCard key={r.id} report={r} />)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
