'use client'

import { useState } from 'react'
import Image from 'next/image'
import { initiateCheckoutAction } from '../actions'
import { formatCpf, validateCpf } from '@/lib/cpf'

const CONTRACT_VERSION = '2026-07'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function contractClauses(clientName: string, value: number): string[] {
  const price = value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
  return [
    `1. Partes: TOP SITE, CNPJ 22.556.759/0001-98 (Contratada) e ${clientName} (Contratante).`,
    `2. Objeto: desenvolvimento de um site conforme o escopo da proposta aprovada e do briefing acordado.`,
    `3. Valor e pagamento: o valor refere-se EXCLUSIVAMENTE ao desenvolvimento (criação) do site, no valor de R$ ${price}. Pagamento único via Asaas; a confirmação inicia a produção.`,
    `4. O que está incluído: os itens listados como inclusos na proposta.`,
    `5. Revisão: 1 (uma) rodada de ajustes dentro do escopo do briefing; alterações fora do escopo são orçadas à parte.`,
    `6. Prazo de entrega: o site será entregue em até 7 (sete) dias úteis, contados a partir da confirmação do pagamento e do envio, pelo Contratante, de todo o conteúdo necessário para a produção.`,
    `7. Propriedade: os arquivos do site pertencem ao Contratante, que pode recebê-los mediante solicitação.`,
    `8. Responsabilidades do Contratante: veracidade e legalidade do conteúdo, e titularidade/licença de textos e imagens enviados.`,
    `9. Serviços não incluídos: publicação, hospedagem, SSL, monitoramento, manutenção, correções e alterações posteriores à entrega, e registro de domínio próprio. Tais serviços podem ser contratados separadamente.`,
    `10. Direito de arrependimento: por se tratar de contratação fora de estabelecimento físico, o Contratante poderá desistir em até 7 dias corridos, desde que a produção não tenha sido iniciada. Uma vez iniciada, por ser serviço personalizado e sob encomenda, o valor correspondente ao desenvolvimento já realizado não será restituído.`,
    `11. Aceite: ao marcar a caixa e confirmar, o Contratante declara ter lido e concordado, manifestando vontade eletrônica com validade jurídica nos termos da legislação brasileira. Versão do contrato: ${CONTRACT_VERSION}.`,
  ]
}

