'use client'

import { useState, useTransition } from 'react'
import { activateSubscription, changePlan, recreateAsaasSubscription, resetSubscriptionStatus, sendManualPaymentReminder, updateSubscriptionDueDate } from '../actions'

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

function daysFromNowStr(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
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
  const [firstDueDate, setFirstDueDate] = useState(daysFromNowStr(30))

  const [editDueDate, setEditDueDate] = useState('')
  const [showEditDue, setShowEditDue] = useState(false)
  const [editDuePending, startEditDueTransition] = useTransition()
  const [editDueError, setEditDueError] = useState<string | null>(null)
  const [editDueSuccess, setEditDueSuccess] = useState<string | null>(null)

  const [isReminderPending, startReminderTransition] = useTransition()
  const [reminderSuccess, setReminderSuccess] = useState<string | null>(null)
  const [reminderError, setReminderError] = useState<string | null>(null)

  const [showRecreate, setShowRecreate] = useState(false)
  const [recreateDate, setRecreateDate] = useState(daysFromNowStr(0))
  const [isRecreatePending, startRecreateTransition] = useTransition()
  const [recreateError, setRecreateError] = useState<string | null>(null)
  const [recreateSuccess, setRecreateSuccess] = useState<string | null>(null)

  const [changePlanId, setChangePlanId] = useState<string>('')
  const [changeError, setChangeError] = useState<string | null>(null)
  const [changeSuccess, setChangeSuccess] = useState<string | null>(null)
  const [changeBlockedUntil, setChangeBlockedUntil] = useState<string | null>(null)
  const [isChangePending, startChangeTransition] = useTransition()
  const [isResetPending, startResetTransition] = useTransition()

  function handleResetStatus() {
    if (!subscription) return
    startResetTransition(async () => {
      const result = await resetSubscriptionStatus(clientId, subscription.id)
      if (result.error) setError(result.error)
      else setSuccessMsg('Status da assinatura corrigido para Ativa.')
    })
  }

  function handleChangePlan(adminOverride = false) {
    setChangeError(null)
    setChangeBlockedUntil(null)
    startChangeTransition(async () => {
      if (!changePlanId) {
        setChangeError('Selecione o novo plano.')
        return
      }
      const result = await changePlan(clientId, changePlanId, adminOverride)
      if (result.blockedUntil) {
        setChangeBlockedUntil(result.blockedUntil)
      } else if (result.error) {
        setChangeError(result.error)
      } else {
        const newPlan = plans?.find((p) => p.id === changePlanId)
        setChangeSuccess(`Plano alterado para ${newPlan?.name ?? ''} com sucesso.`)
      }
    })
  }

  function handleActivate() {
    setError(null)
    startTransition(async () => {
      if (!selectedPlanId) {
        setError('Selecione um plano antes de ativar.')
        return
      }
      const selectedPlan = plans?.find((p) => p.id === selectedPlanId)
      const result = await activateSubscription(clientId, selectedPlanId, firstDueDate)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccessMsg(`Assinatura "${selectedPlan?.name ?? 'Site no Ar'}" ativada com sucesso.`)
      }
    })
  }

  function handleSendReminder() {
    if (!subscription) return
    setReminderError(null)
    startReminderTransition(async () => {
      const result = await sendManualPaymentReminder(clientId, subscription.id)
      if (result.error) setReminderError(result.error)
      else setReminderSuccess(result.paymentUrl ? `E-mail enviado com link de pagamento.` : 'E-mail enviado (sem link — verifique o Asaas).')
    })
  }

  function handleRecreate() {
    if (!subscription) return
    setRecreateError(null)
    startRecreateTransition(async () => {
      const result = await recreateAsaasSubscription(clientId, subscription.id, recreateDate)
      if (result.error) setRecreateError(result.error)
      else {
        setRecreateSuccess('Assinatura recriada no Asaas com sucesso.')
        setShowRecreate(false)
      }
    })
  }

  function handleEditDueDate() {
    if (!subscription) return
    setEditDueError(null)
    startEditDueTransition(async () => {
      const result = await updateSubscriptionDueDate(subscription.id, clientId, editDueDate)
      if (result.error) setEditDueError(result.error)
      else {
        setEditDueSuccess('Data de vencimento corrigida.')
        setShowEditDue(false)
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
          {(subscription.status === 'overdue' || subscription.status === 'pending') && (
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
              {reminderSuccess && <p className="text-xs text-green-700">{reminderSuccess}</p>}
              {reminderError && <p className="text-xs text-red-600">{reminderError}</p>}
              <button
                onClick={handleSendReminder}
                disabled={isReminderPending}
                className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isReminderPending ? 'Enviando…' : 'Enviar cobrança por e-mail'}
              </button>
            </div>
          )}

          {subscription.status === 'overdue' && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3">
              <p className="text-xs text-gray-500 flex-1">
                Status marcado como inadimplente, mas o próximo vencimento ainda não chegou? Corrija manualmente.
              </p>
              <button
                onClick={handleResetStatus}
                disabled={isResetPending}
                className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 disabled:opacity-50 transition-colors shrink-0"
              >
                {isResetPending ? 'Corrigindo…' : 'Corrigir → Ativa'}
              </button>
            </div>
          )}

          {/* Correção de data de vencimento */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            {editDueSuccess && (
              <p className="text-xs text-green-700 mb-2">{editDueSuccess}</p>
            )}
            {!showEditDue ? (
              <button
                onClick={() => {
                  setEditDueDate(subscription.nextDueDate?.split('T')[0] ?? daysFromNowStr(30))
                  setShowEditDue(true)
                }}
                className="text-xs text-gray-400 hover:text-gray-600 underline"
              >
                Corrigir data de vencimento
              </button>
            ) : (
              <div className="flex items-end gap-2 flex-wrap">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nova data de vencimento</label>
                  <input
                    type="date"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand/40"
                  />
                </div>
                <button
                  onClick={handleEditDueDate}
                  disabled={editDuePending || !editDueDate}
                  className="px-3 py-1.5 rounded-lg bg-gray-800 text-white text-xs font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
                >
                  {editDuePending ? 'Salvando…' : 'Salvar'}
                </button>
                <button
                  onClick={() => setShowEditDue(false)}
                  className="px-3 py-1.5 text-xs text-gray-400 hover:text-gray-600"
                >
                  Cancelar
                </button>
                {editDueError && <p className="w-full text-xs text-red-600">{editDueError}</p>}
              </div>
            )}
          </div>
          {/* Recriar assinatura no Asaas — para IDs inválidos / ambiente mock */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            {recreateSuccess && (
              <p className="text-xs text-green-700 mb-2">{recreateSuccess}</p>
            )}
            {!showRecreate ? (
              <button
                onClick={() => { setRecreateDate(daysFromNowStr(0)); setShowRecreate(true) }}
                className="text-xs text-gray-400 hover:text-gray-600 underline"
              >
                Recriar assinatura no Asaas
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  Use quando o ID Asaas for inválido (ex: cadastrado em modo de teste). Isso cria uma nova assinatura real no Asaas e vincula ao cliente.
                </p>
                <div className="flex items-end gap-2 flex-wrap">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Primeira cobrança em</label>
                    <input
                      type="date"
                      value={recreateDate}
                      onChange={(e) => setRecreateDate(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand/40"
                    />
                  </div>
                  <button
                    onClick={handleRecreate}
                    disabled={isRecreatePending || !recreateDate}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-medium hover:bg-amber-700 disabled:opacity-50 transition-colors"
                  >
                    {isRecreatePending ? 'Criando…' : 'Confirmar'}
                  </button>
                  <button
                    onClick={() => setShowRecreate(false)}
                    className="px-3 py-1.5 text-xs text-gray-400 hover:text-gray-600"
                  >
                    Cancelar
                  </button>
                  {recreateError && <p className="w-full text-xs text-red-600">{recreateError}</p>}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Trocar de Plano — só aparece quando já existe assinatura */}
      {subscription && plans && plans.length > 1 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">Trocar de Plano</h3>

          {changeSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-800">
              {changeSuccess}
            </div>
          )}
          {changeError && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-800">
              {changeError}
            </div>
          )}
          {changeBlockedUntil && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-800 space-y-2">
              <p>Downgrade bloqueado até {new Date(changeBlockedUntil).toLocaleDateString('pt-BR')} (carência de 3 meses).</p>
              <button
                onClick={() => handleChangePlan(true)}
                disabled={isChangePending}
                className="text-xs font-medium underline"
              >
                Forçar troca mesmo assim (override admin)
              </button>
            </div>
          )}

          <div className="space-y-2">
            {plans
              .filter((p) => p.id !== subscription.planId)
              .map((plan) => (
                <label
                  key={plan.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    changePlanId === plan.id
                      ? 'border-brand bg-yellow-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="change-plan"
                    value={plan.id}
                    checked={changePlanId === plan.id}
                    onChange={() => setChangePlanId(plan.id)}
                    className="accent-brand"
                  />
                  <span className="text-sm font-medium text-gray-900">{plan.name}</span>
                  <span className="text-sm text-gray-500">— {formatPrice(plan.price)}/mês</span>
                </label>
              ))}
          </div>

          <button
            onClick={() => handleChangePlan(false)}
            disabled={isChangePending || !changePlanId}
            className="px-4 py-2 rounded-lg bg-brand text-brand-dark text-sm font-medium hover:bg-brand-hover disabled:opacity-50 transition-colors"
          >
            {isChangePending ? 'Alterando…' : 'Confirmar Troca de Plano'}
          </button>
        </div>
      )}

      {!subscription && (
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

          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Primeira cobrança em
            </label>
            <input
              type="date"
              value={firstDueDate}
              onChange={(e) => setFirstDueDate(e.target.value)}
              min={daysFromNowStr(1)}
              className="w-full sm:w-48 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand/40"
            />
            <p className="text-xs text-gray-400 mt-1">
              Padrão: 30 dias. Ajuste conforme o que foi combinado com o cliente.
            </p>
          </div>

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
