'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { sendDiscountAction } from '../actions'

interface Props {
  leadId: string
  name: string
  totalValue: number
  discountType: string | null
  discountValue: number | null
  discountedTotal: number | null
  discountSentAt: string | null
  discountExpiresAt: string | null
}

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function DiscountButton(props: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'fixed' | 'percent'>('fixed')
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'form' | 'confirm_resend'>('form')

  const [sentState, setSentState] = useState({
    discountType: props.discountType,
    discountValue: props.discountValue,
    discountedTotal: props.discountedTotal,
    discountSentAt: props.discountSentAt,
    discountExpiresAt: props.discountExpiresAt,
  })

  const numVal = parseFloat(inputValue.replace(',', '.')) || 0
  const discountAmount = mode === 'fixed' ? numVal : props.totalValue * numVal / 100
  const finalValue = Math.max(0, props.totalValue - discountAmount)
  const savingsPct = props.totalValue > 0 ? Math.round(discountAmount / props.totalValue * 100) : 0
  const isValid = numVal > 0 && finalValue > 0 &&
    (mode === 'fixed' ? numVal < props.totalValue : numVal < 100)

  const alreadySent = !!sentState.discountSentAt
  const isExpired = sentState.discountExpiresAt
    ? new Date(sentState.discountExpiresAt) < new Date()
    : false

  // Cores para o status inline (fundo claro do admin)
  const sentBg    = isExpired ? 'rgba(243,244,246,1)' : 'rgba(220,252,231,1)'
  const sentColor = isExpired ? '#6b7280' : '#15803d'
  const sentBorder= isExpired ? '1px solid #e5e7eb' : '1px solid #bbf7d0'

  function openModal() {
    setStep('form')
    setError(null)
    setInputValue('')
    setOpen(true)
  }

  function close() {
    setOpen(false)
    setStep('form')
    setError(null)
  }

  async function handleSubmit(force = false) {
    if (!isValid) return
    setLoading(true)
    setError(null)
    const res = await sendDiscountAction({
      leadId: props.leadId,
      discountType: mode,
      discountValue: numVal,
      force,
    })
    setLoading(false)

    if (res.ok) {
      setSentState({
        discountType: mode,
        discountValue: numVal,
        discountedTotal: finalValue,
        discountSentAt: new Date().toISOString(),
        discountExpiresAt: res.expiresAt ?? null,
      })
      close()
      router.refresh()
    } else if (res.alreadySent && !force) {
      setStep('confirm_resend')
    } else {
      setError(res.error ?? 'Erro ao enviar. Tente novamente.')
    }
  }

  const firstName = props.name.split(' ')[0]

  return (
    <>
      {/* Status badge or button */}
      {alreadySent ? (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
              style={{ background: sentBg, color: sentColor, border: sentBorder }}
            >
              {isExpired ? 'Expirado' : '✓ Enviado'}
            </span>
            {sentState.discountedTotal != null && (
              <span className="text-[11px] text-gray-600 font-semibold">
                {fmtBRL(sentState.discountedTotal)}
              </span>
            )}
          </div>
          {sentState.discountExpiresAt && (
            <p className="text-[10px] text-gray-400">
              {isExpired ? 'Expirou' : 'Válido até'} {fmtDate(sentState.discountExpiresAt)}
            </p>
          )}
          <button
            type="button"
            onClick={openModal}
            className="text-[11px] text-gray-400 hover:text-gray-700 transition-colors underline underline-offset-2"
          >
            Reenviar
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={openModal}
          className="text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 whitespace-nowrap bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
        >
          Enviar desconto
        </button>
      )}

      {/* Modal overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) close() }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 space-y-5"
            style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {step === 'confirm_resend' ? (
              /* ── Confirmação de reenvio ── */
              <>
                <div>
                  <h3 className="text-white font-bold text-[16px]">Reenviar desconto?</h3>
                  <p className="text-[13px] text-gray-400 mt-1">
                    Já foi enviado um desconto para <strong className="text-gray-200">{firstName}</strong> em{' '}
                    {sentState.discountSentAt ? fmtDate(sentState.discountSentAt) : '—'}.
                    Deseja enviar novamente com um novo prazo de 48h?
                  </p>
                </div>
                {error && (
                  <p className="text-[13px] px-3 py-2 rounded-lg" style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
                    {error}
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={close}
                    className="flex-1 py-2.5 rounded-xl text-[13px] font-medium transition-all"
                    style={{ background: 'rgba(255,255,255,0.06)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubmit(true)}
                    disabled={loading}
                    className="flex-1 py-2.5 rounded-xl text-[13px] font-bold transition-all disabled:opacity-40"
                    style={{ background: '#facc15', color: '#000' }}
                  >
                    {loading ? 'Enviando…' : 'Sim, reenviar'}
                  </button>
                </div>
              </>
            ) : (
              /* ── Formulário de desconto ── */
              <>
                <div>
                  <h3 className="text-white font-bold text-[16px]">Enviar desconto</h3>
                  <p className="text-[13px] text-gray-400 mt-0.5">
                    Lead: <span className="text-gray-200">{props.name}</span>
                  </p>
                </div>

                {/* Tipo */}
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-2">Tipo de desconto</p>
                  <div
                    className="flex gap-0.5 rounded-lg p-1"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    {(['fixed', 'percent'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => { setMode(m); setInputValue('') }}
                        className="flex-1 py-2 text-[12px] font-medium rounded-md transition-all duration-200"
                        style={{
                          background: mode === m ? 'rgba(255,255,255,0.1)' : 'transparent',
                          color: mode === m ? '#fff' : 'rgba(255,255,255,0.35)',
                          border: mode === m ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
                        }}
                      >
                        {m === 'fixed' ? 'Valor fixo (R$)' : 'Percentual (%)'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input */}
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-2">
                    {mode === 'fixed' ? 'Valor do desconto (R$)' : 'Percentual de desconto (%)'}
                  </p>
                  <div className="relative">
                    <span
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] font-semibold"
                      style={{ color: 'rgba(255,255,255,0.35)' }}
                    >
                      {mode === 'fixed' ? 'R$' : '%'}
                    </span>
                    <input
                      type="number"
                      min="1"
                      max={mode === 'fixed' ? props.totalValue - 1 : 99}
                      step="1"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={mode === 'fixed' ? '300' : '20'}
                      className="w-full rounded-xl px-4 py-3 text-white text-[15px] font-semibold focus:outline-none"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        paddingLeft: mode === 'fixed' ? '2.5rem' : '2rem',
                        caretColor: '#facc15',
                      }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(250,204,21,0.4)' }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
                    />
                  </div>
                </div>

                {/* Preview */}
                {numVal > 0 && (
                  <div
                    className="rounded-xl p-4 space-y-2"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-3">Resumo</p>
                    <div className="flex justify-between text-[13px]">
                      <span className="text-gray-400">Valor original</span>
                      <span className="text-gray-300">{fmtBRL(props.totalValue)}</span>
                    </div>
                    <div className="flex justify-between text-[13px]">
                      <span className="text-gray-400">Desconto</span>
                      <span style={{ color: '#f87171' }}>
                        − {fmtBRL(discountAmount)}
                        {mode === 'percent' && ` (${numVal}%)`}
                      </span>
                    </div>
                    <div
                      className="flex justify-between pt-2"
                      style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
                    >
                      <span className="text-[13px] font-semibold text-white">Valor final</span>
                      <span className="text-[15px] font-bold" style={{ color: '#facc15' }}>
                        {fmtBRL(finalValue)}
                      </span>
                    </div>
                    {isValid && (
                      <div
                        className="flex items-center justify-between px-3 py-2 rounded-lg mt-1"
                        style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)' }}
                      >
                        <span className="text-[11px]" style={{ color: '#34d399' }}>
                          Economia de {fmtBRL(discountAmount)} ({savingsPct}%)
                        </span>
                        <span className="text-[11px] text-gray-500">válido por 48h</span>
                      </div>
                    )}
                    {!isValid && numVal > 0 && (
                      <p className="text-[11px]" style={{ color: '#f87171' }}>
                        {mode === 'fixed' && numVal >= props.totalValue
                          ? 'O desconto não pode ser igual ou maior que o valor total.'
                          : 'Percentual deve ser entre 1% e 99%.'}
                      </p>
                    )}
                  </div>
                )}

                {error && (
                  <p
                    className="text-[13px] px-3 py-2 rounded-lg"
                    style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}
                  >
                    {error}
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={close}
                    className="flex-1 py-2.5 rounded-xl text-[13px] font-medium transition-all"
                    style={{ background: 'rgba(255,255,255,0.06)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubmit(false)}
                    disabled={!isValid || loading}
                    className="flex-1 py-2.5 rounded-xl text-[13px] font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ background: '#facc15', color: '#000' }}
                  >
                    {loading ? 'Enviando…' : 'Enviar por e-mail'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
