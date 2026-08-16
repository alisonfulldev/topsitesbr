'use client'

import { useState, useTransition } from 'react'
import { activateSubscription } from '../actions'

type SubscriptionInfo = {
  id: string
  status: string
  planId: string
  planName: string
  planPrice: number
  nextDueDate: string | null
  planActivatedAt: string
  asaasSubscriptionId: string | null
}

const STATUS_LABEL: Record<string, string> = {
  active: 'Ativa',
  pending: 'Aguardando pagamento',
  overdue: 'Inadimplente',
  canceled: 'Cancelada',
}

const STATUS_COLOR: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  overdue: 'bg-red-100 text-red-700',
  canceled: 'bg-gray-100 text-gray-500',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR')
}

function formatPrice(price: number) {
  return `R$ ${price.toFixed(2).replace('.', ',')}`
}

export function SubscriptionPageClient({
  clientId,
  clientName,
  subscription,
  plans,
}: {
  clientId: string
  clientName: string
  subscription: SubscriptionInfo | null
  plans?: { id: string; name: string; price: number; monthlyChangesIncluded: number; allowedChangeTypes: string }[]
}) {
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [selectedPlanId, setSelectedPlanId] = useState<string>(plans?.[0]?.id ?? '')
  const [freeFirstMonth, setFreeFirstMonth] = useState(true)

  function handleActivate() {
    setError(null)
    startTransition(async () => {
      if (!selectedPlanId) {
        setError('Selecione um plano antes de ativar.')
        return
      }
      const selectedPlan = plans?.find((p) => p.id === selectedPlanId)
      const result = await activateSubscription(clientId, selectedPlanId, freeFirstMonth)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccessMsg(`Assinatura "${selectedPlan?.name ?? 'Site no Ar'}" ativada com sucesso.`)
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Success banner */}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-800">
          {successMsg}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Current subscription status */}
      {subscription ? (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Status Atual</h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <div>
              <span className="text-gray-500">Plano: </span>
              <span className="font-medium text-gray-900">
                {subscription.planName} — {formatPrice(subscription.planPrice)}/mês
              </span>
            </div>
            <div>
              <span className="text-gray-500">Status: </span>
              <span
                className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                  STATUS_COLOR[subscription.status] ?? 'bg-gray-100 text-gray-600'
                }`}
              >
                {STATUS_LABEL[subscription.status] ?? subscription.status}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Próx. vencimento: </span>
              <span className="text-gray-900">
                {subscription.nextDueDate ? formatDate(subscription.nextDueDate) : '—'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Plano ativo desde: </span>
              <span className="text-gray-900">{formatDate(subscription.planActivatedAt)}</span>
            </div>
            {subscription.asaasSubscriptionId && (
              <div className="col-span-2">
                <span className="text-gray-500">ID Asaas: </span>
                <code className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">
                  {subscription.asaasSubscriptionId}
                </code>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Sem assinatura ativa</h3>
          <p className="text-sm text-gray-500 mb-4">
            {clientName} ainda não possui uma assinatura. Escolha o plano e ative manualmente.
          </p>

          {plans && plans.length > 0 && (
            <div className="mb-4 space-y-2">
              {plans.map((plan) => (
                <label
                  key={plan.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedPlanId === plan.id
                      ? 'border-brand bg-yellow-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="plan"
                    value={plan.id}
                    checked={selectedPlanId === plan.id}
                    onChange={() => setSelectedPlanId(plan.id)}
                    className="accent-brand"
                  />
                  <span className="text-sm font-medium text-gray-900">{plan.name}</span>
                  <span className="text-sm text-gray-500">— {formatPrice(plan.price)}/mês</span>
                </label>
              ))}
            </div>
          )}

          <label className="flex items-center gap-2 mb-4 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={freeFirstMonth}
              onChange={(e) => setFreeFirstMonth(e.target.checked)}
              className="accent-brand w-4 h-4"
            />
            <span className="text-sm text-gray-700">1º mês grátis <span className="text-gray-400">(primeira cobrança em 30 dias)</span></span>
          </label>

          <button
            onClick={handleActivate}
            disabled={isPending || !selectedPlanId}
            className="px-4 py-2 rounded-lg bg-brand text-brand-dark text-sm font-medium hover:bg-brand-hover disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Ativando…' : 'Ativar Assinatura'}
          </button>
        </div>
      )}

      <p className="text-xs text-gray-400">
        Para cancelar ou forçar mudanças na assinatura, acesse diretamente o painel do Asaas.
      </p>
    </div>
  )
}
