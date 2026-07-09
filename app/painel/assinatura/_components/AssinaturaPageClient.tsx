'use client'

import { useState, useTransition } from 'react'
import { clientChangePlan } from '../actions'

type PlanInfo = {
  id: string
  name: string
  price: number
  monthlyChangesIncluded: number
  prioritySupport: boolean
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
  return `R$ ${price.toFixed(2).replace('.', ',')}`
}

function describeAllowedTypes(types: string, monthlyChanges: number): string {
  if (monthlyChanges === 0) return 'Nenhuma alteração inclusa'
  const map: Record<string, string> = {
    texto: 'Texto',
    imagem: 'Imagem',
    texto_e_imagem: 'Texto + Imagem',
  }
  return types
    .split(',')
    .filter(Boolean)
    .map((t) => map[t] ?? t)
    .join(' ou ')
}

function PlanCard({
  plan,
  isCurrent,
  subscription,
  onSuccess,
}: {
  plan: PlanInfo
  isCurrent: boolean
  subscription: SubscriptionInfo
  onSuccess: (planName: string) => void
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [blockedUntil, setBlockedUntil] = useState<string | null>(null)

  const isUpgrade = plan.price > subscription.planPrice
  const isDowngrade = plan.price < subscription.planPrice

  function handleChangePlan() {
    setError(null)
    setBlockedUntil(null)
    startTransition(async () => {
      const result = await clientChangePlan(plan.id)
      if (result.blockedUntil) {
        setBlockedUntil(result.blockedUntil)
      } else if (result.error) {
        setError(result.error)
      } else {
        onSuccess(plan.name)
      }
    })
  }

  return (
    <div
      className={`relative flex flex-col rounded-xl border p-5 transition-shadow ${
        isCurrent
          ? 'border-indigo-400 bg-indigo-50 shadow-sm'
          : 'border-gray-200 bg-white hover:shadow-sm'
      }`}
    >
      {isCurrent && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-semibold px-3 py-0.5 rounded-full">
          Seu Plano
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
          <span className={`mt-0.5 shrink-0 ${plan.monthlyChangesIncluded > 0 ? 'text-indigo-500' : 'text-gray-300'}`}>
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
            <span className="mt-0.5 text-indigo-500 shrink-0">✓</span>
            <span>{describeAllowedTypes(plan.allowedChangeTypes, plan.monthlyChangesIncluded)}</span>
          </li>
        )}

        <li className="flex items-start gap-2 text-sm text-gray-700">
          <span className={`mt-0.5 shrink-0 ${plan.prioritySupport ? 'text-indigo-500' : 'text-gray-300'}`}>
            {plan.prioritySupport ? '✓' : '—'}
          </span>
          <span className={plan.prioritySupport ? '' : 'text-gray-400'}>
            Atendimento prioritário
          </span>
        </li>

        <li className="flex items-start gap-2 text-sm text-gray-700">
          <span className="mt-0.5 text-indigo-500 shrink-0">✓</span>
          <span>Hospedagem, SSL e monitoramento</span>
        </li>
      </ul>

      {error && (
        <p className="text-xs text-red-600 mb-3 bg-red-50 border border-red-200 rounded px-2 py-1.5">
          {error}
        </p>
      )}

      {blockedUntil && (
        <div className="mb-3 bg-yellow-50 border border-yellow-200 rounded px-2 py-2 text-xs text-yellow-800">
          <p className="font-medium mb-0.5">Downgrade bloqueado por carência</p>
          <p>
            Disponível a partir de <strong>{formatDate(blockedUntil)}</strong>.
          </p>
          <p className="mt-1 text-yellow-600">
            Entre em contato conosco se precisar de ajuda.
          </p>
        </div>
      )}

      {isCurrent ? (
        <div className="h-8 flex items-center justify-center text-xs text-indigo-600 font-medium">
          Plano atual
        </div>
      ) : isUpgrade ? (
        <button
          onClick={handleChangePlan}
          disabled={isPending}
          className="w-full py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
        >
          {isPending ? 'Processando…' : '↑ Fazer Upgrade'}
        </button>
      ) : isDowngrade ? (
        <button
          onClick={handleChangePlan}
          disabled={isPending}
          className="w-full py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
        >
          {isPending ? 'Processando…' : '↓ Fazer Downgrade'}
        </button>
      ) : null}
    </div>
  )
}

export function AssinaturaPageClient({
  subscription,
  plans,
}: {
  subscription: SubscriptionInfo
  plans: PlanInfo[]
}) {
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      {successMsg && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-800">
          {successMsg}
        </div>
      )}

      {/* Current status */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Sua Assinatura</h3>
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
        </div>
      </div>

      {/* Plans */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Trocar de Plano</h3>
        <div className="grid grid-cols-3 gap-4">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrent={subscription.planId === plan.id}
              subscription={subscription}
              onSuccess={(name) => setSuccessMsg(`Plano alterado para ${name} com sucesso.`)}
            />
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-400">
        Downgrade disponível após 3 meses no plano atual. Para assistência, entre em contato pelo WhatsApp.
      </p>
    </div>
  )
}
