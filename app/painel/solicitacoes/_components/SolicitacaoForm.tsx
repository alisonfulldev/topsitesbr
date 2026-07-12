'use client'

import { useState, useRef, useTransition } from 'react'
import Link from 'next/link'
import { createTicket } from '../actions'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { EmptyState } from '@/components/ui/empty-state'

// ── Static price table (mirrors the DB seed) ─────────────────────────────────
const AVULSA_PRICE: Record<string, number> = {
  texto: 20,
  imagem: 40,
  texto_e_imagem: 60,
  nova_secao: 40,
  nova_pagina: 70,
}

type PlanInfo = {
  name: string
  allowedChangeTypes: string
  monthlyChangesIncluded: number
  changeDeadlineDays: number
  discountPercent: number
  prioritySupport: boolean
}

type SiteOption = {
  id: string
  siteUrl: string | null
  siteType: string
}

function priceAfterDiscount(base: number, discountPercent: number): string {
  const final = base * (1 - discountPercent / 100)
  return `R$${final.toFixed(2).replace('.', ',')}`
}

type OptionConfig = {
  changeType: string
  label: string
  group: 'correcao' | 'alteracao' | 'fixo'
  included: boolean
  avulsaBase: number | null
  badge: string
}

function buildOptions(plan: PlanInfo, monthlyUsed: number): OptionConfig[] {
  const allowed = plan.allowedChangeTypes.split(',').filter(Boolean)
  const limitReached = monthlyUsed >= plan.monthlyChangesIncluded
  const basicPlan = plan.monthlyChangesIncluded === 0

  function alteracaoStatus(type: string): { included: boolean; badge: string } {
    const typeAllowed = allowed.includes(type)
    const isIncluded = !basicPlan && typeAllowed && !limitReached
    const base = AVULSA_PRICE[type] ?? 0
    const badge = isIncluded
      ? `inclusa no plano · prazo ${plan.changeDeadlineDays}d`
      : `R$${priceAfterDiscount(base, plan.discountPercent).replace('R$', '')} · avulsa`
    return { included: isIncluded, badge }
  }

  const textoStatus = alteracaoStatus('texto')
  const imagemStatus = alteracaoStatus('imagem')
  const combinadaStatus = alteracaoStatus('texto_e_imagem')

  return [
    {
      changeType: 'correcao',
      label: 'Correção no site',
      group: 'correcao',
      included: true,
      avulsaBase: null,
      badge: `grátis, sem limite · prazo ${plan.changeDeadlineDays}d`,
    },
    {
      changeType: 'texto',
      label: 'Alteração de Texto',
      group: 'alteracao',
      ...textoStatus,
      avulsaBase: textoStatus.included ? null : AVULSA_PRICE.texto,
    },
    {
      changeType: 'imagem',
      label: 'Alteração de Imagem',
      group: 'alteracao',
      ...imagemStatus,
      avulsaBase: imagemStatus.included ? null : AVULSA_PRICE.imagem,
    },
    {
      changeType: 'texto_e_imagem',
      label: 'Alteração de Texto e Imagem',
      group: 'alteracao',
      ...combinadaStatus,
      avulsaBase: combinadaStatus.included ? null : AVULSA_PRICE.texto_e_imagem,
    },
    {
      changeType: 'nova_secao',
      label: 'Nova Seção',
      group: 'fixo',
      included: false,
      avulsaBase: AVULSA_PRICE.nova_secao,
      badge: `${priceAfterDiscount(AVULSA_PRICE.nova_secao, plan.discountPercent)} · sempre cobrado à parte`,
    },
    {
      changeType: 'nova_pagina',
      label: 'Nova Página',
      group: 'fixo',
      included: false,
      avulsaBase: AVULSA_PRICE.nova_pagina,
      badge: `${priceAfterDiscount(AVULSA_PRICE.nova_pagina, plan.discountPercent)} · sempre cobrado à parte`,
    },
  ]
}

const GROUP_LABEL: Record<string, string> = {
  correcao: 'Correção',
  alteracao: 'Alteração de Conteúdo',
  fixo: 'Serviços Adicionais (sempre cobrados à parte)',
}

