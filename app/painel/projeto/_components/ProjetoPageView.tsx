'use client'

import { useState, useTransition } from 'react'
import { approveSiteAction, requestRevisionAction } from '../actions'

type ProposalStatus =
  | 'aprovada'
  | 'paga'
  | 'em_desenvolvimento'
  | 'pronto_revisao'
  | 'publicado'

type ProposalData = {
  id: string
  title: string
  status: ProposalStatus
  previewUrl: string | null
  revisionUsed: boolean
  siteApprovedAt: Date | null
  paidAt: Date | null
}

const STEPS = [
  {
    key: 'paga',
    label: 'Pagamento confirmado',
    description: 'O pagamento foi recebido e seu projeto foi iniciado.',
  },
  {
    key: 'em_desenvolvimento',
    label: 'Em desenvolvimento',
    description: 'Nossa equipe está construindo o seu site.',
  },
  {
    key: 'pronto_revisao',
    label: 'Pronto para revisão',
    description: 'O site está pronto! Revise e nos diga o que achar.',
  },
  {
    key: 'publicado',
    label: 'Publicado',
    description: 'Seu site está no ar!',
  },
]

const STATUS_ORDER: Record<ProposalStatus, number> = {
  aprovada: -1,
  paga: 0,
  em_desenvolvimento: 1,
  pronto_revisao: 2,
  publicado: 3,
}

interface Props {
  proposal: ProposalData
}

