'use client'

import { useState, useTransition } from 'react'
import { createExtraRevenue, updateExtraRevenue, deleteExtraRevenue } from '../actions'
import { ExtraRevenueCategory } from '@prisma/client'
import { useToastContext } from '@/components/ui/ToastProvider'

export type RevenueRow = {
  id: string
  category: ExtraRevenueCategory
  description: string
  amount: number
  revenueDate: string
}

const CATEGORY_LABELS: Record<ExtraRevenueCategory, string> = {
  servico_avulso: 'Serviço Avulso',
  consultoria: 'Consultoria',
  venda_site: 'Venda de Site',
  outro: 'Outro',
}

const CATEGORY_COLORS: Record<ExtraRevenueCategory, string> = {
  servico_avulso: 'bg-blue-100 text-blue-700',
  consultoria: 'bg-purple-100 text-purple-700',
  venda_site: 'bg-green-100 text-green-700',
  outro: 'bg-gray-100 text-gray-600',
}

function fmtBRL(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

type FormState = {
  category: ExtraRevenueCategory
  description: string
  amount: string
  revenueDate: string
}

const DEFAULT_FORM: FormState = {
  category: 'servico_avulso',
  description: '',
  amount: '',
  revenueDate: new Date().toISOString().slice(0, 10),
}

function RevenueForm({
  initial,
  onSuccess,
  onCancel,
  onToast,
}: {
  initial?: RevenueRow
  onSuccess: () => void
  onCancel: () => void
  onToast?: (msg: string) => void
}) {
  const [form, setForm] = useState<FormState>(
    initial
      ? {
          category: initial.category,
          description: initial.description,
          amount: initial.amount.toFixed(2),
          revenueDate: initial.revenueDate.slice(0, 10),
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
    if (!form.revenueDate) return setError('Informe a data.')
    setError('')

    startTransition(async () => {
      if (initial) {
        await updateExtraRevenue(initial.id, form)
        onToast?.('Receita atualizada com sucesso!')
      } else {
        await createExtraRevenue(form)
        onToast?.('Receita adicionada com sucesso!')
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
            onChange={(e) => set('category', e.target.value as ExtraRevenueCategory)}
          >
            {(Object.keys(CATEGORY_LABELS) as ExtraRevenueCategory[]).map((k) => (
              <option key={k} value={k}>
                {CATEGORY_LABELS[k]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Data do recebimento</label>
          <input
            type="date"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            value={form.revenueDate}
            onChange={(e) => set('revenueDate', e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Descrição</label>
        <input
          type="text"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          placeholder="Ex: Criação de logo para João, Consultoria de tráfego…"
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

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-brand text-brand-dark text-sm font-medium py-2 rounded-md hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {pending && (
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {pending ? 'Salvando…' : initial ? 'Salvar alterações' : 'Adicionar receita'}
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

export function ReceitasPageClient({ revenues }: { revenues: RevenueRow[] }) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<RevenueRow | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<ExtraRevenueCategory | 'all'>('all')
  const [filterMonth, setFilterMonth] = useState('')
  const [deletePending, startDeleteTransition] = useTransition()
  const { showToast } = useToastContext()

  const filtered = revenues.filter((r) => {
    if (filterCategory !== 'all' && r.category !== filterCategory) return false
    if (filterMonth && r.revenueDate.slice(0, 7) !== filterMonth) return false
    return true
  })

  const total = filtered.reduce((a, r) => a + r.amount, 0)

  function handleDelete(id: string) {
    setDeleting(id)
    startDeleteTransition(async () => {
      await deleteExtraRevenue(id)
      setDeleting(null)
    })
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as ExtraRevenueCategory | 'all')}
        >
          <option value="all">Todas categorias</option>
          {(Object.keys(CATEGORY_LABELS) as ExtraRevenueCategory[]).map((k) => (
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
            + Nova receita
          </button>
        </div>
      </div>

      {showForm && !editing && (
        <div className="bg-white rounded-lg border border-brand-200 p-4 mb-4">
          <h4 className="text-sm font-semibold text-gray-800 mb-3">Nova receita avulsa</h4>
          <RevenueForm
            onSuccess={() => setShowForm(false)}
            onCancel={() => setShowForm(false)}
            onToast={(msg) => showToast(msg, 'success')}
          />
        </div>
      )}

      {editing && (
        <div className="bg-white rounded-lg border border-brand-200 p-4 mb-4">
          <h4 className="text-sm font-semibold text-gray-800 mb-3">Editar receita</h4>
          <RevenueForm
            initial={editing}
            onSuccess={() => setEditing(null)}
            onCancel={() => setEditing(null)}
            onToast={(msg) => showToast(msg, 'success')}
          />
        </div>
      )}

      {filtered.length > 0 && (
        <div className="text-sm text-gray-500 mb-2">
          {filtered.length} registro{filtered.length !== 1 ? 's' : ''} — Total:{' '}
          <span className="font-semibold text-gray-800">{fmtBRL(total)}</span>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-12">
            Nenhuma receita encontrada. Clique em "+ Nova receita" para começar.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left">
                <th className="px-4 py-3 font-medium text-gray-600 text-xs uppercase tracking-wide">Data</th>
                <th className="px-4 py-3 font-medium text-gray-600 text-xs uppercase tracking-wide">Categoria</th>
                <th className="px-4 py-3 font-medium text-gray-600 text-xs uppercase tracking-wide">Descrição</th>
                <th className="px-4 py-3 font-medium text-gray-600 text-xs uppercase tracking-wide text-right">Valor</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {new Date(r.revenueDate).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${CATEGORY_COLORS[r.category]}`}>
                      {CATEGORY_LABELS[r.category]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-800">{r.description}</td>
                  <td className="px-4 py-3 text-right font-medium text-green-700">{fmtBRL(r.amount)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => { setEditing(r); setShowForm(false) }}
                        className="text-xs text-brand-text hover:underline"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        disabled={deletePending && deleting === r.id}
                        className="text-xs text-red-500 hover:underline disabled:opacity-50"
                      >
                        {deletePending && deleting === r.id ? 'Excluindo…' : 'Excluir'}
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
