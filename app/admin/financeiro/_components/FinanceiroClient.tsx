'use client'

import { useRouter, usePathname } from 'next/navigation'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

export type MonthlyRow = {
  month: string
  label: string
  subscriptions: number
  upsells: number
  maintenance: number
  siteRevenue: number
  totalRevenue: number
  ia: number
  trafego_pago: number
  hospedagem_ferramentas: number
  outro: number
  totalCosts: number
  profit: number
  margin: number
  newClients: number
}

export type OverdueItem = {
  clientName: string
  amount: number
  dueDate: string
  daysOverdue: number
}

export type CostBreakdown = {
  ia: number
  trafego_pago: number
  hospedagem_ferramentas: number
  outro: number
}

type Period = '1m' | '3m' | '6m' | '12m' | 'custom'

const PERIOD_OPTIONS: { value: Period | string; label: string }[] = [
  { value: '1m', label: 'Mês atual' },
  { value: '3m', label: 'Últimos 3 meses' },
  { value: '6m', label: 'Últimos 6 meses' },
  { value: '12m', label: 'Últimos 12 meses' },
  { value: 'custom', label: 'Personalizado' },
]

function fmtBRL(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtPct(n: number) {
  return `${n.toFixed(1)}%`
}

const PIE_COLORS = ['#0D0B1F', '#FFD100', '#2D2850', '#6b7280']
const COST_LABELS: Record<string, string> = {
  ia: 'IA',
  trafego_pago: 'Tráfego Pago',
  hospedagem_ferramentas: 'Hospedagem/Ferramentas',
  outro: 'Outro',
}

function PeriodSelector({
  period,
  from,
  to,
}: {
  period: string
  from?: string
  to?: string
}) {
  const router = useRouter()
  const pathname = usePathname()

  function navigate(p: string, f?: string, t?: string) {
    const params = new URLSearchParams()
    params.set('period', p)
    if (p === 'custom' && f && t) {
      params.set('from', f)
      params.set('to', t)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {PERIOD_OPTIONS.filter((o) => o.value !== 'custom').map((opt) => (
        <button
          key={opt.value}
          onClick={() => navigate(opt.value)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            period === opt.value
              ? 'bg-gray-900 text-white'
              : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          {opt.label}
        </button>
      ))}
      <span className="text-gray-400 text-sm">|</span>
      <div className="flex items-center gap-1.5">
        <input
          type="date"
          defaultValue={from}
          id="from-date"
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
        />
        <span className="text-gray-400 text-xs">até</span>
        <input
          type="date"
          defaultValue={to}
          id="to-date"
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
        />
        <button
          onClick={() => {
            const f = (document.getElementById('from-date') as HTMLInputElement).value
            const t = (document.getElementById('to-date') as HTMLInputElement).value
            if (f && t) navigate('custom', f, t)
          }}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            period === 'custom'
              ? 'bg-gray-900 text-white'
              : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          Aplicar
        </button>
      </div>
    </div>
  )
}

function KpiCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string
  value: string
  sub?: string
  highlight?: boolean
}) {
  return (
    <div
      className={`rounded-lg border p-4 ${highlight ? 'bg-brand-dark border-brand-dark' : 'bg-white border-gray-200'}`}
    >
      <p
        className={`text-xs font-medium uppercase tracking-wide ${highlight ? 'text-gray-400' : 'text-gray-500'}`}
      >
        {label}
      </p>
      <p className={`text-2xl font-bold mt-1 ${highlight ? 'text-white' : 'text-gray-900'}`}>
        {value}
      </p>
      {sub && (
        <p className={`text-xs mt-0.5 ${highlight ? 'text-gray-300' : 'text-gray-400'}`}>{sub}</p>
      )}
    </div>
  )
}

function downloadCSV(rows: MonthlyRow[]) {
  const headers = [
    'Mês',
    'Faturamento Total',
    'Venda de Site',
    'Assinaturas',
    'Upsells',
    'Manutenção',
    'Custos Totais',
    'IA',
    'Tráfego Pago',
    'Hospedagem/Ferramentas',
    'Outros Custos',
    'Lucro Líquido',
    'Margem %',
    'Novos Clientes',
  ]
  const csvRows = [
    headers.join(';'),
    ...rows.map((r) =>
      [
        r.label,
        r.totalRevenue.toFixed(2).replace('.', ','),
        r.siteRevenue.toFixed(2).replace('.', ','),
        r.subscriptions.toFixed(2).replace('.', ','),
        r.upsells.toFixed(2).replace('.', ','),
        r.maintenance.toFixed(2).replace('.', ','),
        r.totalCosts.toFixed(2).replace('.', ','),
        r.ia.toFixed(2).replace('.', ','),
        r.trafego_pago.toFixed(2).replace('.', ','),
        r.hospedagem_ferramentas.toFixed(2).replace('.', ','),
        r.outro.toFixed(2).replace('.', ','),
        r.profit.toFixed(2).replace('.', ','),
        r.margin.toFixed(1).replace('.', ','),
        r.newClients,
      ].join(';')
    ),
  ]
  const csv = '﻿' + csvRows.join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `financeiro-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function FinanceiroClient({
  period,
  from,
  to,
  monthlyData,
  totalRevenue,
  totalCosts,
  totalProfit,
  totalMargin,
  currentMRR,
  arpu,
  overdueList,
  totalOverdue,
  costBreakdown,
  mrrByMonth,
  clientGrowthByMonth,
}: {
  period: string
  from?: string
  to?: string
  monthlyData: MonthlyRow[]
  totalRevenue: number
  totalCosts: number
  totalProfit: number
  totalMargin: number
  currentMRR: number
  arpu: number
  overdueList: OverdueItem[]
  totalOverdue: number
  costBreakdown: CostBreakdown
  mrrByMonth: { label: string; mrr: number }[]
  clientGrowthByMonth: { label: string; new: number }[]
}) {
  const pieData = [
    { name: 'IA', value: costBreakdown.ia },
    { name: 'Tráfego Pago', value: costBreakdown.trafego_pago },
    { name: 'Hospedagem/Ferramentas', value: costBreakdown.hospedagem_ferramentas },
    { name: 'Outro', value: costBreakdown.outro },
  ].filter((d) => d.value > 0)

  const hasRevenue = totalRevenue > 0
  const hasCosts = totalCosts > 0

  return (
    <div>
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Gestão Financeira</h2>
          <p className="text-sm text-gray-500 mt-0.5">Visão financeira do período selecionado</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/admin/financeiro/custos"
            className="text-sm text-brand-text hover:underline border border-brand-200 px-3 py-1.5 rounded-md hover:bg-brand-50 transition-colors"
          >
            Gerenciar Custos
          </a>
          <button
            onClick={() => downloadCSV(monthlyData)}
            className="flex items-center gap-1.5 bg-white border border-gray-300 text-sm text-gray-700 font-medium px-4 py-1.5 rounded-md hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Period selector */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <PeriodSelector period={period} from={from} to={to} />
      </div>

      {/* KPIs — Lucro em destaque */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <KpiCard
          label="Lucro Líquido"
          value={fmtBRL(totalProfit)}
          sub={`Margem ${fmtPct(totalMargin)}`}
          highlight
        />
        <KpiCard label="Faturamento" value={fmtBRL(totalRevenue)} sub="no período" />
        <KpiCard label="Custos Totais" value={fmtBRL(totalCosts)} sub="no período" />
        <KpiCard label="MRR Atual" value={fmtBRL(currentMRR)} sub="receita recorrente" />
        <KpiCard label="ARPU" value={fmtBRL(arpu)} sub="ticket médio mensal" />
      </div>

      {/* Charts row 1: Revenue stacked + Costs pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Faturamento por Origem</h3>
          {!hasRevenue ? (
            <p className="text-sm text-gray-400 text-center py-12">Sem dados no período</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlyData} margin={{ top: 4, right: 8, bottom: 0, left: -8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 6, borderColor: '#e5e7eb' }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(v: any, name: any) => [fmtBRL(v), name]}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="siteRevenue" name="Venda de Site" stackId="a" fill="#10b981" />
                <Bar dataKey="subscriptions" name="Assinaturas" stackId="a" fill="#0D0B1F" />
                <Bar dataKey="upsells" name="Upsells" stackId="a" fill="#2D2850" />
                <Bar
                  dataKey="maintenance"
                  name="Manutenção"
                  stackId="a"
                  fill="#FFD100"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Custos por Categoria</h3>
          {!hasCosts ? (
            <p className="text-sm text-gray-400 text-center py-12">Nenhum custo no período</p>
          ) : (
            <div className="flex items-center justify-between">
              <ResponsiveContainer width="60%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 6 }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(v: any) => [fmtBRL(v), '']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                      />
                      <span className="text-gray-600">{d.name}</span>
                    </div>
                    <span className="font-medium text-gray-800 ml-2">{fmtBRL(d.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Charts row 2: MRR evolution + Client growth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Evolução do MRR</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={mrrByMonth} margin={{ top: 4, right: 8, bottom: 0, left: -8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis
                tick={{ fontSize: 11, fill: '#6b7280' }}
                tickFormatter={(v) => `R$${v}`}
              />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 6, borderColor: '#e5e7eb' }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(v: any) => [fmtBRL(v), 'MRR']}
              />
              <Line
                type="monotone"
                dataKey="mrr"
                name="MRR"
                stroke="#FFD100"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Novos Clientes por Mês</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={clientGrowthByMonth}
              margin={{ top: 4, right: 8, bottom: 0, left: -16 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#6b7280' }} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 6, borderColor: '#e5e7eb' }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(v: any) => [`${v} cliente${v !== 1 ? 's' : ''}`, 'Novos']}
              />
              <Bar dataKey="new" name="Novos clientes" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Inadimplência */}
      {overdueList.length > 0 && (
        <div className="bg-white rounded-lg border border-red-200 p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-red-700">
              Inadimplência — {fmtBRL(totalOverdue)} em aberto
            </h3>
            <span className="text-xs text-red-500">
              {overdueList.length} cobrança{overdueList.length !== 1 ? 's' : ''} vencida
              {overdueList.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-red-100">
                  <th className="pb-2 font-medium text-xs text-gray-500 uppercase tracking-wide">
                    Cliente
                  </th>
                  <th className="pb-2 font-medium text-xs text-gray-500 uppercase tracking-wide text-right">
                    Valor
                  </th>
                  <th className="pb-2 font-medium text-xs text-gray-500 uppercase tracking-wide">
                    Vencimento
                  </th>
                  <th className="pb-2 font-medium text-xs text-gray-500 uppercase tracking-wide text-right">
                    Dias em atraso
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-50">
                {overdueList.map((item, i) => (
                  <tr key={i}>
                    <td className="py-2 text-gray-800">{item.clientName}</td>
                    <td className="py-2 text-right font-medium text-red-700">
                      {fmtBRL(item.amount)}
                    </td>
                    <td className="py-2 text-gray-500">
                      {new Date(item.dueDate).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-2 text-right">
                      <span className="text-red-600 font-medium">{item.daysOverdue}d</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Monthly comparison table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700">Comparativo Mês a Mês</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left">
                <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  Mês
                </th>
                <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wide text-right whitespace-nowrap">
                  Faturamento
                </th>
                <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wide text-right whitespace-nowrap">
                  Custos
                </th>
                <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wide text-right whitespace-nowrap">
                  Lucro
                </th>
                <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wide text-right whitespace-nowrap">
                  Margem
                </th>
                <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wide text-right whitespace-nowrap">
                  MRR
                </th>
                <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wide text-right whitespace-nowrap">
                  Novos clientes
                </th>
                <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wide text-right whitespace-nowrap">
                  Cresc. %
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {monthlyData.map((row, i) => {
                const prev = monthlyData[i - 1]
                const growth =
                  prev && prev.totalRevenue > 0
                    ? ((row.totalRevenue - prev.totalRevenue) / prev.totalRevenue) * 100
                    : null

                return (
                  <tr key={row.month} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{row.label}</td>
                    <td className="px-4 py-3 text-right text-gray-800">
                      {fmtBRL(row.totalRevenue)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {fmtBRL(row.totalCosts)}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-medium ${
                        row.profit >= 0 ? 'text-green-700' : 'text-red-600'
                      }`}
                    >
                      {fmtBRL(row.profit)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {row.totalRevenue > 0 ? fmtPct(row.margin) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {fmtBRL(row.subscriptions)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">{row.newClients}</td>
                    <td className="px-4 py-3 text-right">
                      {growth === null ? (
                        <span className="text-gray-400">—</span>
                      ) : (
                        <span
                          className={`font-medium ${
                            growth >= 0 ? 'text-green-600' : 'text-red-500'
                          }`}
                        >
                          {growth >= 0 ? '+' : ''}
                          {fmtPct(growth)}
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
            {monthlyData.length > 1 && (
              <tfoot>
                <tr className="bg-gray-50 border-t-2 border-gray-200 font-semibold">
                  <td className="px-4 py-3 text-gray-700">Total</td>
                  <td className="px-4 py-3 text-right text-gray-800">{fmtBRL(totalRevenue)}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{fmtBRL(totalCosts)}</td>
                  <td
                    className={`px-4 py-3 text-right ${
                      totalProfit >= 0 ? 'text-green-700' : 'text-red-600'
                    }`}
                  >
                    {fmtBRL(totalProfit)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {fmtPct(totalMargin)}
                  </td>
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3 text-right text-gray-600">
                    {monthlyData.reduce((a, r) => a + r.newClients, 0)}
                  </td>
                  <td className="px-4 py-3" />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  )
}
