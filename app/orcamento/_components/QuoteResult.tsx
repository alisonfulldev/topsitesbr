'use client'

import { useState, useEffect } from 'react'
import { buildWAMessage, siteBase, calcTotal, fmtBRL, monthlyPrice } from '../utils'
import type { ProjectType } from '../actions'

function IconChevron() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

function IconWA() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className="relative shrink-0 w-9 h-[20px] rounded-full transition-all duration-300"
      style={{
        background: value ? '#facc15' : 'transparent',
        border: value ? '1px solid #facc15' : '1px solid rgba(255,255,255,0.15)',
      }}
    >
      <span
        className="absolute top-[2px] w-3.5 h-3.5 rounded-full transition-all duration-300"
        style={{
          left: value ? '18px' : '2px',
          background: value ? '#000' : 'rgba(255,255,255,0.25)',
        }}
      />
    </button>
  )
}

export default function QuoteResult({
  initial,
  name,
  segment,
  shareLink,
}: {
  initial: { projectType: ProjectType; pageCount: number; hasAdmin: boolean; hasLogo: boolean; hasDomain: boolean; hasHosting: boolean }
  name: string
  segment: string
  shareLink?: string
}) {
  const [type, setType] = useState<ProjectType>(initial.projectType)
  const [pages, setPages] = useState(initial.pageCount)
  const [hasAdmin, setHasAdmin] = useState(initial.hasAdmin)
  const [hasLogo, setHasLogo] = useState(initial.hasLogo)
  const [hasDomain, setHasDomain] = useState(initial.hasDomain)
  const [copied, setCopied] = useState(false)
  const [showIntro, setShowIntro] = useState(false)
  const hasHosting = initial.hasHosting

  useEffect(() => {
    if (!localStorage.getItem('quote_result_intro_seen')) {
      setShowIntro(true)
    }
  }, [])

  function dismissIntro() {
    localStorage.setItem('quote_result_intro_seen', '1')
    setShowIntro(false)
  }

  const total = calcTotal(type, pages, hasAdmin, hasLogo, hasDomain)
  const half = Math.ceil(total / 2)
  const WA_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5511999999999').replace(/\D/g, '')

  function handleApprove() {
    const msg = buildWAMessage({
      projectType: type,
      pageCount: type === 'institucional' ? pages : null,
      hasAdmin, hasLogo, hasDomain, totalValue: total,
    })
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer')
  }

  function handleCopy() {
    if (!shareLink) return
    navigator.clipboard.writeText(shareLink).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const typeLabels: Record<ProjectType, string> = {
    landing_page: 'Landing Page',
    institucional: 'Institucional',
    loja_virtual: 'Loja Virtual',
  }

  const base = siteBase(type, pages)

  const addons = [
    {
      label: 'Painel admin / backend',
      tip: type === 'loja_virtual' ? 'Incluso no valor da loja virtual.' : 'Dobra o investimento — área para gerenciar conteúdo.',
      price: type === 'loja_virtual' ? 0 : base,
      value: type === 'loja_virtual' ? true : hasAdmin,
      onChange: type === 'loja_virtual' ? () => {} : setHasAdmin,
      disabled: type === 'loja_virtual',
    },
    {
      label: 'Criação de logotipo',
      tip: 'Identidade visual completa (logo + paleta).',
      price: 220,
      value: !hasLogo,
      onChange: (v: boolean) => setHasLogo(!v),
    },
    {
      label: 'Domínio + configuração DNS',
      tip: 'Registro e configuração do .com.br.',
      price: 140,
      value: !hasDomain,
      onChange: (v: boolean) => setHasDomain(!v),
    },
  ]

  return (
    <div className="space-y-4">

      {/* Popup de boas-vindas — só na primeira vez */}
      {showIntro && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(6px)' }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 space-y-4"
            style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
              style={{ background: 'rgba(250,204,21,0.12)', border: '1px solid rgba(250,204,21,0.2)' }}
            >
              🎛️
            </div>
            <div>
              <h3 className="text-white font-bold text-[18px] leading-snug mb-2">
                Seu orçamento é flexível!
              </h3>
              <p className="text-[14px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
                O valor calculado inclui tudo que você respondeu — mas você pode{' '}
                <span className="text-white font-semibold">ativar ou desativar cada item</span>{' '}
                para ajustar o total ao que faz sentido pra você.
              </p>
            </div>
            <div
              className="rounded-xl p-3.5"
              style={{ background: 'rgba(250,204,21,0.06)', border: '1px solid rgba(250,204,21,0.15)' }}
            >
              <p className="text-[13px]" style={{ color: 'rgba(250,204,21,0.9)' }}>
                💡 Exemplo: se não precisar de painel admin, basta desativá-lo e o valor cai na hora.
              </p>
            </div>
            <button
              type="button"
              onClick={dismissIntro}
              className="w-full py-3.5 rounded-xl text-[15px] font-bold transition-all duration-200 active:scale-[0.98]"
              style={{ background: '#facc15', color: '#000' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#fde047' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#facc15' }}
            >
              Ver meu orçamento →
            </button>
          </div>
        </div>
      )}

      {shareLink && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: 'rgba(250,204,21,0.06)', border: '1px solid rgba(250,204,21,0.15)' }}
        >
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-medium mb-0.5" style={{ color: 'rgba(250,204,21,0.7)' }}>Link do orçamento</p>
            <p className="text-[12px] truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>{shareLink}</p>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="shrink-0 text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-all duration-200"
            style={{
              background: copied ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.08)',
              color: copied ? 'rgb(52,211,153)' : 'rgba(255,255,255,0.7)',
              border: copied ? '1px solid rgba(52,211,153,0.3)' : '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {copied ? '✓ Copiado' : 'Copiar'}
          </button>
        </div>
      )}

      {/* Total card */}
      <div
        className="relative py-10 text-center rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden
          style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(250,204,21,0.06) 0%, transparent 70%)' }}
        />
        <p className="relative text-[10px] font-medium tracking-[0.16em] uppercase mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Investimento total
        </p>
        <p className="relative text-[58px] sm:text-[68px] font-black text-white leading-none tabular-nums">
          {fmtBRL(total)}
        </p>
        <div className="relative mt-4 flex flex-col items-center gap-2">
          <div
            className="inline-flex items-center gap-1 rounded-full px-4 py-1.5"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
              2×{' '}
              <span className="text-white font-medium">{fmtBRL(half)}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)' }} className="mx-1">·</span>
              <span className="text-white font-medium">{fmtBRL(total - half)}</span>
              <span style={{ color: 'rgba(255,255,255,0.4)' }}> no mês seguinte</span>
            </p>
          </div>
          <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
            parcelamento em até 2× no cartão, sem juros
          </p>
        </div>
      </div>

      {/* Hospedagem mensal */}
      {hasHosting && (
        <div
          className="flex items-center justify-between px-5 py-4 rounded-xl"
          style={{ background: 'rgba(250,204,21,0.06)', border: '1px solid rgba(250,204,21,0.2)' }}
        >
          <div>
            <p className="text-[13px] font-semibold text-white">Manutenção + Hospedagem</p>
            <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>SSL · monitoramento · suporte · cancele quando quiser</p>
          </div>
          <span className="text-[15px] font-bold tabular-nums" style={{ color: '#facc15' }}>
            R${monthlyPrice(hasAdmin, type)}/mês
          </span>
        </div>
      )}

      {/* Tipo */}
      <div
        className="rounded-xl p-4"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <p className="text-[10px] font-medium tracking-[0.12em] uppercase mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Tipo de projeto
        </p>
        <div
          className="flex gap-0.5 rounded-lg p-1"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {(['landing_page', 'institucional', 'loja_virtual'] as ProjectType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { setType(t); if (t !== 'institucional') setPages(1); else setPages((p) => Math.max(4, p)) }}
              className="flex-1 py-2 text-[11px] font-medium rounded-md transition-all duration-200"
              style={{
                background: type === t ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: type === t ? '#ffffff' : 'rgba(255,255,255,0.35)',
                border: type === t ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
              }}
            >
              {typeLabels[t]}
            </button>
          ))}
        </div>

        {type === 'institucional' && (
          <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-[11px] mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Número de páginas
              <span style={{ color: 'rgba(255,255,255,0.2)' }} className="ml-1.5">· 4 incluídas, a partir da 5ª: +R$100 cada</span>
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPages((p) => Math.max(4, p - 1))}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-lg leading-none transition-all duration-200"
                style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}
                aria-label="Reduzir"
              >
                −
              </button>
              <span className="text-2xl font-bold text-white w-7 text-center tabular-nums">{pages}</span>
              <button
                type="button"
                onClick={() => setPages((p) => p + 1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-lg leading-none transition-all duration-200"
                style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}
                aria-label="Adicionar"
              >
                +
              </button>
              <span className="text-[13px] tabular-nums ml-1" style={{ color: '#facc15' }}>
                = {fmtBRL(base)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Adicionais */}
      <div
        className="rounded-xl px-4"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="pt-4 pb-3 flex items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-medium tracking-[0.12em] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Personalize seu orçamento
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.2)' }}>
              Ative ou desative para ajustar o valor
            </p>
          </div>
          <span
            className="text-[10px] font-semibold px-2 py-1 rounded-full shrink-0"
            style={{ background: 'rgba(250,204,21,0.08)', color: 'rgba(250,204,21,0.6)', border: '1px solid rgba(250,204,21,0.12)' }}
          >
            editável
          </span>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {addons.map(({ label, tip, price, value, onChange, disabled }) => (
            <div
              key={label}
              className="flex items-center gap-3.5 py-4"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', opacity: disabled ? 0.5 : 1 }}
            >
              <Toggle value={value} onChange={disabled ? () => {} : onChange} />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] transition-colors" style={{ color: value ? '#ffffff' : 'rgba(255,255,255,0.35)' }}>
                  {label}
                </p>
                <p className="text-[12px] mt-0.5" style={{ color: 'rgba(255,255,255,0.2)' }}>{tip}</p>
              </div>
              <span
                className="text-[13px] font-semibold tabular-nums shrink-0 transition-colors"
                style={{ color: disabled ? 'rgba(255,255,255,0.3)' : value ? '#facc15' : 'rgba(255,255,255,0.15)' }}
              >
                {disabled ? 'incluso' : `+${fmtBRL(price)}`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Resumo */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="w-px self-stretch rounded-full shrink-0" style={{ background: 'rgba(255,255,255,0.1)' }} />
        <div className="space-y-0.5 text-[13px]">
          <p>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>Nome — </span>
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>{name}</span>
          </p>
          <p>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>Segmento — </span>
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>{segment}</span>
          </p>
        </div>
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={handleApprove}
        className="w-full py-4 rounded-xl text-[15px] font-semibold transition-all duration-200 active:scale-[0.99]"
        style={{ background: '#facc15', color: '#000' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#fde047'
          e.currentTarget.style.boxShadow = '0 0 40px rgba(250,204,21,0.3)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#facc15'
          e.currentTarget.style.boxShadow = ''
        }}
      >
        <span className="flex items-center justify-center gap-2.5">
          <IconWA />
          Aprovar orçamento no WhatsApp
          <IconChevron />
        </span>
      </button>

      <p className="text-center text-[12px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
        Você será redirecionado ao WhatsApp com o resumo final ajustado.
      </p>
    </div>
  )
}
