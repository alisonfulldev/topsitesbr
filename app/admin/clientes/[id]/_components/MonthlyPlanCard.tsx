'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { createDomainChargeAction, createEarlyTerminationChargeAction } from '../mensal-actions'

type Props = {
  clientId: string
  monthlyPrice: number | null
  subscriptionStatus: string | null
  paidMonths: number
  fidelityEndsAt: string | null
  quitacao: { inFidelity: boolean; remainingMonths: number; total: number }
  hasContract: boolean
  domainPrice: number
}

const brl = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const STATUS_LABEL: Record<string, string> = {
  pending: 'Contrato assinado — aguardando 1º Pix',
  active: 'Ativo',
  overdue: 'Em atraso',
  canceled: 'Cancelado',
}

export function MonthlyPlanCard(props: Props) {
  const [message, setMessage] = useState('')
  const [isPending, startTransition] = useTransition()

  function run(action: () => Promise<{ error?: string; paymentUrl?: string }>, confirmText: string) {
    if (!window.confirm(confirmText)) return
    setMessage('')
    startTransition(async () => {
      const result = await action()
      setMessage(result.error ? `Erro: ${result.error}` : `Cobrança gerada e enviada ao cliente por e-mail.${result.paymentUrl ? ` Link: ${result.paymentUrl}` : ''}`)
    })
  }

  const fidelityDate = props.fidelityEndsAt ? new Date(props.fidelityEndsAt).toLocaleDateString('pt-BR') : null

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Plano mensal sem taxa de criação</h3>
        {props.hasContract && (
          <Link href={`/admin/clientes/${props.clientId}/comprovante`} className="text-xs text-brand-text hover:underline">
            Ver contrato assinado →
          </Link>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-xs text-gray-500">Mensalidade</dt>
          <dd className="font-medium text-gray-900">{props.monthlyPrice != null ? brl(props.monthlyPrice) : '—'}</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500">Situação</dt>
          <dd className="font-medium text-gray-900">
            {props.subscriptionStatus ? STATUS_LABEL[props.subscriptionStatus] ?? props.subscriptionStatus : 'Aguardando assinatura do contrato'}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500">Meses pagos</dt>
          <dd className="font-medium text-gray-900">{props.paidMonths}</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500">Fidelidade até</dt>
          <dd className="font-medium text-gray-900">{fidelityDate ?? '—'}</dd>
        </div>
      </dl>

      {props.subscriptionStatus && props.subscriptionStatus !== 'pending' && (
        <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
          {props.quitacao.inFidelity ? (
            <>
              Quitação antecipada hoje: <strong>{brl(props.quitacao.total)}</strong>{' '}
              <span className="text-gray-500">({props.quitacao.remainingMonths} mensalidade(s) restante(s) + 2%)</span>
            </>
          ) : (
            'Fidelidade cumprida — o cliente pode encerrar sem multa.'
          )}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {props.quitacao.inFidelity && props.subscriptionStatus !== 'pending' && (
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              run(
                () => createEarlyTerminationChargeAction(props.clientId),
                `Gerar cobrança de quitação de ${brl(props.quitacao.total)} por Pix (vencimento em 5 dias)?`,
              )
            }
            className="px-3 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Gerar cobrança de quitação
          </button>
        )}
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            run(
              () => createDomainChargeAction(props.clientId),
              `Gerar cobrança do domínio próprio (${brl(props.domainPrice)} por 1 ano) por Pix?`,
            )
          }
          className="px-3 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Cobrar domínio ({brl(props.domainPrice)}/ano)
        </button>
      </div>

      {message && <p className="mt-3 text-xs text-gray-600 break-all" role="status">{message}</p>}
    </div>
  )
}
