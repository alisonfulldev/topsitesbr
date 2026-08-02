'use client'

import { useState, useTransition } from 'react'
import { generateProposalMagicLink, resendProposalEmail, updateProposalAdmin, transitionProposalStatus, resetProposalCharge, skipProposalBriefing } from '../proposal-actions'

const STATUS_LABEL: Record<string, string> = {
  rascunho: 'Rascunho',
  enviada: 'Enviada',
  aprovada: 'Aprovada',
  paga: 'Paga',
  aguardando_info: 'Aguardando informações',
  em_desenvolvimento: 'Em desenvolvimento',
  pronto_revisao: 'Pronto para revisão',
  publicado: 'Publicado',
}

const STATUS_COLOR: Record<string, string> = {
  rascunho: 'bg-gray-100 text-gray-600',
  enviada: 'bg-blue-100 text-blue-700',
  aprovada: 'bg-green-100 text-green-700',
  paga: 'bg-emerald-100 text-emerald-700',
  aguardando_info: 'bg-orange-100 text-orange-700',
  em_desenvolvimento: 'bg-yellow-100 text-yellow-700',
  pronto_revisao: 'bg-purple-100 text-purple-700',
  publicado: 'bg-brand-100 text-brand-text',
}

type SiteOption = { id: string; siteUrl: string | null; siteType: string }

type ProposalData = {
  id: string
  title: string
  creationPrice: number
  status: string
  previewUrl: string | null
  siteId: string | null
  siteApprovedAt: Date | null
  revisionUsed: boolean
  revisionNotes: string | null
  createdAt: Date
  briefingSkipped: boolean
  briefing: {
    data: Record<string, unknown>
    submittedAt: Date
  } | null
}

interface Props {
  proposal: ProposalData
  sites: SiteOption[]
  clientId: string
}

