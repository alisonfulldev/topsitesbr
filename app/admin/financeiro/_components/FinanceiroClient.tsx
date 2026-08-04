'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState, useTransition, useMemo } from 'react'
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
import { deleteFinanceiroEntry, updateSystemSetting } from '../actions'

export type MonthlyRow = {
  month: string
  label: string
  subscriptions: number
  upsells: number
  maintenance: number
  siteRevenue: number
  extraRevenue: number
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

export type TransactionItem = {
  id: string
  type: 'receita' | 'despesa'
  deleteType: 'order' | 'cost' | 'extra_revenue' | 'site_revenue'
  date: string
  amount: number
  clientName?: string
  origin: string
  paymentMethod?: 'asaas' | 'externo'
  description?: string
  canDelete: boolean
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

function PeriodSelector({ period, from, to, granularity }: { period: string; from?: string; to?: string; granularity: string }) {
  const router = useRouter()
  const pathname = usePathname()

  function navigate(p: string, f?: string, t?: string) {
    const params = new URLSearchParams()
    params.set('period', p)
    params.set('granularity', granularity)
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

function KpiCard({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg border p-4 ${highlight ? 'bg-brand-dark border-brand-dark' : 'bg-white border-gray-200'}`}>
      <p className={`text-xs font-medium uppercase tracking-wide ${highlight ? 'text-gray-400' : 'text-gray-500'}`}>
        {label}
      </p>
      <p className={`text-2xl font-bold mt-1 ${highlight ? 'text-white' : 'text-gray-900'}`}>{value}</p>
      {sub && <p className={`text-xs mt-0.5 ${highlight ? 'text-gray-300' : 'text-gray-400'}`}>{sub}</p>}
    </div>
  )
}

function GranularityToggle({ granularity, period, from, to }: { granularity: string; period: string; from?: string; to?: string }) {
  const router = useRouter()
  const pathname = usePathname()

  function toggle(g: string) {
    const params = new URLSearchParams()
    params.set('period', period)
    params.set('granularity', g)
    if (period === 'custom' && from && to) {
      params.set('from', from)
      params.set('to', to)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-1 rounded-md border border-gray-300 p-0.5 bg-gray-50">
      {(['mes', 'quinzena'] as const).map((g) => (
        <button
          key={g}
          onClick={() => toggle(g)}
          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
            granularity === g ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {g === 'mes' ? 'Mês' : 'Quinzena'}
        </button>
      ))}
    </div>
  )
}

function TrafficReserveCard({ totalRevenue, percent }: { totalRevenue: number; percent: number }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [inputValue, setInputValue] = useState(String(percent))
  const [isPending, startTransition] = useTransition()
  const [saveError, setSaveError] = useState('')

  const displayPercent = editing ? (parseFloat(inputValue) || 0) : percent
  const reserveAmount = totalRevenue * (displayPercent / 100)

  function handleSave() {
    const val = parseFloat(inputValue)
    if (isNaN(val) || val < 0 || val > 100) {
      setSaveError('Percentual inválido (0–100)')
      return
    }
    setSaveError('')
    startTransition(async () => {
      const result = await updateSystemSetting('traffic_reserve_percent', String(val))
      if (result.error) {
        setSaveError(result.error)
      } else {
        setEditing(false)
        router.refresh()
      }
    })
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 col-span-2 lg:col-span-1">
      <p className="text-xs font-medium uppercase tracking-wide text-amber-600 mb-1">Reserva p/ Tráfego Pago</p>
      {editing ? (
        <div className="flex items-center gap-2 flex-wrap mt-1">
          <input
            type="number"
            min="0"
            max="100"
            step="1"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-16 border border-amber-300 rounded px-2 py-1 text-sm text-center bg-white focus:outline-none focus:ring-1 focus:ring-amber-400"
            autoFocus
          />
          <span className="text-sm text-amber-700">% = {fmtBRL(reserveAmount)}</span>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="text-xs px-2.5 py-1 bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-50"
          >
            {isPending ? '…' : 'Salvar'}
          </button>
          <button onClick={() => { setEditing(false); setInputValue(String(percent)) }} className="text-xs text-amber-500 hover:text-amber-700">
            Cancelar
          </button>
        </div>
      ) : (
        <div className="flex items-end gap-2 mt-1">
          <p className="text-2xl font-bold text-amber-700">{fmtBRL(reserveAmount)}</p>
          <button onClick={() => setEditing(true)} className="text-xs text-amber-500 hover:text-amber-700 underline mb-0.5">
            {percent}%
          </button>
        </div>
      )}
      {saveError && <p className="text-xs text-red-600 mt-1">{saveError}</p>}
      <p className="text-xs text-amber-500 mt-1.5 leading-relaxed">
        Orientativo — quanto separar para reinvestir. Não é custo e não deduz do lucro.
      </p>
    </div>
  )
}

function generateRecentQuinzenas(count: number) {
  const now = new Date()
  let year = now.getFullYear()
  let month = now.getMonth() + 1
  let half = now.getDate() <= 15 ? 1 : 2
  const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  const result: { key: string; label: string; monthFrom: string; monthTo: string }[] = []
  for (let i = 0; i < count; i++) {
    const y = String(year)
    const m = String(month).padStart(2, '0')
    const key = `${y}-${m}-${half}`
    const lastDay = new Date(year, month, 0).getDate()
    const rangeStr = half === 1 ? '01–15' : `16–${lastDay}`
    const ordinal = half === 1 ? '1ª' : '2ª'
    result.push({
      key,
      label: `${ordinal} quinzena ${MONTHS[month - 1]}/${y.slice(2)} (${rangeStr})`,
      monthFrom: `${y}-${m}-01`,
      monthTo: `${y}-${m}-${String(lastDay).padStart(2, '0')}`,
    })
    if (half === 2) { half = 1 } else { half = 2; month--; if (month === 0) { month = 12; year-- } }
  }
  return result
}

function quinzenaDisplayName(key: string): string {
  const parts = key.split('-')
  const year = parts[0], month = parts[1], half = parts[2]
  const MONTHS_FULL = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                       'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
  const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate()
  const range = half === '1' ? '01–15' : `16–${lastDay}`
  const ordinal = half === '1' ? '1ª' : '2ª'
  return `${ordinal} quinzena de ${MONTHS_FULL[parseInt(month) - 1]} de ${year} (${range})`
}

function QuinzenaSelector({ selectedQuinzena }: { selectedQuinzena?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const options = useMemo(() => generateRecentQuinzenas(8), [])

  function select(opt: typeof options[0]) {
    const params = new URLSearchParams()
    params.set('period', 'custom')
    params.set('from', opt.monthFrom)
    params.set('to', opt.monthTo)
    params.set('granularity', 'quinzena')
    params.set('selectedQuinzena', opt.key)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-gray-500 font-medium">Ver quinzena:</span>
      <select
        value={selectedQuinzena ?? ''}
        onChange={(e) => {
          const opt = options.find((o) => o.key === e.target.value)
          if (opt) select(opt)
        }}
        className="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
      >
        <option value="" disabled>Selecione…</option>
        {options.map((o) => (
          <option key={o.key} value={o.key}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

function downloadCSV(rows: MonthlyRow[]) {
  const headers = [
    'Mês', 'Faturamento Total', 'Venda de Site', 'Receitas Avulsas',
    'Assinaturas', 'Upsells', 'Manutenção', 'Custos Totais', 'IA',
    'Tráfego Pago', 'Hospedagem/Ferramentas', 'Outros Custos', 'Lucro Líquido', 'Margem %', 'Novos Clientes',
  ]
  const csvRows = [
    headers.join(';'),
    ...rows.map((r) =>
      [
        r.label,
        r.totalRevenue.toFixed(2).replace('.', ','),
        r.siteRevenue.toFixed(2).replace('.', ','),
        r.extraRevenue.toFixed(2).replace('.', ','),
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

// ─── Transaction list sub-component ─────────────────────────────────────────

function TransactionList({ transactions }: { transactions: TransactionItem[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'todos' | 'receita' | 'despesa'>('todos')
  const [monthFilter, setMonthFilter] = useState('todos')
  const [deleteTarget, setDeleteTarget] = useState<TransactionItem | null>(null)
  const [deleteError, setDeleteError] = useState('')

  // Derive available months from transactions
  const availableMonths = useMemo(() => {
    const keys = new Set<string>()
    for (const t of transactions) {
      const d = new Date(t.date)
      keys.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
    }
    return Array.from(keys).sort().reverse()
  }, [transactions])

  function monthKeyLabel(key: string) {
    const [year, month] = key.split('-')
    const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    return `${MONTHS[parseInt(month) - 1]}/${year.slice(2)}`
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return transactions.filter((t) => {
      if (typeFilter !== 'todos' && t.type !== typeFilter) return false
      if (monthFilter !== 'todos') {
        const d = new Date(t.date)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        if (key !== monthFilter) return false
      }
      if (q) {
        const haystack = [t.clientName, t.origin, t.description].filter(Boolean).join(' ').toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [transactions, typeFilter, monthFilter, search])

  function handleDelete() {
    if (!deleteTarget) return
    setDeleteError('')
    startTransition(async () => {
      const result = await deleteFinanceiroEntry(deleteTarget.deleteType, deleteTarget.id)
      if (result.error) {
        setDeleteError(result.error)
      } else {
        setDeleteTarget(null)
        router.refresh()
      }
    })
  }

  const totalFiltered = filtered.reduce((sum, t) => {
    return t.type === 'receita' ? sum + t.amount : sum - t.amount
  }, 0)

  return (
    <div className="bg-white rounded-lg border border-gray-200 mt-6">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-sm font-semibold text-gray-700">
          Lançamentos Detalhados
          <span className="ml-2 text-xs font-normal text-gray-400">({filtered.length} registros)</span>
        </h3>
        {filtered.length > 0 && (
          <span className={`text-sm font-semibold ${totalFiltered >= 0 ? 'text-green-700' : 'text-red-600'}`}>
            Saldo filtrado: {fmtBRL(totalFiltered)}
          </span>
        )}
      </div>

      {/* Filters */}
      <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap gap-2 items-center">
        <input
          type="text"
          placeholder="Buscar por cliente ou descrição…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand w-56"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
        >
          <option value="todos">Todos os tipos</option>
          <option value="receita">Receitas</option>
          <option value="despesa">Despesas</option>
        </select>
        <select
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
        >
          <option value="todos">Todos os meses</option>
          {availableMonths.map((m) => (
            <option key={m} value={m}>{monthKeyLabel(m)}</option>
          ))}
        </select>
        {(search || typeFilter !== 'todos' || monthFilter !== 'todos') && (
          <button
            onClick={() => { setSearch(''); setTypeFilter('todos'); setMonthFilter('todos') }}
            className="text-xs text-gray-400 hover:text-gray-600 underline"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-10">Nenhum lançamento encontrado.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left">
                <th className="px-4 py-2.5 font-medium text-xs text-gray-500 uppercase tracking-wide whitespace-nowrap">Data</th>
                <th className="px-4 py-2.5 font-medium text-xs text-gray-500 uppercase tracking-wide">Cliente / Descrição</th>
                <th className="px-4 py-2.5 font-medium text-xs text-gray-500 uppercase tracking-wide">Tipo / Origem</th>
                <th className="px-4 py-2.5 font-medium text-xs text-gray-500 uppercase tracking-wide whitespace-nowrap">Método</th>
                <th className="px-4 py-2.5 font-medium text-xs text-gray-500 uppercase tracking-wide text-right whitespace-nowrap">Valor</th>
                <th className="px-4 py-2.5 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((t) => (
                <tr key={`${t.type}-${t.id}`} className="hover:bg-gray-50 group">
                  <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap text-xs">
                    {new Date(t.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-2.5 text-gray-800 max-w-[200px]">
                    {t.type === 'receita' ? (
                      <span className="font-medium">{t.clientName ?? '—'}</span>
                    ) : (
                      <span className="text-gray-600">{t.description ?? '—'}</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 max-w-[180px]">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-flex shrink-0 w-1.5 h-1.5 rounded-full ${
                          t.type === 'receita' ? 'bg-green-500' : 'bg-red-400'
                        }`}
                      />
                      <span className="text-gray-600 text-xs truncate">{t.origin}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    {t.paymentMethod === 'asaas' ? (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">Asaas</span>
                    ) : t.paymentMethod === 'externo' ? (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">Externo</span>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                  <td className={`px-4 py-2.5 text-right font-medium whitespace-nowrap ${t.type === 'receita' ? 'text-green-700' : 'text-red-600'}`}>
                    {t.type === 'despesa' && '−'}{fmtBRL(t.amount)}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {t.canDelete ? (
                      <button
                        type="button"
                        onClick={() => { setDeleteTarget(t); setDeleteError('') }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-opacity rounded"
                        title="Excluir lançamento"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    ) : (
                      <span className="w-6 inline-block" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="font-semibold text-gray-900 mb-1">Excluir lançamento?</h3>
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-medium">
                {deleteTarget.type === 'receita' ? deleteTarget.clientName : deleteTarget.description}
              </span>
              {' — '}{fmtBRL(deleteTarget.amount)}
            </p>
            <p className="text-xs text-gray-400 mb-5">
              Esta ação afeta os totais do financeiro e não pode ser desfeita. O cliente e demais dados não são apagados.
            </p>
            {deleteError && (
              <p className="text-xs text-red-600 mb-3">{deleteError}</p>
            )}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isPending}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isPending ? 'Excluindo…' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function FinanceiroClient({
  period, granularity, from, to, selectedQuinzena,
  monthlyData, quinzenaData, totalRevenue, totalCosts, totalProfit, totalMargin,
  currentMRR, arpu, overdueList, totalOverdue, costBreakdown,
  mrrByMonth, clientGrowthByMonth, transactions, trafficReservePercent,
}: {
  period: string
  granularity: string
  from?: string
  to?: string
  selectedQuinzena?: string
  monthlyData: MonthlyRow[]
  quinzenaData: MonthlyRow[]
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
  transactions: TransactionItem[]
  trafficReservePercent: number
}) {
  const displayData = selectedQuinzena
    ? quinzenaData.filter((r) => r.month === selectedQuinzena)
    : granularity === 'quinzena'
      ? quinzenaData
      : monthlyData
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
        <div className="flex items-center gap-2 flex-wrap">
          <a href="/admin/financeiro/distribuicao" className="text-sm text-brand-text hover:underline border border-brand-200 px-3 py-1.5 rounded-md hover:bg-brand-50 transition-colors">
            Distribuição
          </a>
          <a href="/admin/financeiro/receitas" className="text-sm text-brand-text hover:underline border border-brand-200 px-3 py-1.5 rounded-md hover:bg-brand-50 transition-colors">
            Receitas Avulsas
          </a>
          <a href="/admin/financeiro/custos" className="text-sm text-brand-text hover:underline border border-brand-200 px-3 py-1.5 rounded-md hover:bg-brand-50 transition-colors">
            Gerenciar Custos
          </a>
          <button
            onClick={() => downloadCSV(displayData)}
            className="flex items-center gap-1.5 bg-white border border-gray-300 text-sm text-gray-700 font-medium px-4 py-1.5 rounded-md hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Period selector + granularity toggle */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4 flex flex-wrap items-center gap-4 justify-between">
        <PeriodSelector period={period} from={from} to={to} granularity={granularity} />
        <GranularityToggle granularity={granularity} period={period} from={from} to={to} />
      </div>

      {/* Quinzena selector — visible only in quinzena mode */}
      {granularity === 'quinzena' && (
        <div className="bg-white rounded-lg border border-gray-200 p-3 mb-4 flex flex-wrap items-center gap-3">
          <QuinzenaSelector selectedQuinzena={selectedQuinzena} />
          {selectedQuinzena && (
            <span className="text-sm font-medium text-gray-700">
              Fechamento: <span className="text-brand-text">{quinzenaDisplayName(selectedQuinzena)}</span>
            </span>
          )}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <KpiCard
          label="Lucro Líquido"
          value={fmtBRL(totalProfit)}
          sub={`Margem ${fmtPct(totalMargin)}`}
          highlight
        />
        <KpiCard
          label="Faturamento"
          value={fmtBRL(totalRevenue)}
          sub={selectedQuinzena ? 'da quinzena' : 'no período'}
        />
        <KpiCard
          label="Custos Totais"
          value={fmtBRL(totalCosts)}
          sub={selectedQuinzena ? 'da quinzena' : 'no período'}
        />
        <KpiCard label="MRR Atual" value={fmtBRL(currentMRR)} sub="receita recorrente" />
        <KpiCard label="ARPU" value={fmtBRL(arpu)} sub="ticket médio mensal" />
        <TrafficReserveCard totalRevenue={totalRevenue} percent={trafficReservePercent} />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Faturamento por Origem</h3>
          {!hasRevenue ? (
            <p className="text-sm text-gray-400 text-center py-12">Sem dados no período</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={displayData} margin={{ top: 4, right: 8, bottom: 0, left: -8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, borderColor: '#e5e7eb' }} formatter={(v: unknown, name: unknown) => [fmtBRL(v as number), name as string]} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="extraRevenue" name="Receitas Avulsas" stackId="a" fill="#f59e0b" />
                <Bar dataKey="siteRevenue" name="Venda de Site" stackId="a" fill="#10b981" />
                <Bar dataKey="subscriptions" name="Assinaturas" stackId="a" fill="#0D0B1F" />
                <Bar dataKey="upsells" name="Upsells" stackId="a" fill="#2D2850" />
                <Bar dataKey="maintenance" name="Manutenção" stackId="a" fill="#FFD100" radius={[4, 4, 0, 0]} />
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
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} formatter={(v: unknown) => [fmtBRL(v as number), '']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
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

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Evolução do MRR</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={mrrByMonth} margin={{ top: 4, right: 8, bottom: 0, left: -8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={(v) => `R$${v}`} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, borderColor: '#e5e7eb' }} formatter={(v: unknown) => [fmtBRL(v as number), 'MRR']} />
              <Line type="monotone" dataKey="mrr" name="MRR" stroke="#FFD100" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Novos Clientes por Mês</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={clientGrowthByMonth} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#6b7280' }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, borderColor: '#e5e7eb' }} formatter={(v: unknown) => [`${v} cliente${(v as number) !== 1 ? 's' : ''}`, 'Novos']} />
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
              {overdueList.length} cobrança{overdueList.length !== 1 ? 's' : ''} vencida{overdueList.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-red-100">
                  <th className="pb-2 font-medium text-xs text-gray-500 uppercase tracking-wide">Cliente</th>
                  <th className="pb-2 font-medium text-xs text-gray-500 uppercase tracking-wide text-right">Valor</th>
                  <th className="pb-2 font-medium text-xs text-gray-500 uppercase tracking-wide">Vencimento</th>
                  <th className="pb-2 font-medium text-xs text-gray-500 uppercase tracking-wide text-right">Dias em atraso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-50">
                {overdueList.map((item, i) => (
                  <tr key={i}>
                    <td className="py-2 text-gray-800">{item.clientName}</td>
                    <td className="py-2 text-right font-medium text-red-700">{fmtBRL(item.amount)}</td>
                    <td className="py-2 text-gray-500">{new Date(item.dueDate).toLocaleDateString('pt-BR')}</td>
                    <td className="py-2 text-right"><span className="text-red-600 font-medium">{item.daysOverdue}d</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Comparison table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700">
            {granularity === 'quinzena' ? 'Comparativo por Quinzena' : 'Comparativo Mês a Mês'}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left">
                <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  {granularity === 'quinzena' ? 'Quinzena' : 'Mês'}
                </th>
                <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wide text-right whitespace-nowrap">Faturamento</th>
                <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wide text-right whitespace-nowrap">Custos</th>
                <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wide text-right whitespace-nowrap">Lucro</th>
                <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wide text-right whitespace-nowrap">Margem</th>
                <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wide text-right whitespace-nowrap">MRR</th>
                <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wide text-right whitespace-nowrap">Novos clientes</th>
                <th className="px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wide text-right whitespace-nowrap">Cresc. %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayData.map((row, i) => {
                const prev = displayData[i - 1]
                const growth =
                  prev && prev.totalRevenue > 0
                    ? ((row.totalRevenue - prev.totalRevenue) / prev.totalRevenue) * 100
                    : null
                return (
                  <tr key={row.month} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{row.label}</td>
                    <td className="px-4 py-3 text-right text-gray-800">{fmtBRL(row.totalRevenue)}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{fmtBRL(row.totalCosts)}</td>
                    <td className={`px-4 py-3 text-right font-medium ${row.profit >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                      {fmtBRL(row.profit)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">{row.totalRevenue > 0 ? fmtPct(row.margin) : '—'}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{fmtBRL(row.subscriptions)}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{row.newClients}</td>
                    <td className="px-4 py-3 text-right">
                      {growth === null ? (
                        <span className="text-gray-400">—</span>
                      ) : (
                        <span className={`font-medium ${growth >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                          {growth >= 0 ? '+' : ''}{fmtPct(growth)}
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
            {displayData.length > 1 && (
              <tfoot>
                <tr className="bg-gray-50 border-t-2 border-gray-200 font-semibold">
                  <td className="px-4 py-3 text-gray-700">Total</td>
                  <td className="px-4 py-3 text-right text-gray-800">{fmtBRL(totalRevenue)}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{fmtBRL(totalCosts)}</td>
                  <td className={`px-4 py-3 text-right ${totalProfit >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                    {fmtBRL(totalProfit)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">{fmtPct(totalMargin)}</td>
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3 text-right text-gray-600">{displayData.reduce((a, r) => a + r.newClients, 0)}</td>
                  <td className="px-4 py-3" />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Transaction list */}
      <TransactionList transactions={transactions} />
    </div>
  )
}
