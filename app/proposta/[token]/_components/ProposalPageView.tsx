'use client'

import { useState, useTransition } from 'react'
import { approveProposalAction } from '../actions'

type ProposalData = {
  id: string
  title: string
  description: string | null
  includedItems: string | null
  creationPrice: number
  status: string
  paymentUrl: string | null
  client: { name: string; email: string }
}

interface Props {
  token: string
  proposal: ProposalData
}

const PAID_STATUSES = ['paga', 'em_desenvolvimento', 'pronto_revisao', 'publicado']

export function ProposalPageView({ token, proposal }: Props) {
  if (PAID_STATUSES.includes(proposal.status)) {
    return <PaidView clientName={proposal.client.name} />
  }
  if (proposal.status === 'aprovada') {
    return <ApprovedView paymentUrl={proposal.paymentUrl} clientName={proposal.client.name} />
  }
  return <EnviadaView token={token} proposal={proposal} />
}

// ── Proposta enviada (estado principal) ────────────────────────────────────────

function EnviadaView({ token, proposal }: { token: string; proposal: ProposalData }) {
  const [showForm, setShowForm] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const items = proposal.includedItems
    ? proposal.includedItems.split('\n').map((l) => l.trim()).filter(Boolean)
    : []

  function handleApprove() {
    setError('')
    if (password.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('As senhas não coincidem.')
      return
    }
    startTransition(async () => {
      const result = await approveProposalAction(token, password)
      if (result.error) {
        setError(result.error)
      } else if (result.paymentUrl) {
        window.location.href = result.paymentUrl
      }
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-black py-4 px-6">
        <span className="text-brand font-bold text-lg tracking-tight">TOP SITE</span>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Proposta badge */}
        <div className="inline-flex items-center gap-1.5 bg-brand/20 text-brand-text text-xs font-semibold px-3 py-1 rounded-full mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-text inline-block" />
          Proposta exclusiva
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">{proposal.title}</h1>
        <p className="text-gray-500 text-sm mb-6">
          Para {proposal.client.name}
        </p>

        {proposal.description && (
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            {proposal.description}
          </p>
        )}

        {/* Itens incluídos */}
        {items.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              O que está incluído
            </h2>
            <ul className="space-y-2.5">
              {items.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-800">
                  <span className="mt-0.5 w-4 h-4 rounded-full bg-brand flex items-center justify-center shrink-0">
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
                      <path d="M1 4l2.5 2.5L9 1" stroke="#1a1a1a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Preço */}
        <div className="bg-brand rounded-xl p-5 mb-6 text-center">
          <p className="text-xs font-semibold text-brand-dark/60 uppercase tracking-wider mb-1">
            Valor total do projeto
          </p>
          <p className="text-4xl font-extrabold text-brand-dark">
            R${' '}
            {Number(proposal.creationPrice).toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>

        {/* CTA / Form */}
        {!showForm ? (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="w-full py-3.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors text-sm"
          >
            Aprovar proposta →
          </button>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-1">Criar sua conta</h2>
            <p className="text-xs text-gray-500 mb-4">
              Você usará este e-mail e senha para acompanhar o projeto no painel.
            </p>

            <div className="mb-1 text-xs text-gray-500">
              E-mail:{' '}
              <span className="font-medium text-gray-800">{proposal.client.email}</span>
            </div>

            <div className="space-y-3 mt-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Senha <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Confirmar senha <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repita a senha"
                  autoComplete="new-password"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
            </div>

            {error && (
              <p className="mt-3 text-xs text-red-600">{error}</p>
            )}

            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={handleApprove}
                disabled={isPending}
                className="flex-1 py-2.5 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-50 text-sm transition-colors"
              >
                {isPending ? 'Processando…' : 'Confirmar aprovação e pagar →'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setError('') }}
                className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                Voltar
              </button>
            </div>

            <p className="text-xs text-gray-400 mt-3 text-center">
              Ao confirmar, você será redirecionado para o pagamento seguro.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Aprovada, aguardando pagamento ─────────────────────────────────────────────

function ApprovedView({
  paymentUrl,
  clientName,
}: {
  paymentUrl: string | null
  clientName: string
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-black py-4 px-6">
        <span className="text-brand font-bold text-lg tracking-tight">TOP SITE</span>
      </div>
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Proposta aprovada!</h1>
        <p className="text-gray-500 text-sm mb-8">
          Olá, {clientName}. Sua proposta foi aprovada — finalize o pagamento para iniciarmos o projeto.
        </p>
        {paymentUrl ? (
          <a
            href={paymentUrl}
            className="inline-block w-full max-w-xs py-3.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors text-sm"
          >
            Ir para o pagamento →
          </a>
        ) : (
          <p className="text-sm text-gray-400">
            O link de pagamento está sendo gerado. Aguarde ou entre em contato conosco.
          </p>
        )}
      </div>
    </div>
  )
}

// ── Paga / em andamento ────────────────────────────────────────────────────────

function PaidView({ clientName }: { clientName: string }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-black py-4 px-6">
        <span className="text-brand font-bold text-lg tracking-tight">TOP SITE</span>
      </div>
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Proposta aprovada e paga!</h1>
        <p className="text-gray-500 text-sm mb-8">
          Olá, {clientName}. Estamos trabalhando no seu projeto. Acompanhe tudo pelo painel.
        </p>
        <a
          href="/login"
          className="inline-block w-full max-w-xs py-3.5 bg-brand text-brand-dark font-semibold rounded-xl hover:bg-brand-hover transition-colors text-sm"
        >
          Acessar o painel →
        </a>
      </div>
    </div>
  )
}
