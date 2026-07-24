'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

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

const PLAN_BENEFITS = [
  'Site no ar com hospedagem e SSL',
  'Correções ilimitadas e gratuitas (bugs, erros, links quebrados)',
  'Monitoramento 24h e recuperação em caso de queda do servidor',
  '1 alteração de conteúdo por mês inclusa (texto ou imagem)',
  'Prazo de atendimento de até 7 dias',
  'Suporte especializado direto pelo WhatsApp',
  'Relatório de visitas completo',
  '10% de desconto em serviços e upgrades',
]

async function cancelSubscriptionAction() {
  // Cancel is handled via WhatsApp contact
}

export function AssinaturaPageClient({
  subscription,
}: {
  subscription: SubscriptionInfo
  plans?: unknown[]
}) {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''

  return (
    <div className="space-y-6">
      {/* Current subscription summary */}
      <Card>
        <CardTitle>Sua assinatura</CardTitle>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">Plano</span>
            <span className="text-sm font-semibold text-gray-900">
              {subscription.planName} — R${subscription.planPrice.toFixed(2).replace('.', ',')}/mês
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">Status</span>
            <span
              className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                STATUS_COLOR[subscription.status] ?? 'bg-gray-100 text-gray-600'
              }`}
            >
              {STATUS_LABEL[subscription.status] ?? subscription.status}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">Próxima cobrança</span>
            <span className="text-sm text-gray-900">
              {subscription.nextDueDate ? formatDate(subscription.nextDueDate) : '—'}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-500">Ativo desde</span>
            <span className="text-sm text-gray-900">{formatDate(subscription.planActivatedAt)}</span>
          </div>
        </div>
      </Card>

      {/* Plan benefits */}
      <Card>
        <CardTitle>O que está incluído no seu plano</CardTitle>
        <ul className="mt-4 space-y-2.5">
          {PLAN_BENEFITS.map((b) => (
            <li key={b} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-green-500 shrink-0 mt-0.5">✓</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* WhatsApp support */}
      {whatsappNumber && (
        <a
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          Suporte via WhatsApp
        </a>
      )}

      <p className="text-xs text-gray-400 text-center">
        Para cancelar ou alterar sua assinatura, entre em contato pelo WhatsApp ou acesse{' '}
        <Link href="/termos" className="hover:underline">Termos de Uso</Link>.
      </p>
    </div>
  )
}
