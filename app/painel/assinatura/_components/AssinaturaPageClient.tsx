'use client'

import { useState, useTransition } from 'react'
import { clientChangePlan } from '../actions'
import { Button } from '@/components/ui/button'

type PlanInfo = {
  id: string
  name: string
  price: number
  monthlyChangesIncluded: number
  prioritySupport: boolean
  allowedChangeTypes: string
  changeDeadlineDays: number
  discountPercent: number
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

function describeAllowedTypes(types: string, monthlyChanges: number): string {
  if (monthlyChanges === 0) return '—'
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

type BenefitRow = {
  label: string
  detail: string
  available: boolean
}

function getPlanBenefits(plan: PlanInfo): BenefitRow[] {
  const none = plan.monthlyChangesIncluded === 0
  const hasVisitReport = plan.monthlyChangesIncluded >= 1
  const hasFullReport = plan.monthlyChangesIncluded >= 2
  const hasSemestral = plan.monthlyChangesIncluded >= 2

  return [
    {
      label: 'Site no ar + SSL + monitoramento',
      detail: 'incluso',
      available: true,
    },
    {
      label: 'Alterações de conteúdo/mês',
      detail: none
        ? 'nenhuma inclusa'
        : `${plan.monthlyChangesIncluded} — ${describeAllowedTypes(plan.allowedChangeTypes, plan.monthlyChangesIncluded)}`,
      available: !none,
    },
    {
      label: 'Prazo de execução',
      detail: `até ${plan.changeDeadlineDays} dia${plan.changeDeadlineDays !== 1 ? 's' : ''}`,
      available: true,
    },
    {
      label: 'Correções ilimitadas (grátis)',
      detail: 'sempre incluso',
      available: true,
    },
    {
      label: 'Relatório de visitas',
      detail: hasFullReport ? 'completo (origem, páginas)' : hasVisitReport ? 'básico (mensal)' : '—',
      available: hasVisitReport,
    },
    {
      label: 'Suporte via WhatsApp',
      detail: plan.prioritySupport ? 'incluso' : '—',
      available: plan.prioritySupport,
    },
    {
      label: 'Desconto em avulsos e upgrades',
      detail: plan.discountPercent > 0 ? `${plan.discountPercent}% de desconto` : '—',
      available: plan.discountPercent > 0,
    },
    {
      label: 'Revisão semestral do site',
      detail: hasSemestral ? 'incluso' : '—',
      available: hasSemestral,
    },
    {
      label: 'Prioridade na fila de atendimento',
      detail: plan.prioritySupport && hasSemestral ? 'incluso' : '—',
      available: plan.prioritySupport && hasSemestral,
    },
  ]
}

function PlanCard({
  plan,
  isCurrent,
  isPopular,
  subscription,
  onSuccess,
}: {
  plan: PlanInfo
  isCurrent: boolean
  isPopular: boolean
  subscription: SubscriptionInfo
  onSuccess: (planName: string) => void
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [blockedUntil, setBlockedUntil] = useState<string | null>(null)

  const isUpgrade = plan.price > subscription.planPrice
  const isDowngrade = plan.price < subscription.planPrice
  const benefits = getPlanBenefits(plan)
  const showPopularBadge = isPopular && !isCurrent

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
      className={`relative flex flex-col rounded-2xl p-5 transition-all ${
        isCurrent
          ? 'border-2 border-brand bg-brand-50'
          : isPopular
            ? 'border-2 border-gray-900 bg-white shadow-md'
            : 'border border-gray-200 bg-white'
      }`}
    >
      {/* Badge — "Seu plano" takes precedence over "Mais popular" */}
      {(isCurrent || showPopularBadge) && (
        <div className="absolute -top-3.5 inset-x-0 flex justify-center">
          <span
            className={`text-xs font-bold px-4 py-1 rounded-full ${
              isCurrent
                ? 'bg-brand text-brand-dark'
                : 'bg-gray-900 text-white'
            }`}
          >
            {isCurrent ? 'Seu plano atual' : 'Mais popular'}
          </span>
        </div>
      )}

      {/* Price */}
      <div className="mb-5 pt-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
          {plan.name}
        </p>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-gray-900">R${plan.price}</span>
          <span className="text-sm text-gray-500">/mês</span>
        </div>
      </div>

      {/* Benefits */}
      <ul className="space-y-2.5 flex-1 mb-6">
        {benefits.map((b) => (
          <li key={b.label} className="flex items-start gap-2 text-sm">
            <span
              className={`mt-0.5 shrink-0 font-bold text-xs w-4 text-center leading-4 ${
                b.available ? 'text-green-600' : 'text-gray-300'
              }`}
            >
              {b.available ? '✓' : '—'}
            </span>
            <span className={`flex-1 leading-snug ${b.available ? 'text-gray-700' : 'text-gray-400'}`}>
              {b.label}
              {b.available && b.detail !== 'incluso' && b.detail !== 'sempre incluso' && (
                <span className="ml-1 text-xs text-gray-400">({b.detail})</span>
              )}
            </span>
          </li>
        ))}
      </ul>

      {/* Blocked downgrade */}
      {blockedUntil && (
        <div className="mb-3 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2.5 text-xs text-yellow-800">
          <p className="font-semibold mb-0.5">Downgrade bloqueado por carência</p>
          <p>
            Disponível a partir de <strong>{formatDate(blockedUntil)}</strong>.
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-red-600 mb-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* CTA */}
      {isCurrent ? (
        <div className="h-9 flex items-center justify-center">
          <span className="text-xs text-gray-500 font-medium">Plano atual</span>
        </div>
      ) : isUpgrade ? (
        <Button
          variant="conversion"
          size="md"
          fullWidth
          onClick={handleChangePlan}
          loading={isPending}
        >
          Fazer upgrade
        </Button>
      ) : isDowngrade ? (
        <Button
          variant="secondary"
          size="sm"
          fullWidth
          onClick={handleChangePlan}
          loading={isPending}
        >
          Fazer downgrade
        </Button>
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
          ✓ {successMsg}
        </div>
      )}

      {/* Current subscription summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
          Sua assinatura
        </p>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
          <div>
            <span className="text-gray-500">Plano: </span>
            <span className="font-medium text-gray-900">
              {subscription.planName} — R${subscription.planPrice}/mês
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

      {/* Plan comparison cards */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-5">Comparar planos</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-4">
          {plans.map((plan, i) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrent={subscription.planId === plan.id}
              isPopular={i === 1}
              subscription={subscription}
              onSuccess={(name) => setSuccessMsg(`Plano alterado para ${name} com sucesso.`)}
            />
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-400">
        Downgrade disponível após 3 meses no plano atual. Para assistência, entre em contato pelo
        WhatsApp.
      </p>
    </div>
  )
}
