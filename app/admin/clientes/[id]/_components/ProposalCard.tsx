'use client'

import { useState, useTransition } from 'react'
import { generateProposalMagicLink, resendProposalEmail, updateProposalAdmin } from '../proposal-actions'

const STATUS_LABEL: Record<string, string> = {
  rascunho: 'Rascunho',
  enviada: 'Enviada',
  aprovada: 'Aprovada',
  paga: 'Paga',
  em_desenvolvimento: 'Em desenvolvimento',
  pronto_revisao: 'Pronto para revisão',
  publicado: 'Publicado',
}

const STATUS_COLOR: Record<string, string> = {
  rascunho: 'bg-gray-100 text-gray-600',
  enviada: 'bg-blue-100 text-blue-700',
  aprovada: 'bg-green-100 text-green-700',
  paga: 'bg-emerald-100 text-emerald-700',
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
  createdAt: Date
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
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle')

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
    </div>
  )
}