export function ProjetoPageView({ proposal }: Props) {
  const [isPending, startTransition] = useTransition()
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRevisionModal, setShowRevisionModal] = useState(false)
  const [revisionNotes, setRevisionNotes] = useState('')
  const [result, setResult] = useState<{ error?: string; success?: boolean } | null>(null)

  // Pagamento ainda não confirmado — aguarda webhook do Asaas
  if (proposal.status === 'aprovada') {
    return (
      <div className="max-w-xl">
        <h1 className="text-xl font-semibold text-gray-900 mb-1">Meu Projeto</h1>
        <p className="text-sm text-gray-500 mb-6">{proposal.title}</p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 text-center">
          <div className="text-3xl mb-3">⏳</div>
          <p className="text-sm font-semibold text-yellow-800 mb-1">Aguardando confirmação do pagamento</p>
          <p className="text-xs text-yellow-700">
            Assim que o pagamento for confirmado, o projeto entra em desenvolvimento automaticamente e você será notificado aqui.
          </p>
        </div>
      </div>
    )
  }

  const currentStepIdx = STATUS_ORDER[proposal.status]

  function handleApprove() {
    startTransition(async () => {
      const res = await approveSiteAction(proposal.id)
      setResult(res)
      if (res.success) setShowApproveModal(false)
    })
  }

  function handleRequestRevision() {
    startTransition(async () => {
      const res = await requestRevisionAction(proposal.id, revisionNotes)
      setResult(res)
      if (res.success) {
        setShowRevisionModal(false)
        setRevisionNotes('')
      }
    })
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-semibold text-gray-900 mb-1">Meu Projeto</h1>
      <p className="text-sm text-gray-500 mb-6">{proposal.title}</p>

      {/* Timeline */}
      <div className="relative mb-8">
        {STEPS.map((step, idx) => {
          const done = currentStepIdx > idx
          const active = currentStepIdx === idx
          const upcoming = currentStepIdx < idx

          return (
            <div key={step.key} className="flex gap-4 pb-6 last:pb-0">
              {/* Line + dot column */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 ${
                    done
                      ? 'bg-green-500 border-green-500'
                      : active
                        ? 'bg-brand border-brand'
                        : 'bg-white border-gray-300'
                  }`}
                >
                  {done ? (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : active ? (
                    <div className="w-3 h-3 rounded-full bg-brand-dark" />
                  ) : (
                    <div className="w-3 h-3 rounded-full bg-gray-300" />
                  )}
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`w-0.5 flex-1 mt-1 ${done ? 'bg-green-400' : 'bg-gray-200'}`} />
                )}
              </div>

              {/* Content */}
              <div className="pt-1 pb-2 flex-1 min-w-0">
                <p
                  className={`text-sm font-semibold ${
                    done ? 'text-green-700' : active ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </p>
                {!upcoming && (
                  <p className={`text-xs mt-0.5 ${done ? 'text-gray-400' : 'text-gray-500'}`}>
                    {step.description}
                  </p>
                )}

                {/* Revision section — shown when in pronto_revisao */}
                {step.key === 'pronto_revisao' && active && (
                  <div className="mt-4 space-y-3">
                    {proposal.previewUrl && (
                      <a
                        href={proposal.previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-brand-text hover:underline font-medium"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Ver prévia do site →
                      </a>
                    )}

                    {proposal.siteApprovedAt ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-sm text-green-800 font-medium">
                          Aprovação enviada — aguardando publicação
                        </p>
                        <p className="text-xs text-green-600 mt-0.5">
                          Aprovado em {proposal.siteApprovedAt.toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    ) : result?.success ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-sm text-green-800 font-medium">
                          {showRevisionModal === false && result?.success && !showApproveModal
                            ? 'Solicitação enviada!'
                            : 'Aprovação enviada!'}
                        </p>
                      </div>
                    ) : (
                      <div className="flex gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setShowApproveModal(true)}
                          className="px-4 py-2 bg-brand text-brand-dark text-sm font-semibold rounded-lg hover:bg-brand-hover"
                        >
                          Aprovar site
                        </button>
                        {!proposal.revisionUsed && (
                          <button
                            type="button"
                            onClick={() => setShowRevisionModal(true)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
                          >
                            Solicitar ajustes
                          </button>
                        )}
                        {proposal.revisionUsed && (
                          <p className="text-xs text-gray-400 self-center">
                            Revisão já utilizada nesta proposta.
                          </p>
                        )}
                      </div>
                    )}

                    {result?.error && (
                      <p className="text-xs text-red-600">{result.error}</p>
                    )}
                  </div>
                )}

                {/* Success message when published */}
                {step.key === 'publicado' && active && (
                  <div className="mt-3 space-y-3">
                    <div className="bg-brand-50 border border-brand-200 rounded-lg p-3">
                      <p className="text-sm font-semibold text-brand-text">
                        Seu site está no ar!
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Ative o plano mensal para manter seu site publicado com hospedagem, SSL e suporte.
                      </p>
                    </div>
                    <a
                      href="/painel"
                      className="block w-full text-center py-3 bg-brand text-brand-dark font-semibold rounded-xl hover:bg-brand-hover transition-colors text-sm"
                    >
                      Ativar plano e manter site no ar →
                    </a>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Approve modal */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-base font-semibold text-gray-900 mb-2">Confirmar aprovação</h2>
            <p className="text-sm text-gray-600 mb-6">
              Ao aprovar, confirma que o site está do jeito que você quer. Nossa equipe irá publicá-lo em seguida.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowApproveModal(false)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={isPending}
                className="px-4 py-2 text-sm bg-brand text-brand-dark font-semibold rounded-lg hover:bg-brand-hover disabled:opacity-50"
              >
                {isPending ? 'Enviando…' : 'Sim, aprovar site'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revision modal */}
      {showRevisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-base font-semibold text-gray-900 mb-2">Solicitar ajustes</h2>
            <p className="text-sm text-gray-600 mb-4">
              Descreva o que precisa ser ajustado. Você tem direito a uma revisão nesta proposta.
            </p>
            <textarea
              value={revisionNotes}
              onChange={(e) => setRevisionNotes(e.target.value)}
              placeholder="Ex: Mudar a cor do botão para azul, trocar a foto do banner..."
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand mb-4 resize-none"
            />
            {result?.error && (
              <p className="text-xs text-red-600 mb-3">{result.error}</p>
            )}
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => { setShowRevisionModal(false); setResult(null) }}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleRequestRevision}
                disabled={isPending || !revisionNotes.trim()}
                className="px-4 py-2 text-sm bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-50"
              >
                {isPending ? 'Enviando…' : 'Enviar solicitação'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
