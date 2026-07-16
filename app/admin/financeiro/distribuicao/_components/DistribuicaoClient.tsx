'use client'

import { useState, useTransition } from 'react'
import {
  createFixedCost, updateFixedCost, deleteFixedCost,
  createAllocationRule, updateAllocationRule, deleteAllocationRule,
} from '../actions'

export type FixedCostRow = { id: string; name: string; amount: number; order: number }
export type RuleRow = { id: string; name: string; percent: number; color: string; order: number }

function fmtBRL(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#14b8a6','#f97316']

// ── Fixed Cost Form ───────────────────────────────────────────────────────────

function FixedCostForm({ initial, onDone }: { initial?: FixedCostRow; onDone: () => void }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [amount, setAmount] = useState(initial?.amount.toFixed(2) ?? '')
  const [error, setError] = useState('')
  const [pending, start] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return setError('Informe o nome.')
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) return setError('Valor inválido.')
    setError('')
    start(async () => {
      if (initial) await updateFixedCost(initial.id, { name, amount })
      else await createFixedCost({ name, amount })
      onDone()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end flex-wrap">
      <div className="flex-1 min-w-[160px]">
        <label className="block text-xs font-medium text-gray-600 mb-1">Nome</label>
        <input value={name} onChange={e => setName(e.target.value)}
          placeholder="Ex: Canva, Vercel…"
          className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
      </div>
      <div className="w-32">
        <label className="block text-xs font-medium text-gray-600 mb-1">Valor (R$)</label>
        <input type="number" step="0.01" min="0" value={amount} onChange={e => setAmount(e.target.value)}
          placeholder="0,00"
          className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
      </div>
      {error && <p className="text-xs text-red-600 w-full">{error}</p>}
      <button type="submit" disabled={pending}
        className="px-3 py-1.5 bg-brand text-brand-dark text-sm font-medium rounded-md hover:bg-brand-hover disabled:opacity-50">
        {pending ? '…' : initial ? 'Salvar' : 'Adicionar'}
      </button>
      <button type="button" onClick={onDone}
        className="px-3 py-1.5 border border-gray-300 text-sm text-gray-600 rounded-md hover:bg-gray-50">
        Cancelar
      </button>
    </form>
  )
}

// ── Allocation Rule Form ──────────────────────────────────────────────────────

function RuleForm({ initial, onDone }: { initial?: RuleRow; onDone: () => void }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [percent, setPercent] = useState(initial?.percent.toFixed(1) ?? '')
  const [color, setColor] = useState(initial?.color ?? COLORS[0])
  const [error, setError] = useState('')
  const [pending, start] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return setError('Informe o nome.')
    const pct = parseFloat(percent)
    if (isNaN(pct) || pct <= 0 || pct > 100) return setError('Percentual inválido (1–100).')
    setError('')
    start(async () => {
      if (initial) await updateAllocationRule(initial.id, { name, percent, color })
      else await createAllocationRule({ name, percent, color })
      onDone()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end flex-wrap">
      <div className="flex-1 min-w-[160px]">
        <label className="block text-xs font-medium text-gray-600 mb-1">Destino</label>
        <input value={name} onChange={e => setName(e.target.value)}
          placeholder="Ex: Caixa, Pró-labore…"
          className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
      </div>
      <div className="w-24">
        <label className="block text-xs font-medium text-gray-600 mb-1">% do lucro</label>
        <input type="number" step="0.1" min="0.1" max="100" value={percent} onChange={e => setPercent(e.target.value)}
          placeholder="10"
          className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Cor</label>
        <div className="flex gap-1">
          {COLORS.map(c => (
            <button key={c} type="button" onClick={() => setColor(c)}
              className={`w-6 h-6 rounded-full border-2 ${color === c ? 'border-gray-800' : 'border-transparent'}`}
              style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>
      {error && <p className="text-xs text-red-600 w-full">{error}</p>}
      <button type="submit" disabled={pending}
        className="px-3 py-1.5 bg-brand text-brand-dark text-sm font-medium rounded-md hover:bg-brand-hover disabled:opacity-50">
        {pending ? '…' : initial ? 'Salvar' : 'Adicionar'}
      </button>
      <button type="button" onClick={onDone}
        className="px-3 py-1.5 border border-gray-300 text-sm text-gray-600 rounded-md hover:bg-gray-50">
        Cancelar
      </button>
    </form>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export function DistribuicaoClient({
  fixedCosts,
  rules,
  monthRevenue,
  monthLabel,
}: {
  fixedCosts: FixedCostRow[]
  rules: RuleRow[]
  monthRevenue: number
  monthLabel: string
}) {
  const [addingCost, setAddingCost] = useState(false)
  const [editingCost, setEditingCost] = useState<FixedCostRow | null>(null)
  const [addingRule, setAddingRule] = useState(false)
  const [editingRule, setEditingRule] = useState<RuleRow | null>(null)
  const [deletePending, startDelete] = useTransition()

  const totalFixed = fixedCosts.reduce((a, c) => a + c.amount, 0)
  const profit = monthRevenue - totalFixed
  const totalAllocatedPct = rules.reduce((a, r) => a + r.percent, 0)
  const totalAllocated = rules.reduce((a, r) => a + (profit > 0 ? profit * r.percent / 100 : 0), 0)
  const free = profit > 0 ? profit - totalAllocated : 0

  function handleDeleteCost(id: string) {
    startDelete(async () => { await deleteFixedCost(id) })
  }
  function handleDeleteRule(id: string) {
    startDelete(async () => { await deleteAllocationRule(id) })
  }

  return (
    <div className="space-y-6">
      {/* Result card */}
      <div className="bg-brand-dark rounded-2xl p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">{monthLabel}</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">Faturamento</p>
            <p className="text-xl font-bold text-white">{fmtBRL(monthRevenue)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Custos Fixos</p>
            <p className="text-xl font-bold text-red-400">- {fmtBRL(totalFixed)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Lucro</p>
            <p className={`text-xl font-bold ${profit >= 0 ? 'text-brand' : 'text-red-400'}`}>{fmtBRL(profit)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Livre ({(100 - totalAllocatedPct).toFixed(0)}%)</p>
            <p className="text-xl font-bold text-white">{fmtBRL(Math.max(0, free))}</p>
          </div>
        </div>

        {/* Allocation bars */}
        {profit > 0 && rules.length > 0 && (
          <div className="mt-5">
            <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
              {rules.map(r => (
                <div key={r.id} style={{ width: `${r.percent}%`, backgroundColor: r.color }} title={`${r.name}: ${r.percent}%`} />
              ))}
              <div style={{ width: `${Math.max(0, 100 - totalAllocatedPct)}%` }} className="bg-white/10" title="Livre" />
            </div>
            <div className="flex flex-wrap gap-3 mt-2">
              {rules.map(r => (
                <div key={r.id} className="flex items-center gap-1.5 text-xs text-gray-300">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: r.color }} />
                  {r.name}: <strong className="text-white">{fmtBRL(profit * r.percent / 100)}</strong>
                  <span className="text-gray-500">({r.percent}%)</span>
                </div>
              ))}
              {free > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-gray-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-white/20 shrink-0" />
                  Livre: <strong className="text-white">{fmtBRL(free)}</strong>
                </div>
              )}
            </div>
          </div>
        )}
        {profit <= 0 && (
          <p className="mt-4 text-xs text-red-400">Lucro negativo — custos fixos superam o faturamento do mês.</p>
        )}
      </div>

      {/* Fixed costs */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Custos Fixos Mensais</h3>
            <p className="text-xs text-gray-500 mt-0.5">Total: <strong>{fmtBRL(totalFixed)}</strong></p>
          </div>
          {!addingCost && !editingCost && (
            <button onClick={() => setAddingCost(true)}
              className="text-sm text-brand-text hover:underline font-medium">
              + Adicionar
            </button>
          )}
        </div>

        {(addingCost && !editingCost) && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <FixedCostForm onDone={() => setAddingCost(false)} />
          </div>
        )}

        <div className="space-y-2">
          {fixedCosts.map(cost => (
            <div key={cost.id}>
              {editingCost?.id === cost.id ? (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <FixedCostForm initial={cost} onDone={() => setEditingCost(null)} />
                </div>
              ) : (
                <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-800">{cost.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-red-600">{fmtBRL(cost.amount)}</span>
                    <button onClick={() => { setEditingCost(cost); setAddingCost(false) }}
                      className="text-xs text-gray-400 hover:text-brand-text">Editar</button>
                    <button onClick={() => handleDeleteCost(cost.id)} disabled={deletePending}
                      className="text-xs text-red-400 hover:text-red-600 disabled:opacity-50">Excluir</button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {fixedCosts.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">Nenhum custo fixo cadastrado.</p>
          )}
        </div>
      </div>

      {/* Allocation rules */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Distribuição do Lucro</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {totalAllocatedPct.toFixed(0)}% alocado · {(100 - totalAllocatedPct).toFixed(0)}% livre
              {totalAllocatedPct > 100 && <span className="text-red-500 ml-1">— total ultrapassa 100%!</span>}
            </p>
          </div>
          {!addingRule && !editingRule && (
            <button onClick={() => setAddingRule(true)}
              className="text-sm text-brand-text hover:underline font-medium">
              + Adicionar
            </button>
          )}
        </div>

        {(addingRule && !editingRule) && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <RuleForm onDone={() => setAddingRule(false)} />
          </div>
        )}

        <div className="space-y-2">
          {rules.map(rule => (
            <div key={rule.id}>
              {editingRule?.id === rule.id ? (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <RuleForm initial={rule} onDone={() => setEditingRule(null)} />
                </div>
              ) : (
                <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: rule.color }} />
                    <span className="text-sm text-gray-800">{rule.name}</span>
                    <span className="text-xs text-gray-400">{rule.percent}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-green-700">
                      {profit > 0 ? fmtBRL(profit * rule.percent / 100) : '—'}
                    </span>
                    <button onClick={() => { setEditingRule(rule); setAddingRule(false) }}
                      className="text-xs text-gray-400 hover:text-brand-text">Editar</button>
                    <button onClick={() => handleDeleteRule(rule.id)} disabled={deletePending}
                      className="text-xs text-red-400 hover:text-red-600 disabled:opacity-50">Excluir</button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {rules.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">Nenhuma regra cadastrada.</p>
          )}
        </div>
      </div>
    </div>
  )
}
