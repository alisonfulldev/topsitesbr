'use client'

import { useState, useTransition } from 'react'
import { activateSubscription, changePlan } from '../actions'

type PlanInfo = {
  id: string
  name: string
  price: number
  monthlyChangesIncluded: number
  allowedChangeTypes: string
}

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
  overdue: 'Inadimplente',
  canceled: 'Cancelada',
}

const STATUS_COLOR: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
  canceled: 'bg-gray-100 text-gray-500',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR')
}

function formatPrice(price: number) {
  return `R$ ${price.toFixed(2).replace('.', ',')}`
}

function describeAllowedTypes(types: string, monthlyChanges: number): string {
  if (monthlyChanges === 0) return 'Nenhuma alteração inclusa (cobrada avulso)'
  const map: Record<string, string> = {
    texto: 'Texto',
    imagem: 'Imagem',
    texto_e_imagem: 'Texto + Imagem',
  }
  const labels = types
    .split(',')
    .filter(Boolean)
    .map((t) => map[t] ?? t)
  return labels.join(' ou ')
}

function PlanCard({
  plan,
  isCurrent,
  subscription,
  clientId,
  onSuccess,
}: {
  plan: PlanInfo
  isCurrent: boolean
  subscription: SubscriptionInfo | null
  clientId: string
  onSuccess: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [blockedUntil, setBlockedUntil] = useState<string | null>(null)
  const [adminOverride, setAdminOverride] = useState(false)

  const hasSubscription = subscription !== null
  const isUpgrade = hasSubscription && plan.price > subscription.planPrice
  const isDowngrade = hasSubscription && plan.price < subscription.planPrice

  const planActivatedAt = subscription
    ? new Date(subscription.planActivatedAt).getTime()
    : null
  const downgradeAllowedAt = planActivatedAt
    ? new Date(planActivatedAt + 90 * 24 * 60 * 60 * 1000)
    : null
  const downgradeBlocked =
    isDowngrade && downgradeAllowedAt ? Date.now() < downgradeAllowedAt.getTime() : false

  function handleActivate() {
    setError(null)
    startTransition(async () => {
      const result = await activateSubscription(clientId, plan.id)
      if (result.error) {
        setError(result.error)
      } else {
        onSuccess()
      }
    })
  }

  function handleChangePlan() {
    setError(null)
    setBlockedUntil(null)
    startTransition(async () => {
      const result = await changePlan(clientId, plan.id, adminOverride)
      if (result.blockedUntil) {
        setBlockedUntil(result.blockedUntil)
      } else if (result.error) {
        setError(result.error)
      } else {
        onSuccess()
      }
    })
  }

  return (
    <div
      className={`relative flex flex-col rounded-xl border p-5 transition-shadow ${
        isCurrent
          ? 'border-brand-200 bg-brand-50 shadow-sm'
          : 'border-gray-200 bg-white hover:shadow-sm'
      }`}
    >
      {isCurrent && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand text-brand-dark text-xs font-semibold px-3 py-0.5 rounded-full">
          Plano Atual
        </span>
      )}

      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-900">{plan.name}</h3>
        <p className="text-2xl font-bold text-gray-900 mt-1">
          {formatPrice(plan.price)}
          <span className="text-sm font-normal text-gray-500">/mês</span>
        </p>
      </div>

      <ul className="space-y-2 flex-1 mb-5">
        <li className="flex items-start gap-2 text-sm text-gray-700">
          <span className="mt-0.5 text-brand-text shrink-0">
            {plan.monthlyChangesIncluded > 0 ? '✓' : '—'}
          </span>
          <span>
            {plan.monthlyChangesIncluded === 0
              ? 'Sem alterações inclusas'
              : `${plan.monthlyChangesIncluded} alteração/mês`}
          </span>
        </li>

        {plan.allowedChangeTypes && (
          <li className="flex items-start gap-2 text-sm text-gray-700">
            <span className="mt-0.5 text-brand-text shrink-0">✓</span>
            <span>{describeAllowedTypes(plan.allowedChangeTypes, plan.monthlyChangesIncluded)}</span>
          </li>
        )}

        <li className="flex items-start gap-2 text-sm text-gray-700">
          <span className="mt-0.5 text-brand-text shrink-0">✓</span>
          <span>Hospedagem, SSL e monitoramento</span>
        </li>
      </ul>

      {/* Feedback messages */}
      {error && (
        <p className="text-xs text-red-600 mb-3 bg-red-50 border border-red-200 rounded px-2 py-1.5">
          {error}
        </p>
      )}

      {blockedUntil && (
        <div className="mb-3 bg-yellow-50 border border-yellow-200 rounded px-2 py-2 text-xs text-yellow-800">
          <p className="font-medium mb-1">Downgrade bloqueado por carência</p>
          <p>
            Disponível a partir de{' '}
            <strong>{formatDate(blockedUntil)}</strong>.
          </p>
          <label className="flex items-center gap-1.5 mt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={adminOverride}
              onChange={(e) => setAdminOverride(e.target.checked)}
              className="rounded"
            />
            <span>Liberar troca manualmente (exceção)</span>
          </label>
        </div>
      )}

      {/* Action button */}
      {isCurrent ? (
        <div className="h-8 flex items-center justify-center text-xs text-brand-text font-medium">
          Plano ativo
        </div>
      ) : !hasSubscription ? (
        <button
          onClick={handleActivate}
          disabled={isPending}
          className="w-full py-2 rounded-lg bg-brand text-brand-dark text-sm font-medium hover:bg-brand-hover disabled:opacity-50 transition-colors"
        >
          {isPending ? 'Ativando…' : 'Ativar Assinatura'}
        </button>
      ) : isUpgrade ? (
        <button
          onClick={handleChangePlan}
          disabled={isPending}
          className="w-full py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {isPending ? 'Processando…' : '↑ Fazer Upgrade'}
        </button>
      ) : (
        <button
          onClick={handleChangePlan}
          disabled={isPending || (downgradeBlocked && !adminOverride && !blockedUntil)}
          className="w-full py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-40 transition-colors"
        >
          {isPending ? 'Processando…' : '↓ Fazer Downgrade'}
        </button>
      )}
    </div>
  )
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
  plans: PlanInfo[]
}) {
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      {/* Success banner */}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-800">
          {successMsg}
        </div>
      )}

      {/* Current subscription status */}
      {subscription && (
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
      )}

      {/* Plans */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          {subscription ? 'Trocar de Plano' : 'Ativar Assinatura'}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrent={subscription?.planId === plan.id}
              subscription={subscription}
              clientId={clientId}
              onSuccess={() =>
                setSuccessMsg(
                  subscription
                    ? `Plano alterado para ${plan.name} com sucesso.`
                    : `Assinatura ${plan.name} ativada com sucesso.`,
                )
              }
            />
          ))}
        </div>
      </div>

      {/* Change history link note */}
      {subscription && (
        <p className="text-xs text-gray-400">
          Regra de carência: downgrade permitido apenas após 3 meses no plano atual.
          Use "Liberar manualmente" para casos excepcionais.
        </p>
      )}
    </div>
  )
}
