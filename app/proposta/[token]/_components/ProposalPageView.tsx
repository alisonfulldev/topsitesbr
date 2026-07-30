'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
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

// ── Modal com o texto completo do contrato ─────────────────────────────────────

function ContractModal({
  clientName,
  proposalTitle,
  creationPrice,
  onClose,
}: {
  clientName: string
  proposalTitle: string
  creationPrice: number
  onClose: () => void
}) {
  const priceFormatted = Number(creationPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
  const clauses = [
    `1. Partes: TOP SITE, CNPJ 22.556.759/0001-98 (Contratada) e ${clientName} (Contratante).`,
    `2. Objeto: desenvolvimento de um site conforme o escopo da proposta "${proposalTitle}" e do briefing acordado.`,
    `3. Valor e pagamento: o valor da proposta refere-se EXCLUSIVAMENTE ao desenvolvimento (criação) do site, no valor de R$ ${priceFormatted}. Pagamento único via Asaas; a confirmação inicia a produção.`,
    `4. O que está incluído: os itens listados como inclusos na proposta.`,
    `5. Revisão: 1 (uma) rodada de ajustes dentro do escopo do briefing; alterações fora do escopo são orçadas à parte.`,
    `6. Prazo de entrega: o site será entregue em até 7 (sete) dias úteis, contados a partir da confirmação do pagamento e do envio, pelo Contratante, de todo o conteúdo necessário para a produção (textos, imagens e informações do briefing).`,
    `7. Propriedade: os arquivos do site pertencem ao Contratante, que pode recebê-los mediante solicitação.`,
    `8. Responsabilidades do Contratante: veracidade e legalidade do conteúdo, e titularidade/licença de textos e imagens enviados.`,
    `9. Serviços não incluídos nesta contratação: publicação, hospedagem, SSL, monitoramento, manutenção, correções e alterações posteriores à entrega, e registro de domínio próprio (o site é disponibilizado em endereço/domínio provisório fornecido pela Contratada). Tais serviços podem ser contratados separadamente.`,
    `10. Direito de arrependimento e serviço personalizado: nos termos do art. 49 do CDC, por se tratar de contratação fora de estabelecimento físico, o Contratante poderá desistir em até 7 (sete) dias corridos contados da aprovação, desde que o desenvolvimento ainda não tenha sido iniciado. Uma vez iniciada a produção — o que ocorre após a confirmação do pagamento e o envio do conteúdo —, por se tratar de serviço personalizado e desenvolvido sob encomenda, conforme especificações exclusivas do Contratante, e que não pode ser reaproveitado para terceiros, o valor correspondente ao desenvolvimento já realizado não será restituído, cabendo eventual devolução apenas sobre etapas comprovadamente não executadas. A satisfação estética/subjetiva do Contratante será atendida por meio da rodada de ajustes prevista na cláusula 5, dentro do escopo do briefing, não constituindo motivo para restituição de valores.`,
    `11. Aceite: ao marcar a caixa e aprovar, o Contratante declara ter lido e concordado, manifestando vontade eletrônica com validade jurídica nos termos da legislação brasileira.`,
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4 pb-4 sm:pb-0">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-xl flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-sm font-semibold text-gray-900">Contrato de Desenvolvimento de Site</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4 space-y-3 text-xs text-gray-700 leading-relaxed">
          <p className="font-bold text-gray-900 text-center text-xs">
            CONTRATO DE PRESTAÇÃO DE SERVIÇO DE DESENVOLVIMENTO DE SITE
          </p>
          {clauses.map((clause, i) => (
            <p key={i}>{clause}</p>
          ))}
        </div>
        <div className="px-5 py-4 border-t border-gray-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Proposta enviada (estado principal) ────────────────────────────────────────

function EnviadaView({ token, proposal }: { token: string; proposal: ProposalData }) {
  const [showForm, setShowForm] = useState(false)
  const [showContractModal, setShowContractModal] = useState(false)
  const [contractAccepted, setContractAccepted] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const items = proposal.includedItems
    ? proposal.includedItems.split('\n').map((l) => l.trim()).filter(Boolean)
    : []

  function handleApprove() {
    setError('')
    if (!contractAccepted) {
      setError('Você precisa aceitar o Contrato de Desenvolvimento de Site antes de prosseguir.')
      return
    }
    if (password.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('As senhas não coincidem.')
      return
    }
    startTransition(async () => {
      const result = await approveProposalAction(token, password, contractAccepted)
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
        <Image src="/logo.png" alt="TOP SITE" width={140} height={42} className="h-9 w-auto" priority />
      </div>

      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Proposta badge */}
        <div className="inline-flex items-center gap-1.5 bg-brand/20 text-brand-text text-xs font-semibold px-3 py-1 rounded-full mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-text inline-block" />
          Proposta exclusiva
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">{proposal.title}</h1>
        <p className="text-gray-500 text-sm mb-6">Para {proposal.client.name}</p>

        {proposal.description && (
          <p className="text-gray-600 text-sm leading-relaxed mb-6">{proposal.description}</p>
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
            {Number(proposal.creationPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
            {/* Criar conta */}
            <h2 className="text-sm font-semibold text-gray-900 mb-1">Criar sua conta</h2>
            <p className="text-xs text-gray-500 mb-4">
              Você usará este e-mail e senha para acompanhar o projeto no painel.
            </p>

            <div className="mb-1 text-xs text-gray-500">
              E-mail:{' '}
              <span className="font-medium text-gray-800">{proposal.client.email}</span>
            </div>

            <div className="space-y-3 mt-3 mb-5">
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

            {/* Checkbox de aceite — mesmo padrão do ActivationScreen */}
            <label className="flex items-start gap-3 mb-4 cursor-pointer">
              <input
                type="checkbox"
                checked={contractAccepted}
                onChange={(e) => {
                  setContractAccepted(e.target.checked)
                  if (e.target.checked) setError('')
                }}
                className="mt-0.5 accent-brand shrink-0"
              />
              <span className="text-xs text-gray-500 leading-relaxed">
                Li e concordo com o{' '}
                <button
                  type="button"
                  onClick={() => setShowContractModal(true)}
                  className="text-brand-text hover:underline font-medium"
                >
                  Contrato de Desenvolvimento de Site
                </button>
                .
              </span>
            </label>

            {error && <p className="text-xs text-red-600 mb-3">{error}</p>}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleApprove}
                disabled={isPending || !contractAccepted}
                className="flex-1 py-2.5 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-50 text-sm transition-colors"
              >
                {isPending ? 'Processando…' : 'Confirmar aprovação e pagar →'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setError('')
                  setContractAccepted(false)
                }}
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

      {/* Modal do contrato */}
      {showContractModal && (
        <ContractModal
          clientName={proposal.client.name}
          proposalTitle={proposal.title}
          creationPrice={proposal.creationPrice}
          onClose={() => setShowContractModal(false)}
        />
      )}
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
        <Image src="/logo.png" alt="TOP SITE" width={140} height={42} className="h-9 w-auto" priority />
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
        <Image src="/logo.png" alt="TOP SITE" width={140} height={42} className="h-9 w-auto" priority />
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
