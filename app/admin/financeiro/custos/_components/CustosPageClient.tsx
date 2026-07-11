'use client'

import { useState, useTransition } from 'react'
import { createCost, updateCost, deleteCost } from '../actions'
import { CostCategory } from '@prisma/client'

export type CostRow = {
  id: string
  category: CostCategory
  description: string
  amount: number
  costDate: string
  isRecurring: boolean
  recurrenceFrequency: string | null
}

const CATEGORY_LABELS: Record<CostCategory, string> = {
  ia: 'IA',
  trafego_pago: 'Tráfego Pago',
  hospedagem_ferramentas: 'Hospedagem/Ferramentas',
  outro: 'Outro',
}

const CATEGORY_COLORS: Record<CostCategory, string> = {
  ia: 'bg-purple-100 text-purple-700',
  trafego_pago: 'bg-blue-100 text-blue-700',
  hospedagem_ferramentas: 'bg-green-100 text-green-700',
  outro: 'bg-gray-100 text-gray-600',
}

function fmtBRL(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function toDateInput(iso: string) {
  return iso.slice(0, 10)
}

type FormState = {
  category: CostCategory
  description: string
  amount: string
  costDate: string
  isRecurring: boolean
  recurrenceFrequency: string
}

const DEFAULT_FORM: FormState = {
  category: 'outro',
  description: '',
  amount: '',
  costDate: new Date().toISOString().slice(0, 10),
  isRecurring: false,
  recurrenceFrequency: 'mensal',
}

function CostForm({
  initial,
  onSuccess,
  onCancel,
}: {
  initial?: CostRow
  onSuccess: () => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<FormState>(
    initial
      ? {
          category: initial.category,
          description: initial.description,
          amount: initial.amount.toFixed(2),
          costDate: toDateInput(initial.costDate),
          isRecurring: initial.isRecurring,
          recurrenceFrequency: initial.recurrenceFrequency || 'mensal',
        }
      : DEFAULT_FORM
  )
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  function set<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.description.trim()) return setError('Informe a descrição.')
    const amt = parseFloat(form.amount)
    if (isNaN(amt) || amt <= 0) return setError('Valor inválido.')
    if (!form.costDate) return setError('Informe a data.')
    setError('')

    startTransition(async () => {
      if (initial) {
        await updateCost(initial.id, form)
      } else {
        await createCost(form)
      }
      onSuccess()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Categoria</label>
          <select
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            value={form.category}
            onChange={(e) => set('category', e.target.value as CostCategory)}
          >
            {(Object.keys(CATEGORY_LABELS) as CostCategory[]).map((k) => (
              <option key={k} value={k}>
                {CATEGORY_LABELS[k]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Data</label>
          <input
            type="date"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            value={form.costDate}
            onChange={(e) => set('costDate', e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Descrição</label>
        <input
          type="text"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          placeholder="Ex: ChatGPT Plus, Meta Ads, Vercel Pro…"
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Valor (R$)</label>
        <input
          type="number"
          step="0.01"
          min="0"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          placeholder="0,00"
          value={form.amount}
          onChange={(e) => set('amount', e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="isRecurring"
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300 text-brand-text"
          checked={form.isRecurring}
          onChange={(e) => set('isRecurring', e.target.checked)}
        />
        <label htmlFor="isRecurring" className="text-sm text-gray-700">
          Custo recorrente
        </label>
      </div>

      {form.isRecurring && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Frequência</label>
          <select
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            value={form.recurrenceFrequency}
            onChange={(e) => set('recurrenceFrequency', e.target.value)}
          >
            <option value="mensal">Mensal</option>
            <option value="anual">Anual</option>
          </select>
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 bg-brand text-brand-dark text-sm font-medium py-2 rounded-md hover:bg-brand-hover disabled:opacity-50 transition-colors"
        >
          {pending ? 'Salvando…' : initial ? 'Salvar alterações' : 'Adicionar custo'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}

export function CustosPageClient({
  costs,
  generatedCount,
}: {
  costs: CostRow[]
  generatedCount: number
}) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<CostRow | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<CostCategory | 'all'>('all')
  const [filterMonth, setFilterMonth] = useState('')
  const [deletePending, startDeleteTransition] = useTransition()

  const filtered = costs.filter((c) => {
    if (filterCategory !== 'all' && c.category !== filterCategory) return false
    if (filterMonth) {
      const month = c.costDate.slice(0, 7)
      if (month !== filterMonth) return false
    }
    return true
  })

  const total = filtered.reduce((a, c) => a + c.amount, 0)

  function handleDelete(id: string) {
    setDeleting(id)
    startDeleteTransition(async () => {
      await deleteCost(id)
      setDeleting(null)
    })
  }

  return (
    <div>
      {generatedCount > 0 && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          {generatedCount} custo{generatedCount !== 1 ? 's' : ''} recorrente
          {generatedCount !== 1 ? 's' : ''} gerado{generatedCount !== 1 ? 's' : ''} automaticamente para o mês atual.
        </div>
      )}

      {/* Filters + Add */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as CostCategory | 'all')}
        >
          <option value="all">Todas categorias</option>
          {(Object.keys(CATEGORY_LABELS) as CostCategory[]).map((k) => (
            <option key={k} value={k}>
              {CATEGORY_LABELS[k]}
            </option>
          ))}
        </select>

        <input
          type="month"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
        />

        {(filterCategory !== 'all' || filterMonth) && (
          <button
            onClick={() => { setFilterCategory('all'); setFilterMonth('') }}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Limpar filtros
          </button>
        )}

        <div className="ml-auto">
          <button
            onClick={() => { setShowForm(true); setEditing(null) }}
            className="bg-brand text-brand-dark text-sm font-medium px-4 py-2 rounded-md hover:bg-brand-hover transition-colors"
          >
            + Novo custo
          </button>
        </div>
      </div>

      {/* Inline form for new cost */}
      {showForm && !editing && (
        <div className="bg-white rounded-lg border border-brand-200 p-4 mb-4">
          <h4 className="text-sm font-semibold text-gray-800 mb-3">Novo custo</h4>
          <CostForm
            onSuccess={() => setShowForm(false)}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Edit form */}
      {editing && (
        <div className="bg-white rounded-lg border border-brand-200 p-4 mb-4">
          <h4 className="text-sm font-semibold text-gray-800 mb-3">Editar custo</h4>
          <CostForm
            initial={editing}
            onSuccess={() => setEditing(null)}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      {/* Summary */}
      {filtered.length > 0 && (
        <div className="text-sm text-gray-500 mb-2">
          {filtered.length} registro{filtered.length !== 1 ? 's' : ''} — Total:{' '}
          <span className="font-semibold text-gray-800">{fmtBRL(total)}</span>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-12">
            Nenhum custo encontrado com os filtros selecionados.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left">
                <th className="px-4 py-3 font-medium text-gray-600 text-xs uppercase tracking-wide">
                  Data
                </th>
                <th className="px-4 py-3 font-medium text-gray-600 text-xs uppercase tracking-wide">
                  Categoria
                </th>
                <th className="px-4 py-3 font-medium text-gray-600 text-xs uppercase tracking-wide">
                  Descrição
                </th>
                <th className="px-4 py-3 font-medium text-gray-600 text-xs uppercase tracking-wide text-right">
                  Valor
                </th>
                <th className="px-4 py-3 font-medium text-gray-600 text-xs uppercase tracking-wide">
                  Recorrente
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((cost) => (
                <tr key={cost.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {new Date(cost.costDate).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${CATEGORY_COLORS[cost.category]}`}
                    >
                      {CATEGORY_LABELS[cost.category]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-800">{cost.description}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    {fmtBRL(cost.amount)}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {cost.isRecurring ? (
                      <span className="text-xs">
                        Sim ({cost.recurrenceFrequency ?? 'mensal'})
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => { setEditing(cost); setShowForm(false) }}
                        className="text-xs text-brand-text hover:underline"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(cost.id)}
                        disabled={deletePending && deleting === cost.id}
                        className="text-xs text-red-500 hover:underline disabled:opacity-50"
                      >
                        {deletePending && deleting === cost.id ? 'Excluindo…' : 'Excluir'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
