'use client'

import { useState, useTransition, useRef } from 'react'
import {
  createPromocao,
  updatePromocao,
  togglePromocaoActive,
  deletePromocao,
} from '../actions'
import { useToastContext } from '@/components/ui/ToastProvider'

export type PromoRow = {
  id: string
  title: string
  description: string | null
  productId: string | null
  productName: string | null
  discountType: string
  discountValue: number
  startDate: string
  endDate: string
  active: boolean
}

export type ProductOption = {
  id: string
  name: string
}

function fmt(v: number) {
  return v.toFixed(2).replace('.', ',')
}

function toDateInput(iso: string) {
  return iso.slice(0, 10)
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
        active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
      }`}
    >
      {active ? 'Ativa' : 'Inativa'}
    </span>
  )
}

function PromocaoForm({
  products,
  initial,
  onSuccess,
  onCancel,
}: {
  products: ProductOption[]
  initial?: PromoRow
  onSuccess: () => void
  onCancel: () => void
}) {
  const formRef = useRef<HTMLFormElement>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setError(null)
    startTransition(async () => {
      const result = initial
        ? await updatePromocao(initial.id, formData)
        : await createPromocao(formData)
      if (result.error) {
        setError(result.error)
        return
      }
      onSuccess()
    })
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-brand-200 p-5 space-y-4"
    >
      <h3 className="font-semibold text-gray-900">
        {initial ? 'Editar promoção' : 'Nova promoção'}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Título *</label>
          <input
            name="title"
            defaultValue={initial?.title}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Descrição</label>
          <textarea
            name="description"
            defaultValue={initial?.description ?? ''}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Produto (opcional — deixe em branco para todos)
          </label>
          <select
            name="productId"
            defaultValue={initial?.productId ?? ''}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          >
            <option value="">Todos os produtos</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Tipo de desconto *</label>
          <select
            name="discountType"
            defaultValue={initial?.discountType ?? 'percent'}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          >
            <option value="percent">Percentual (%)</option>
            <option value="fixed">Valor fixo (R$)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Valor do desconto *
          </label>
          <input
            name="discountValue"
            type="number"
            min="0.01"
            step="0.01"
            defaultValue={initial?.discountValue}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Data de início *</label>
          <input
            name="startDate"
            type="date"
            defaultValue={initial ? toDateInput(initial.startDate) : ''}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Data de fim *</label>
          <input
            name="endDate"
            type="date"
            defaultValue={initial ? toDateInput(initial.endDate) : ''}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>

        <div className="sm:col-span-2 flex items-center gap-3">
          <label className="text-xs font-medium text-gray-700">Status ao salvar:</label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="radio"
              name="active"
              value="true"
              defaultChecked={initial ? initial.active : true}
              className="accent-brand"
            />
            Ativa
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="radio"
              name="active"
              value="false"
              defaultChecked={initial ? !initial.active : false}
              className="accent-brand"
            />
            Inativa
          </label>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-brand text-brand-dark text-sm font-semibold hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending && (
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {isPending ? 'Salvando…' : 'Salvar promoção'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}

export function PromocoesPageClient({
  promotions: initial,
  products,
}: {
  promotions: PromoRow[]
  products: ProductOption[]
}) {
  const [promotions, setPromotions] = useState(initial)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<PromoRow | null>(null)
  const [isPending, startTransition] = useTransition()
  const { showToast } = useToastContext()

  function handleFormSuccess() {
    setShowForm(false)
    setEditing(null)
    showToast('Promoção salva com sucesso!', 'success')
    // Trigger server-side revalidation shows on next load; optimistic refresh reloads page
    window.location.reload()
  }

  function handleToggle(id: string, active: boolean) {
    startTransition(async () => {
      const result = await togglePromocaoActive(id, active)
      if (!result.error) {
        setPromotions((prev) =>
          prev.map((p) => (p.id === id ? { ...p, active } : p)),
        )
      }
    })
  }

  function handleDelete(id: string) {
    if (!confirm('Excluir esta promoção?')) return
    startTransition(async () => {
      await deletePromocao(id)
      setPromotions((prev) => prev.filter((p) => p.id !== id))
    })
  }

  return (
    <div className="space-y-5">
      {/* Create button or form */}
      {!showForm && !editing && (
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 rounded-lg bg-brand text-brand-dark text-sm font-semibold hover:bg-brand-hover"
        >
          + Nova promoção
        </button>
      )}

      {showForm && (
        <PromocaoForm
          products={products}
          onSuccess={handleFormSuccess}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editing && (
        <PromocaoForm
          products={products}
          initial={editing}
          onSuccess={handleFormSuccess}
          onCancel={() => setEditing(null)}
        />
      )}

      {/* List */}
      {promotions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-sm text-gray-400">
          Nenhuma promoção cadastrada.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Promoção</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Produto</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Desconto</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Vigência</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {promotions.map((promo) => (
                <tr key={promo.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{promo.title}</p>
                    {promo.description && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                        {promo.description}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {promo.productName ?? (
                      <span className="text-gray-400 italic">Todos</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700 font-medium">
                    {promo.discountType === 'percent'
                      ? `${promo.discountValue}%`
                      : `R$ ${fmt(promo.discountValue)}`}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {toDateInput(promo.startDate)} → {toDateInput(promo.endDate)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge active={promo.active} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setShowForm(false)
                          setEditing(promo)
                        }}
                        className="text-xs text-brand-text hover:underline"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleToggle(promo.id, !promo.active)}
                        disabled={isPending}
                        className="text-xs text-gray-600 hover:underline disabled:opacity-40"
                      >
                        {promo.active ? 'Desativar' : 'Ativar'}
                      </button>
                      <button
                        onClick={() => handleDelete(promo.id)}
                        disabled={isPending}
                        className="text-xs text-red-500 hover:underline disabled:opacity-40"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