export function ProposalCard({ proposal, sites, clientId }: Props) {
  const [isPending, startTransition] = useTransition()
  const [linkStatus, setLinkStatus] = useState<'idle' | 'copying' | 'copied' | 'error'>('idle')
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [editMode, setEditMode] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(proposal.previewUrl ?? '')
  const [siteId, setSiteId] = useState(proposal.siteId ?? '')
  const [creationPrice, setCreationPrice] = useState(String(proposal.creationPrice))
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const [transitionStatus, setTransitionStatus] = useState<'idle' | 'pending' | 'done' | 'error'>('idle')
  const [transitionError, setTransitionError] = useState('')
  const [resetStatus, setResetStatus] = useState<'idle' | 'pending' | 'done' | 'error'>('idle')
  const [resetError, setResetError] = useState('')
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [skipStatus, setSkipStatus] = useState<'idle' | 'pending' | 'done' | 'error'>('idle')
  const [skipError, setSkipError] = useState('')

  async function handleCopyLink() {
    setLinkStatus('copying')
    const result = await generateProposalMagicLink(proposal.id)
    if ('error' in result) {
      setLinkStatus('error')
      setTimeout(() => setLinkStatus('idle'), 3000)
      return
    }
    try {
      await navigator.clipboard.writeText(result.url)
      setLinkStatus('copied')
      setTimeout(() => setLinkStatus('idle'), 2500)
    } catch {
      setLinkStatus('error')
      setTimeout(() => setLinkStatus('idle'), 3000)
    }
  }

  async function handleResendEmail() {
    setEmailStatus('sending')
    const result = await resendProposalEmail(proposal.id)
    if (result.error) {
      setEmailStatus('error')
    } else {
      setEmailStatus('sent')
    }
    setTimeout(() => setEmailStatus('idle'), 2500)
  }

  function handleSave() {
    startTransition(async () => {
      const result = await updateProposalAdmin(proposal.id, {
        previewUrl: previewUrl || undefined,
        siteId: siteId || null,
        creationPrice: parseFloat(creationPrice.replace(',', '.')),
      })
      if (result.error) {
        setSaveStatus('error')
        setTimeout(() => setSaveStatus('idle'), 3000)
      } else {
        setSaveStatus('saved')
        setEditMode(false)
        setTimeout(() => setSaveStatus('idle'), 2000)
      }
    })
  }

  function handleTransition(newStatus: 'aguardando_info' | 'em_desenvolvimento' | 'pronto_revisao' | 'publicado') {
    setTransitionStatus('pending')
    setTransitionError('')
    startTransition(async () => {
      const result = await transitionProposalStatus(proposal.id, newStatus)
      if (result.error) {
        setTransitionStatus('error')
        setTransitionError(result.error)
        setTimeout(() => setTransitionStatus('idle'), 4000)
      } else {
        setTransitionStatus('done')
        setTimeout(() => setTransitionStatus('idle'), 2000)
      }
    })
  }

  function handleSkipBriefing() {
    setSkipStatus('pending')
    setSkipError('')
    startTransition(async () => {
      const result = await skipProposalBriefing(proposal.id)
      if (result.error) {
        setSkipStatus('error')
        setSkipError(result.error)
        setTimeout(() => setSkipStatus('idle'), 4000)
      } else {
        setSkipStatus('done')
        setTimeout(() => setSkipStatus('idle'), 2000)
      }
    })
  }

  function handleReset() {
    setResetStatus('pending')
    setResetError('')
    startTransition(async () => {
      const result = await resetProposalCharge(proposal.id)
      if (result.error) {
        setResetStatus('error')
        setResetError(result.error)
        setTimeout(() => setResetStatus('idle'), 4000)
      } else {
        setResetStatus('done')
        setShowResetConfirm(false)
        setTimeout(() => setResetStatus('idle'), 2000)
      }
    })
  }

  const linkedSite = sites.find((s) => s.id === (siteId || proposal.siteId))

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Proposta</h3>
        <span
          className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLOR[proposal.status] ?? 'bg-gray-100 text-gray-600'}`}
        >
          {STATUS_LABEL[proposal.status] ?? proposal.status}
        </span>
      </div>

      <p className="text-sm font-medium text-gray-900 mb-0.5">{proposal.title}</p>
      <p className="text-sm text-gray-500 mb-4">
        R$ {Number(proposal.creationPrice).toFixed(2).replace('.', ',')}
        <span className="mx-2 text-gray-300">·</span>
        Enviada em {proposal.createdAt.toLocaleDateString('pt-BR')}
      </p>

      {/* Badge de revisão solicitada */}
      {proposal.revisionUsed && !proposal.siteApprovedAt && (
        <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-xs font-semibold text-purple-800 mb-1">Cliente solicitou revisão</p>
          {proposal.revisionNotes ? (
            <p className="text-sm text-purple-900 whitespace-pre-wrap">{proposal.revisionNotes}</p>
          ) : (
            <p className="text-xs text-purple-500 italic">Sem observações adicionais.</p>
          )}
        </div>
      )}

      {/* Magic link + reenviar */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={handleCopyLink}
          disabled={linkStatus === 'copying'}
          className="flex-1 text-sm px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          {linkStatus === 'copying'
            ? 'Gerando…'
            : linkStatus === 'copied'
            ? '✓ Link copiado!'
            : linkStatus === 'error'
            ? 'Erro ao gerar'
            : 'Copiar magic link'}
        </button>
        <button
          type="button"
          onClick={handleResendEmail}
          disabled={emailStatus === 'sending'}
          className="text-sm px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          {emailStatus === 'sending'
            ? 'Enviando…'
            : emailStatus === 'sent'
            ? '✓ Enviado'
            : emailStatus === 'error'
            ? 'Erro'
            : 'Reenviar e-mail'}
        </button>
      </div>

      {/* Recriar cobrança — visível apenas quando aprovada (cobrança criada mas não paga) */}
      {proposal.status === 'aprovada' && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-800 mb-2">
            Cobrança já criada no Asaas com o valor anterior. Para aplicar um novo valor, recrie a cobrança.
          </p>
          {!showResetConfirm ? (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="text-xs px-3 py-1.5 border border-amber-400 text-amber-800 rounded-lg hover:bg-amber-100"
            >
              Recriar cobrança
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-medium text-amber-900">
                Isso vai cancelar a cobrança atual no Asaas e voltar a proposta para "enviada". O cliente precisará aprovar novamente. Confirma?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={resetStatus === 'pending'}
                  className="text-xs px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
                >
                  {resetStatus === 'pending' ? 'Cancelando…' : 'Sim, recriar'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="text-xs px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
              {resetStatus === 'error' && (
                <p className="text-xs text-red-600">{resetError}</p>
              )}
              {resetStatus === 'done' && (
                <p className="text-xs text-green-700">Cobrança cancelada. Proposta voltou para "enviada".</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Info atual (fora do modo edit) */}
      {!editMode && (
        <div className="space-y-1.5 mb-3">
          {proposal.previewUrl ? (
            <p className="text-sm">
              <span className="text-gray-500">Preview: </span>
              <a
                href={proposal.previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-text hover:underline break-all"
              >
                {proposal.previewUrl}
              </a>
            </p>
          ) : (
            <p className="text-sm text-gray-400">Sem URL de preview cadastrada.</p>
          )}
          {linkedSite && !siteId ? (
            <p className="text-sm">
              <span className="text-gray-500">Site: </span>
              <a
                href={`/admin/clientes/${clientId}/sites/${proposal.siteId}`}
                className="text-brand-text hover:underline"
              >
                {linkedSite.siteUrl ?? `(${linkedSite.siteType})`}
              </a>
            </p>
          ) : null}
        </div>
      )}

      {/* Edit form */}
      {!editMode ? (
        <button
          type="button"
          onClick={() => setEditMode(true)}
          className="text-xs text-gray-400 hover:text-gray-600 underline"
        >
          Editar preview / site vinculado
        </button>
      ) : (
        <div className="border-t border-gray-100 pt-3 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Valor da proposta (R$)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={creationPrice}
              onChange={(e) => setCreationPrice(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              URL de preview do site
            </label>
            <input
              type="url"
              value={previewUrl}
              onChange={(e) => setPreviewUrl(e.target.value)}
              placeholder="https://preview.exemplo.com.br"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Site vinculado
            </label>
            <select
              value={siteId}
              onChange={(e) => setSiteId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="">— Nenhum —</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.siteUrl ?? `(${s.siteType})`} — {s.id.slice(0, 8)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending}
              className="px-3 py-1.5 text-sm bg-brand text-brand-dark rounded-lg hover:bg-brand-hover disabled:opacity-50"
            >
              {isPending ? 'Salvando…' : saveStatus === 'saved' ? '✓ Salvo' : 'Salvar'}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditMode(false)
                setPreviewUrl(proposal.previewUrl ?? '')
                setSiteId(proposal.siteId ?? '')
                setCreationPrice(String(proposal.creationPrice))
              }}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
          {saveStatus === 'error' && (
            <p className="text-xs text-red-600">Erro ao salvar.</p>
          )}
        </div>
      )}

      {/* Status transitions */}
      {(proposal.status === 'paga' ||
        proposal.status === 'aguardando_info' ||
        proposal.status === 'em_desenvolvimento' ||
        proposal.status === 'pronto_revisao') && (
        <div className="border-t border-gray-100 mt-4 pt-4">
          <p className="text-xs font-medium text-gray-500 mb-2">Avançar status</p>

          {(proposal.status === 'paga' || proposal.status === 'aguardando_info') && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleTransition('em_desenvolvimento')}
                disabled={isPending || transitionStatus === 'pending'}
                className="px-3 py-1.5 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50"
              >
                {transitionStatus === 'pending' ? 'Salvando…' : '→ Iniciar desenvolvimento'}
              </button>
              {proposal.status === 'aguardando_info' && (
                <div>
                  <button
                    type="button"
                    onClick={handleSkipBriefing}
                    disabled={isPending || skipStatus === 'pending'}
                    className="px-3 py-1.5 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    {skipStatus === 'pending' ? 'Salvando…' : 'Pular informações (já coletadas por fora)'}
                  </button>
                  {skipStatus === 'done' && (
                    <p className="text-xs text-green-700 mt-1">Avançado para em desenvolvimento.</p>
                  )}
                  {skipStatus === 'error' && (
                    <p className="text-xs text-red-600 mt-1">{skipError}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {proposal.status === 'em_desenvolvimento' && (
            <button
              type="button"
              onClick={() => handleTransition('pronto_revisao')}
              disabled={isPending || transitionStatus === 'pending'}
              className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {transitionStatus === 'pending' ? 'Salvando…' : '→ Marcar como pronto para revisão'}
            </button>
          )}

          {proposal.status === 'pronto_revisao' && (
            <div className="space-y-2">
              {proposal.siteApprovedAt && (
                <p className="text-xs text-green-700 font-medium">
                  Cliente aprovou em {proposal.siteApprovedAt.toLocaleDateString('pt-BR')}
                </p>
              )}
              <button
                type="button"
                onClick={() => handleTransition('publicado')}
                disabled={isPending || transitionStatus === 'pending'}
                className="px-3 py-1.5 text-sm bg-brand text-brand-dark font-semibold rounded-lg hover:bg-brand-hover disabled:opacity-50"
              >
                {transitionStatus === 'pending' ? 'Salvando…' : '→ Publicar site'}
              </button>
            </div>
          )}

          {transitionStatus === 'done' && (
            <p className="text-xs text-green-700 mt-1">Status atualizado.</p>
          )}
          {transitionStatus === 'error' && (
            <p className="text-xs text-red-600 mt-1">{transitionError}</p>
          )}
        </div>
      )}

      {/* Informações do Site */}
      <div className="border-t border-gray-100 mt-4 pt-4">
        <p className="text-xs font-medium text-gray-500 mb-2">Informações do Site</p>
        {proposal.briefingSkipped ? (
          <p className="text-xs text-gray-400 italic">Coletadas por fora da plataforma.</p>
        ) : proposal.briefing ? (
          <BriefingDisplay data={proposal.briefing.data} submittedAt={proposal.briefing.submittedAt} />
        ) : (
          <p className="text-xs text-gray-400">Aguardando o cliente preencher.</p>
        )}
      </div>
    </div>
  )
}

function BriefingDisplay({ data, submittedAt }: { data: Record<string, unknown>; submittedAt: Date }) {
  const d = data as Record<string, string | string[]>
  const rows: [string, string | undefined][] = [
    ['Nome da empresa', d.companyName as string],
    ['Ramo de atuação', d.industry as string],
    ['Sobre a empresa', d.companyDescription as string],
    ['Missão / objetivo', d.mission as string],
    ['Objetivos do site', Array.isArray(d.goals) ? (d.goals as string[]).join(', ') : undefined],
    ['Outro objetivo', d.goalsOther as string],
    ['Público-alvo', d.targetAudience as string],
    ['Regiões que atende', d.regions as string],
    ['Serviços / produtos', d.services as string],
    ['Serviço em destaque', d.highlightedService as string],
    ['Possui textos prontos?', d.hasTexts === 'sim' ? 'Sim' : 'Não'],
    ['Textos prontos', d.texts as string],
    ['Possui logotipo?', d.hasLogo === 'sim' ? 'Sim' : 'Não'],
    ['Cores da marca', d.brandColors as string],
    ['WhatsApp', d.contactWhatsapp as string],
    ['Telefone', d.contactPhone as string],
    ['E-mail', d.contactEmail as string],
    ['Endereço', d.contactAddress as string],
    ['Horário de atendimento', d.contactHours as string],
    ['Redes sociais', d.contactSocial as string],
    ['Funcionalidades', Array.isArray(d.features) ? (d.features as string[]).join(', ') : undefined],
    ['Outra funcionalidade', d.featuresOther as string],
    ['Sites que gosta', d.sitesLike as string],
    ['Sites que não gosta', d.sitesDislike as string],
    ['Observações finais', d.finalNotes as string],
  ]

  return (
    <div>
      <p className="text-xs text-green-700 mb-2">
        Enviado em {submittedAt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
      </p>
      <div className="space-y-1">
        {rows.filter(([, v]) => v).map(([label, value]) => (
          <div key={label} className="flex gap-2">
            <span className="text-xs text-gray-500 shrink-0 w-36">{label}:</span>
            <span className="text-xs text-gray-800 whitespace-pre-wrap">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