// ── Step indicator ────────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 justify-center mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300
              ${i + 1 === current ? 'bg-yellow-400 text-black' : i + 1 < current ? 'bg-yellow-400/30 text-yellow-400' : 'bg-white/5 text-zinc-600'}`}
          >
            {i + 1 < current ? '✓' : i + 1}
          </div>
          {i < total - 1 && (
            <div className={`h-px w-8 transition-all duration-300 ${i + 1 < current ? 'bg-yellow-400/40' : 'bg-white/10'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

// ── Step 1: Contrato ──────────────────────────────────────────────────────────

function StepContract({
  clientName,
  value,
  accepted,
  onToggle,
  onNext,
}: {
  clientName: string
  value: number
  accepted: boolean
  onToggle: () => void
  onNext: () => void
}) {
  const clauses = contractClauses(clientName, value)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-white text-xl font-black mb-1">Contrato de Prestação de Serviço</h2>
        <p className="text-zinc-400 text-sm">Leia com atenção antes de prosseguir.</p>
      </div>

      <div
        className="rounded-2xl border border-white/[0.07] p-5 max-h-72 overflow-y-auto space-y-3 text-xs text-zinc-400 leading-relaxed"
        style={{ background: '#0a0a0a' }}
      >
        <p className="text-white text-xs font-bold text-center uppercase tracking-wider mb-4">
          Contrato de Prestação de Serviço de Desenvolvimento de Site
        </p>
        {clauses.map((clause, i) => (
          <p key={i} className={i === 0 ? 'text-zinc-300' : ''}>{clause}</p>
        ))}
      </div>

      <label className="flex items-start gap-3 cursor-pointer group">
        <div
          onClick={onToggle}
          className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all cursor-pointer
            ${accepted ? 'bg-yellow-400 border-yellow-400' : 'border-white/20 group-hover:border-yellow-400/40'}`}
        >
          {accepted && (
            <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <span className="text-zinc-300 text-sm leading-relaxed">
          Li e aceito o contrato acima, incluindo todas as cláusulas e condições.
        </span>
      </label>

      <button
        onClick={onNext}
        disabled={!accepted}
        className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-black py-4 rounded-2xl text-sm
                   transition-all duration-200 hover:shadow-[0_0_25px_rgba(250,204,21,0.4)]
                   active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Continuar →
      </button>
    </div>
  )
}

// ── Step 2: Senha ─────────────────────────────────────────────────────────────

function StepPassword({
  password,
  confirm,
  onPasswordChange,
  onConfirmChange,
  onBack,
  onNext,
}: {
  password: string
  confirm: string
  onPasswordChange: (v: string) => void
  onConfirmChange: (v: string) => void
  onBack: () => void
  onNext: () => void
}) {
  const [error, setError] = useState<string | null>(null)

  function handleNext() {
    if (password.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('As senhas não coincidem.')
      return
    }
    setError(null)
    onNext()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-white text-xl font-black mb-1">Crie sua senha de acesso</h2>
        <p className="text-zinc-400 text-sm">
          Você usará esta senha para entrar no painel após o pagamento.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
            Nova senha
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder="Mínimo 8 caracteres"
            autoFocus
            autoComplete="new-password"
            className="w-full rounded-xl px-4 py-3 text-white placeholder-zinc-700 text-sm
                       focus:outline-none focus:border-yellow-400/60 focus:ring-1 focus:ring-yellow-400/20
                       transition-colors border border-white/[0.07]"
            style={{ background: '#0a0a0a' }}
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
            Confirmar senha
          </label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => onConfirmChange(e.target.value)}
            placeholder="Repita a senha"
            autoComplete="new-password"
            className="w-full rounded-xl px-4 py-3 text-white placeholder-zinc-700 text-sm
                       focus:outline-none focus:border-yellow-400/60 focus:ring-1 focus:ring-yellow-400/20
                       transition-colors border border-white/[0.07]"
            style={{ background: '#0a0a0a' }}
          />
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 border border-white/10 hover:border-white/20 text-zinc-400 font-bold py-4 rounded-2xl text-sm
                     transition-all duration-200 hover:text-white"
        >
          ← Voltar
        </button>
        <button
          onClick={handleNext}
          className="flex-[2] bg-yellow-400 hover:bg-yellow-300 text-black font-black py-4 rounded-2xl text-sm
                     transition-all duration-200 hover:shadow-[0_0_25px_rgba(250,204,21,0.4)]
                     active:scale-[0.98]"
        >
          Continuar →
        </button>
      </div>
    </div>
  )
}

// ── Step 3: CPF + Finalizar ───────────────────────────────────────────────────

function StepDocument({
  token,
  email,
  password,
  contractAccepted,
  document,
  onDocumentChange,
  onBack,
}: {
  token: string
  email: string
  password: string
  contractAccepted: boolean
  document: string
  onDocumentChange: (v: string) => void
  onBack: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    const cpfClean = document.replace(/\D/g, '')
    if (!validateCpf(cpfClean)) {
      setError('CPF inválido. Verifique o número informado.')
      return
    }
    setError(null)
    setLoading(true)
    const result = await initiateCheckoutAction(token, email, password, cpfClean, contractAccepted)
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else if (result.paymentUrl) {
      window.location.href = result.paymentUrl
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-white text-xl font-black mb-1">Informe seu CPF</h2>
        <p className="text-zinc-400 text-sm">
          Necessário para emissão da cobrança. Seus dados são protegidos e não serão compartilhados.
        </p>
      </div>

      <div>
        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
          CPF
        </label>
        <input
          type="text"
          value={document}
          onChange={(e) => onDocumentChange(formatCpf(e.target.value))}
          placeholder="000.000.000-00"
          inputMode="numeric"
          autoFocus
          maxLength={14}
          className="w-full rounded-xl px-4 py-3 text-white placeholder-zinc-700 text-sm
                     focus:outline-none focus:border-yellow-400/60 focus:ring-1 focus:ring-yellow-400/20
                     transition-colors border border-white/[0.07]"
          style={{ background: '#0a0a0a' }}
        />
      </div>

      {error && (
        <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={loading}
          className="flex-1 border border-white/10 hover:border-white/20 text-zinc-400 font-bold py-4 rounded-2xl text-sm
                     transition-all duration-200 hover:text-white disabled:opacity-40"
        >
          ← Voltar
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex-[2] bg-yellow-400 hover:bg-yellow-300 text-black font-black py-4 rounded-2xl text-sm
                     transition-all duration-200 hover:shadow-[0_0_25px_rgba(250,204,21,0.4)]
                     active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? 'Processando...' : 'Ir para pagamento →'}
        </button>
      </div>

      <p className="text-zinc-700 text-xs text-center">
        Você será redirecionado para o pagamento seguro via Asaas (Pix, cartão ou boleto).
      </p>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function CheckoutForm({
  token,
  clientName,
  value,
  email,
}: {
  token: string
  clientName: string
  value: number
  email: string
}) {
  const [step, setStep] = useState(1)
  const [contractAccepted, setContractAccepted] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [document, setDocument] = useState('')

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-12 relative overflow-hidden bg-[#0a0a0a]">
      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      {/* Yellow glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[320px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(250,204,21,0.1) 0%, transparent 70%)' }}
      />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image src="/logo.png" alt="TOP SITE" width={160} height={48} className="h-10 w-auto" priority />
        </div>

        {/* Value badge */}
        <div className="text-center mb-8">
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Contratando</p>
          <p className="text-yellow-400 text-4xl font-black">{formatCurrency(value)}</p>
          <p className="text-zinc-500 text-sm mt-1">para {clientName}</p>
        </div>

        <StepIndicator current={step} total={3} />

        {/* Card */}
        <div
          className="rounded-3xl overflow-hidden shadow-2xl border border-white/[0.06] p-6 sm:p-8"
          style={{ background: '#111111' }}
        >
          {step === 1 && (
            <StepContract
              clientName={clientName}
              value={value}
              accepted={contractAccepted}
              onToggle={() => setContractAccepted((v) => !v)}
              onNext={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <StepPassword
              password={password}
              confirm={confirm}
              onPasswordChange={setPassword}
              onConfirmChange={setConfirm}
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
            />
          )}
          {step === 3 && (
            <StepDocument
              token={token}
              email={email}
              password={password}
              contractAccepted={contractAccepted}
              document={document}
              onDocumentChange={setDocument}
              onBack={() => setStep(2)}
            />
          )}
        </div>

        <p className="text-center text-zinc-700 text-xs mt-6">
          Pagamento processado com segurança via{' '}
          <span className="text-zinc-500">Asaas</span> — Pix, cartão ou boleto
        </p>
      </div>
    </div>
  )
}
