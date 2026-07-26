'use client'

import Link from 'next/link'

type TimeSeries = { date: string; pageviews: number; sessions: number }
type ReportData = {
  visits?: number
  pageViews?: number
  avgDailyVisits?: number
  changePercent?: number | null
  timeSeries?: TimeSeries[]
  topReferrers?: { host: string; count: number }[]
  topPages?: { path: string; count: number }[]
  insights?: string[]
  periodLabel?: string
}

function MiniChart({ series }: { series: TimeSeries[] }) {
  if (!series?.length) return null
  const max = Math.max(...series.map((d) => d.pageviews), 1)
  return (
    <div className="flex items-end gap-1 h-16">
      {series.map((d) => (
        <div key={d.date} className="flex-1 flex flex-col items-center gap-0.5">
          <div
            className="w-full rounded-sm bg-sky-400"
            style={{ height: `${Math.max(2, Math.round((d.pageviews / max) * 56))}px` }}
          />
          <span className="text-[9px] text-gray-400 hidden sm:block">
            {new Date(d.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric' })}
          </span>
        </div>
      ))}
    </div>
  )
}

export function ReportDetailClient({
  report,
  whatsappNumber,
}: {
  report: { id: string; siteUrl: string | null; periodStart: string; periodEnd: string; generatedAt: string; data: Record<string, unknown> }
  whatsappNumber: string
}) {
  const data = report.data as ReportData
  const label = data.periodLabel ?? new Date(report.periodStart).toLocaleDateString('pt-BR')

  const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Olá! Gostaria de uma consultoria gratuita para atrair mais clientes para o meu site.')}`

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/painel/relatorios" className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Relatório semanal</h1>
          <p className="text-sm text-gray-500">Semana de {label}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{data.visits ?? 0}</p>
          <p className="text-xs text-gray-500 mt-0.5">Visitas</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{data.avgDailyVisits ?? 0}</p>
          <p className="text-xs text-gray-500 mt-0.5">Média/dia</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          {data.changePercent !== null && data.changePercent !== undefined ? (
            <>
              <p className={`text-2xl font-bold ${data.changePercent >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {data.changePercent >= 0 ? '+' : ''}{data.changePercent}%
              </p>
              <p className="text-xs text-gray-500 mt-0.5">vs. semana anterior</p>
            </>
          ) : (
            <>
              <p className="text-2xl font-bold text-gray-400">—</p>
              <p className="text-xs text-gray-500 mt-0.5">vs. semana anterior</p>
            </>
          )}
        </div>
      </div>

      {/* Mini chart */}
      {data.timeSeries && data.timeSeries.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">Evolução de pageviews</p>
          <MiniChart series={data.timeSeries} />
        </div>
      )}

      {/* Sources */}
      {data.topReferrers && data.topReferrers.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">Principais origens</p>
          <div className="space-y-2">
            {data.topReferrers.map((r) => (
              <div key={r.host} className="flex items-center justify-between text-sm">
                <span className="text-gray-700 truncate">{r.host || 'Direto'}</span>
                <span className="text-gray-500 tabular-nums ml-3">{r.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top pages */}
      {data.topPages && data.topPages.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">Páginas mais vistas</p>
          <div className="space-y-2">
            {data.topPages.map((p) => (
              <div key={p.path} className="flex items-center justify-between text-sm">
                <span className="text-gray-700 truncate">{p.path || '/'}</span>
                <span className="text-gray-500 tabular-nums ml-3">{p.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights */}
      {data.insights && data.insights.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <p className="text-sm font-semibold text-gray-700">Como crescer ainda mais</p>
          {data.insights.map((tip, i) => (
            <div key={i} className="flex gap-3">
              <span className="text-sky-500 mt-0.5 shrink-0">•</span>
              <p className="text-sm text-gray-600 leading-relaxed">{tip}</p>
            </div>
          ))}

          {/* CTA discreto */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-3">
              Quer um plano personalizado para atrair mais clientes para o seu site? Fale com nosso time no WhatsApp para uma consultoria gratuita.
            </p>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Falar no WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* Download button */}
      <div className="flex justify-end">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-2 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Baixar / Imprimir
        </button>
      </div>
    </div>
  )
}