// ── Upsell hint ───────────────────────────────────────────────────────────────
// Returns the upgrade suggestion when the selected alteration is avulsa.
// nova_secao/nova_pagina are always paid regardless of plan — no upsell hint.
type UpsellHint = { avulsaLabel: string; upgradeName: string; upgradePrice: string }

function getUpsellHint(
  type: string | null,
  opt: OptionConfig | undefined,
  plan: PlanInfo,
): UpsellHint | null {
  if (!type || !opt || opt.included || !opt.avulsaBase) return null
  if (!['texto', 'imagem', 'texto_e_imagem'].includes(type)) return null

  const avulsaFinal = opt.avulsaBase * (1 - plan.discountPercent / 100)
  const avulsaLabel = `R$${avulsaFinal % 1 === 0 ? avulsaFinal.toFixed(0) : avulsaFinal.toFixed(2).replace('.', ',')}`

  const basicoPlan = plan.monthlyChangesIncluded === 0
  const plusPlan = plan.monthlyChangesIncluded === 1

  if (basicoPlan) {
    if (type === 'texto_e_imagem') {
      return { avulsaLabel, upgradeName: 'Pro', upgradePrice: 'R$55/mês' }
    }
    return { avulsaLabel, upgradeName: 'Plus', upgradePrice: 'R$29/mês' }
  }

  if (plusPlan) {
    return { avulsaLabel, upgradeName: 'Pro', upgradePrice: 'R$55/mês' }
  }

  return null
}

export function SolicitacaoForm({
  sites,
  plan,
  monthlyUsed,
}: {
  sites: SiteOption[]
  plan: PlanInfo
  monthlyUsed: number
}) {
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [textContent, setTextContent] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [siteId, setSiteId] = useState(sites[0]?.id ?? '')
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const fileRef = useRef<HTMLInputElement>(null)

  const options = buildOptions(plan, monthlyUsed)
  const groups = ['correcao', 'alteracao', 'fixo'] as const

  const selectedOption = options.find((o) => o.changeType === selectedType)
  const upsellHint = getUpsellHint(selectedType, selectedOption, plan)

  const needsText =
    selectedType !== null &&
    ['correcao', 'texto', 'texto_e_imagem', 'nova_secao', 'nova_pagina'].includes(selectedType)
  const needsImage =
    selectedType !== null && ['imagem', 'texto_e_imagem'].includes(selectedType)
  const imageOptional =
    selectedType !== null && ['nova_secao', 'nova_pagina'].includes(selectedType)

  function handleTypeChange(type: string) {
    setSelectedType(type)
    setError(null)
    setTextContent('')
    setImageFile(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedType) {
      setError('Selecione o tipo de solicitação.')
      return
    }
    if (!siteId) {
      setError('Selecione o site.')
      return
    }

    setError(null)
    const fd = new FormData()
    fd.set('changeType', selectedType)
    fd.set('siteId', siteId)
    fd.set('textContent', textContent)
    if (imageFile) fd.set('image', imageFile)

    startTransition(async () => {
      const result = await createTicket(fd)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccessMsg(result.message ?? 'Solicitação enviada com sucesso!')
        setSelectedType(null)
        setTextContent('')
        setImageFile(null)
        if (fileRef.current) fileRef.current.value = ''
      }
    })
  }

  if (sites.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200">
        <EmptyState title="Nenhum site encontrado. Entre em contato com o suporte." />
      </div>
    )
  }

  if (successMsg) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
        <div className="text-2xl mb-3">✅</div>
        <h3 className="text-base font-semibold text-green-800 mb-2">Solicitação enviada!</h3>
        <p className="text-sm text-green-700 max-w-sm mx-auto">{successMsg}</p>
        <button
          onClick={() => setSuccessMsg(null)}
          className="mt-5 text-sm text-brand-text hover:underline"
        >
          Fazer nova solicitação
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Site selector */}
      {sites.length > 1 && (
        <Select label="Site" value={siteId} onChange={(e) => setSiteId(e.target.value)}>
          {sites.map((s) => (
            <option key={s.id} value={s.id}>
              {s.siteUrl ?? s.siteType}
            </option>
          ))}
        </Select>
      )}

      {/* Monthly usage banner */}
      {plan.monthlyChangesIncluded > 0 && (
        <div className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
          Alterações incluídas este mês:{' '}
          <strong
            className={monthlyUsed >= plan.monthlyChangesIncluded ? 'text-red-600' : 'text-gray-900'}
          >
            {monthlyUsed}/{plan.monthlyChangesIncluded} usada{monthlyUsed !== 1 ? 's' : ''}
          </strong>
        </div>
      )}

      {/* Type selection */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-3">Tipo de solicitação</p>
        <div className="space-y-4">
          {groups.map((group) => {
            const groupOptions = options.filter((o) => o.group === group)
            return (
              <div key={group}>
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                  {GROUP_LABEL[group]}
                </p>
                <div className="space-y-1.5">
                  {groupOptions.map((opt) => (
                    <label
                      key={opt.changeType}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors min-h-[44px] ${
                        selectedType === opt.changeType
                          ? 'border-brand-200 bg-brand-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="changeType"
                        value={opt.changeType}
                        checked={selectedType === opt.changeType}
                        onChange={() => handleTypeChange(opt.changeType)}
                        className="mt-0.5 accent-brand"
                      />
                      <span className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-gray-900">{opt.label}</span>
                        <span
                          className={`ml-2 text-xs px-1.5 py-0.5 rounded font-medium ${
                            opt.included
                              ? 'bg-green-100 text-green-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {opt.badge}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Conditional fields */}
      {selectedType && (
        <div className="space-y-4 border-t border-gray-100 pt-5">
          {needsText && (
            <Textarea
              label={
                selectedType === 'correcao'
                  ? 'Descreva o que precisa ser corrigido'
                  : selectedType === 'nova_secao' || selectedType === 'nova_pagina'
                    ? 'Descreva o conteúdo desejado'
                    : 'Novo conteúdo de texto'
              }
              required
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              rows={4}
              placeholder={
                selectedType === 'correcao'
                  ? 'Ex: o telefone de contato está errado, o link do WhatsApp está quebrado...'
                  : selectedType === 'nova_secao'
                    ? 'Descreva o conteúdo da nova seção: título, texto, imagens que serão incluídas...'
                    : selectedType === 'nova_pagina'
                      ? 'Descreva o conteúdo da nova página: objetivo, texto, seções...'
                      : 'Cole aqui o texto exato que deve aparecer no site...'
              }
            />
          )}

          {(needsImage || imageOptional) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Imagem
                {needsImage && !imageOptional && <span className="text-red-500 ml-0.5">*</span>}
                {imageOptional && <span className="text-gray-400 text-xs ml-1">(opcional)</span>}
              </label>
              <input
                type="file"
                accept="image/*"
                ref={fileRef}
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-brand-50 file:text-brand-text file:font-medium hover:file:bg-brand-100"
              />
              {imageFile && (
                <p className="text-xs text-gray-500 mt-1">
                  Selecionado: {imageFile.name} ({(imageFile.size / 1024).toFixed(0)} KB)
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Upsell comparison hint — presente mas não agressivo, não bloqueia o fluxo */}
      {upsellHint && (
        <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <span className="text-gray-600">
            Esta alteração avulsa:{' '}
            <strong className="text-gray-900">{upsellHint.avulsaLabel}</strong>
          </span>
          <span className="text-gray-300 hidden sm:inline">·</span>
          <span className="text-gray-600">
            No plano{' '}
            <strong className="text-gray-900">
              {upsellHint.upgradeName} ({upsellHint.upgradePrice})
            </strong>
            : inclusa
          </span>
          <Link
            href="/painel/assinatura"
            className="text-xs text-brand-text hover:underline font-medium sm:ml-auto"
          >
            Trocar de plano →
          </Link>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
          {error}
        </p>
      )}

      {/* Ação primária neutra (enviar form ≠ conversão comercial) */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={isPending}
        disabled={!selectedType}
      >
        Enviar solicitação
      </Button>
    </form>
  )
}
