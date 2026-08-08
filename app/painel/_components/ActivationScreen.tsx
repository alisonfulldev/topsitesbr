'use client'

import { useState, useTransition, useEffect } from 'react'
import { activatePlan, submitDownloadReason } from '../actions'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { BottomSheet } from '@/components/ui/bottom-sheet'
import { SparklesIcon, DownloadIcon } from '@/components/ui/icons'
import { COMPANY_WHATSAPP } from '@/lib/config'
import Link from 'next/link'

type Props = {
  siteId: string
  filesZipUrl: string | null
  pendingPayment?: boolean
  clientName: string
  clientEmail: string
  activationFlow: 'quente' | 'frio'
}

type RetentionStep = 'retention' | 'reason' | 'counterargument'

const PLAN_BENEFITS = [
  'Site no ar com hospedagem e SSL',
  'Correções ilimitadas e gratuitas (bugs, erros, links quebrados)',
  'Monitoramento 24h e recuperação em caso de queda do servidor',
  '1 alteração de conteúdo por mês inclusa (texto ou imagem)',
  'Prazo de atendimento de até 7 dias',
  'Suporte especializado direto pelo WhatsApp',
  'Relatório de visitas: quantas pessoas acessam, de onde vêm e páginas mais vistas',
  '10% de desconto em serviços e upgrades',
]

const WARM_BENEFITS = [
  'Site publicado e no ar com hospedagem e SSL',
  'Correções ilimitadas e gratuitas',
  'Suporte direto pelo WhatsApp',
  'Relatório de visitas mensais',
]

const REASONS = [
  { value: 'hospedagem', label: 'Já tenho uma solução de hospedagem' },
  { value: 'outro_lugar', label: 'Vou hospedar em outro lugar' },
  { value: 'nao_usar', label: 'Não vou usar o site agora' },
  { value: 'tecnico', label: 'Prefiro gerenciar o site por conta própria' },
  { value: 'outro', label: 'Outro motivo' },
]

const COUNTER_ARGUMENTS: Record<string, string> = {
  hospedagem:
    'Aqui você não precisa configurar nem pagar hospedagem à parte: já está tudo incluído e no ar em minutos. E o primeiro mês é grátis.',
  outro_lugar:
    'Isso significa contratar hospedagem, instalar SSL, apontar domínio e subir os arquivos por conta própria. Aqui já fica tudo pronto, e o primeiro mês é por nossa conta.',
  nao_usar:
    'Como o primeiro mês é gratuito, você pode deixar o site no ar e decidir depois, sem pagar nada agora.',
  tecnico:
    'Você continua no controle e pode receber os arquivos quando quiser. Mas deixando conosco, a gente cuida de toda a parte técnica — e o primeiro mês é grátis.',
  outro:
    'Entendemos! Lembrando que o primeiro mês é totalmente grátis, sem contrato e sem compromisso. Não há nada a perder por ativar agora — você pode cancelar quando quiser.',
}

// ─── Regularization screen (inadimplente / vencido) ─────────────────────────

export function RegularizationScreen({
  siteStatus,
  pendingPayment,
}: {
  siteStatus: string
  pendingPayment?: boolean
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const isSuspended = siteStatus === 'suspenso' || siteStatus === 'offline'

  function handleRegularize() {
    setError(null)
    startTransition(async () => {
      const result = await activatePlan()
      if (result.error) {
        setError(result.error)
        return
      }
      if (result.paymentUrl) window.location.href = result.paymentUrl
    })
  }

  const waNumber = COMPANY_WHATSAPP.replace(/\D/g, '')
  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent('Olá! Preciso de ajuda para regularizar meu plano.')}`

  return (
    <div className="bg-brand-dark rounded-2xl overflow-hidden">
      {/* Hero */}
      <div className="text-center px-6 pt-10 pb-6">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl bg-red-500/15 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2 leading-tight">
          Sua mensalidade está em aberto
        </h1>
        <p className="text-gray-400 text-sm max-w-xs mx-auto leading-relaxed">
          {isSuspended
            ? 'Seu site foi temporariamente despublicado. Regularize o pagamento e ele volta ao ar assim que a confirmação for processada.'
            : 'Há um pagamento pendente no seu plano. Regularize para manter seu site no ar sem interrupções.'}
        </p>
      </div>

      {/* Card */}
      <div className="mx-4 mb-6 bg-white rounded-xl p-5">
        {isSuspended && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-5">
            <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            <p className="text-sm text-red-700 leading-snug">
              Site fora do ar — volta automaticamente após confirmação do pagamento.
            </p>
          </div>
        )}

        <ul className="space-y-2.5 mb-5">
          {[
            'Pagamento via Pix, boleto ou cartão',
            'Site volta ao ar em minutos após confirmação',
            'Sem taxa de reativação',
            'Sem perda de configurações ou conteúdo',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
              <svg className="w-4 h-4 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              {item}
            </li>
          ))}
        </ul>

        {pendingPayment && (
          <p className="text-yellow-700 text-xs bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 mb-3">
            Já existe uma cobrança gerada. Clique abaixo para acessar o boleto ou PIX novamente.
          </p>
        )}

        {error && (
          <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
            {error}
          </p>
        )}

        <Button
          variant="conversion"
          size="md"
          fullWidth
          onClick={handleRegularize}
          loading={isPending}
          loadingText="Processando..."
        >
          {pendingPayment ? 'Ver boleto / PIX' : 'Regularizar pagamento'}
        </Button>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-gray-500 pb-6 px-4">
        Dúvidas?{' '}
        <a href={waUrl} target="_blank" rel="noreferrer" className="text-gray-400 underline underline-offset-2">
          Fale conosco no WhatsApp
        </a>
      </p>
    </div>
  )
}

// ─── Warm flow (quente) ──────────────────────────────────────────────────────

function WarmActivationScreen({ pendingPayment }: { pendingPayment?: boolean }) {
  const [error, setError] = useState<string | null>(null)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleActivate() {
    if (!termsAccepted) {
      setError('Você precisa aceitar os Termos de Uso para continuar.')
      return
    }
    setError(null)
    startTransition(async () => {
      const result = await activatePlan({ termsAccepted: true })
      if (result.error) {
        setError(result.error)
      } else if (result.paymentUrl) {
        window.location.href = result.paymentUrl
      }
    })
  }

  return (
    <div className="bg-brand-dark rounded-2xl overflow-hidden">
      <div className="text-center px-6 pt-10 pb-6">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl bg-brand/15 flex items-center justify-center">
            <SparklesIcon className="w-8 h-8 text-brand" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white mb-3 leading-tight">
          Seu site está pronto! 🎉
        </h1>
        <p className="text-gray-400 text-sm max-w-xs mx-auto leading-relaxed">
          Agora é só ativar para publicar. Como combinado, o primeiro mês é por nossa conta.
        </p>
      </div>

      <div className="mx-4 mb-6 bg-white rounded-xl p-5">
        <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-3 py-1 mb-4">
          <span className="text-green-700 text-xs font-bold">1 mês grátis de cortesia</span>
        </div>

        <ul className="space-y-2.5 mb-5">
          {WARM_BENEFITS.map((b) => (
            <li key={b} className="flex items-start gap-2 text-sm text-gray-700">
              <svg className="w-4 h-4 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              {b}
            </li>
          ))}
        </ul>

        <p className="text-xs text-gray-400 mb-4">
          Após o período gratuito: R$29/mês, sem contrato. Cancele quando quiser.
        </p>

        <label className="flex items-start gap-3 mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => {
              setTermsAccepted(e.target.checked)
              if (e.target.checked) setError(null)
            }}
            className="mt-0.5 accent-brand shrink-0"
          />
          <span className="text-xs text-gray-500 leading-relaxed">
            Li e concordo com os{' '}
            <Link href="/termos" target="_blank" className="text-brand-text hover:underline">
              Termos de Uso
            </Link>{' '}
            e a{' '}
            <Link href="/privacidade" target="_blank" className="text-brand-text hover:underline">
              Política de Privacidade
            </Link>
            , incluindo a renovação automática mensal de R$29 após o primeiro mês gratuito.
          </span>
        </label>

        {pendingPayment && (
          <p className="text-yellow-700 text-xs bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 mb-3">
            Pagamento gerado! Verifique seu e-mail ou clique abaixo para acessar o boleto/PIX novamente.
          </p>
        )}

        {error && (
          <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
            {error}
          </p>
        )}

        <Button
          variant="conversion"
          size="md"
          fullWidth
          onClick={handleActivate}
          loading={isPending}
          loadingText="Ativando..."
          disabled={!termsAccepted}
        >
          {pendingPayment ? 'Ver boleto / PIX' : 'Ativar com 1 mês grátis'}
        </Button>
      </div>
    </div>
  )
}

// ─── Cold flow (frio) ────────────────────────────────────────────────────────

export function ActivationScreen({ siteId, filesZipUrl, pendingPayment, clientName, clientEmail, activationFlow }: Props) {
  if (activationFlow === 'quente') {
    return <WarmActivationScreen pendingPayment={pendingPayment} />
  }
  const [showRetention, setShowRetention] = useState(false)
  const [retentionStep, setRetentionStep] = useState<RetentionStep>('retention')
  const [selectedReason, setSelectedReason] = useState('')
  const [reasonDetail, setReasonDetail] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  function handleActivate() {
    if (!termsAccepted) {
      setError('Você precisa aceitar os Termos de Uso para continuar.')
      return
    }
    setError(null)
    startTransition(async () => {
      const result = await activatePlan({ termsAccepted: true })
      if (result.error) {
        setError(result.error)
      } else if (result.paymentUrl) {
        window.location.href = result.paymentUrl
      }
    })
  }

  function handleDownloadClick() {
    setRetentionStep('retention')
    setShowRetention(true)
  }

  function handleRetentionActivate() {
    setShowRetention(false)
    handleActivate()
  }

  function handleRetentionDownload() {
    setRetentionStep('reason')
  }

  function handleReasonSubmit() {
    if (!selectedReason) return
    startTransition(async () => {
      await submitDownloadReason(siteId, selectedReason, reasonDetail)
      setRetentionStep('counterargument')
    })
  }

  function handleWhatsApp() {
    const reasonLabel = REASONS.find((r) => r.value === selectedReason)?.label ?? selectedReason
    const lines = [
      'Olá! Prefiro receber os arquivos do meu site.',
      `Motivo: ${reasonLabel}`,
      reasonDetail ? `Detalhe: ${reasonDetail}` : null,
      `Meu acesso: ${clientName} (${clientEmail})`,
    ]
      .filter(Boolean)
      .join('\n')
    const number = COMPANY_WHATSAPP.replace(/\D/g, '')
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(lines)}`, '_blank')
    setShowRetention(false)
    setRetentionStep('retention')
  }

  function handleClose() {
    setShowRetention(false)
    setRetentionStep('retention')
    setSelectedReason('')
    setReasonDetail('')
  }

  const retentionTitle =
    retentionStep === 'retention'
      ? 'Espera! Seu site pode estar no ar hoje'
      : retentionStep === 'reason'
        ? 'Só uma pergunta rápida'
        : 'Antes de ir...'

  const retentionContent = (
    <>
      {retentionStep === 'retention' && (
        <>
          {/* Lista de trabalho técnico */}
          <p className="text-xs text-gray-500 mb-2">
            Baixando os arquivos, todo o trabalho técnico fica com você:
          </p>
          <ul className="space-y-1.5 mb-4">
            {[
              'Contratar e configurar hospedagem',
              'Instalar o certificado SSL',
              'Apontar o domínio',
              'Subir arquivos por FTP',
              'Resolver quedas e erros sozinho',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-gray-500">
                <span className="w-4 h-4 rounded-full bg-red-50 flex items-center justify-center shrink-0 text-red-400 text-xs font-bold">✕</span>
                {item}
              </li>
            ))}
          </ul>

          {/* Divisor */}
          <div className="border-t border-gray-100 my-3" />

          {/* Lista de benefícios */}
          <p className="text-xs font-semibold text-gray-700 mb-2">
            Ativando agora, a gente faz tudo por você:
          </p>
          <ul className="space-y-1.5 mb-4">
            {[
              'Publicação e configuração completa',
              'Correções ilimitadas e gratuitas',
              'Monitoramento 24h — se cair, resolvemos',
              'Suporte no WhatsApp',
              'Relatório de visitas do site',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                <span className="w-4 h-4 rounded-full bg-green-50 flex items-center justify-center shrink-0 text-green-500 text-xs font-bold">✓</span>
                {item}
              </li>
            ))}
          </ul>

          {/* Fechamento */}
          <p className="text-center text-xs font-semibold text-brand-text bg-brand/8 rounded-lg py-2 px-3 mb-4">
            Primeiro mês grátis · Sem contrato · Cancele quando quiser
          </p>

          <div className="flex flex-col gap-3">
            <Button variant="conversion" size="md" fullWidth onClick={handleRetentionActivate} loading={isPending} loadingText="Processando...">
              Ativar com 1 mês grátis
            </Button>
            <Button variant="secondary" size="md" fullWidth onClick={handleRetentionDownload} disabled={isPending}>
              Continuar e baixar os arquivos
            </Button>
          </div>
        </>
      )}

      {retentionStep === 'reason' && (
        <>
          <p className="text-sm text-gray-500 mb-4">
            Qual o principal motivo para não querer manter o site hospedado agora?
          </p>
          <div className="space-y-2 mb-4">
            {REASONS.map((r) => (
              <label
                key={r.value}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedReason === r.value
                    ? 'border-brand bg-brand/5'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="reason"
                  value={r.value}
                  checked={selectedReason === r.value}
                  onChange={() => setSelectedReason(r.value)}
                  className="accent-brand"
                />
                <span className="text-sm text-gray-700">{r.label}</span>
              </label>
            ))}
          </div>
          {selectedReason && (
            <textarea
              value={reasonDetail}
              onChange={(e) => setReasonDetail(e.target.value)}
              placeholder="Algum detalhe que queira adicionar? (opcional)"
              rows={2}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-brand resize-none"
            />
          )}
          <Button
            variant="conversion"
            size="md"
            fullWidth
            onClick={handleReasonSubmit}
            loading={isPending}
            disabled={!selectedReason}
          >
            Enviar e ver como baixar
          </Button>
        </>
      )}

      {retentionStep === 'counterargument' && (
        <>
          <div className="bg-brand/8 border border-brand/20 rounded-xl px-4 py-4 mb-5">
            <p className="text-sm text-gray-800 leading-relaxed">
              {COUNTER_ARGUMENTS[selectedReason] ?? COUNTER_ARGUMENTS.outro}
            </p>
          </div>

          <p className="text-center text-xs font-semibold text-brand-text bg-brand/8 rounded-lg py-2 px-3 mb-5">
            Primeiro mês grátis · Sem contrato · Cancele quando quiser
          </p>

          <div className="flex flex-col gap-3">
            <Button
              variant="conversion"
              size="md"
              fullWidth
              onClick={handleRetentionActivate}
              loading={isPending}
              loadingText="Processando..."
            >
              Ativar com 1 mês grátis
            </Button>
            <Button
              variant="secondary"
              size="md"
              fullWidth
              onClick={handleWhatsApp}
              disabled={isPending}
            >
              <svg className="w-4 h-4 mr-2 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Receber os arquivos no WhatsApp
            </Button>
          </div>
        </>
      )}
    </>
  )

  return (
    <>
      {/* Dark landing container */}
      <div className="bg-brand-dark rounded-2xl overflow-hidden">
        {/* Hero */}
        <div className="text-center px-6 pt-10 pb-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-brand/15 flex items-center justify-center">
              <SparklesIcon className="w-8 h-8 text-brand" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2 leading-tight">
            Seu site está pronto! 🎉
          </h1>
          <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/30 rounded-full px-4 py-1.5 mb-3">
            <span className="text-green-400 text-sm font-bold">Primeiro mês grátis</span>
          </div>
          <p className="text-gray-400 text-sm max-w-xs mx-auto leading-relaxed">
            Depois R$29/mês, sem contrato. Cancele quando quiser.
          </p>
        </div>

        {/* Benefits card */}
        <div className="mx-4 mb-4 bg-white rounded-xl p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
            O que está incluído
          </p>
          <ul className="space-y-2.5 mb-5">
            {PLAN_BENEFITS.map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm text-gray-700">
                <svg
                  className="w-4 h-4 text-green-500 shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {b}
              </li>
            ))}
          </ul>

          {/* Terms checkbox */}
          <label className="flex items-start gap-3 mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => {
                setTermsAccepted(e.target.checked)
                if (e.target.checked) setError(null)
              }}
              className="mt-0.5 accent-brand shrink-0"
            />
            <span className="text-xs text-gray-500 leading-relaxed">
              Li e concordo com os{' '}
              <Link href="/termos" target="_blank" className="text-brand-text hover:underline">
                Termos de Uso
              </Link>{' '}
              e a{' '}
              <Link href="/privacidade" target="_blank" className="text-brand-text hover:underline">
                Política de Privacidade
              </Link>
              , incluindo a renovação automática mensal de R$29 após o primeiro mês gratuito.
            </span>
          </label>

          {pendingPayment && (
            <p className="text-yellow-700 text-xs bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 mb-3">
              Pagamento gerado! Verifique seu e-mail ou clique abaixo para acessar o boleto/PIX novamente.
            </p>
          )}

          {error && (
            <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
              {error}
            </p>
          )}

          <Button
            variant="conversion"
            size="md"
            fullWidth
            onClick={handleActivate}
            loading={isPending}
            loadingText="Processando..."
            disabled={!termsAccepted}
          >
            {pendingPayment ? 'Ver boleto / PIX' : 'Ativar com 1 mês grátis'}
          </Button>
        </div>

        {/* Download option */}
        <div className="px-4 pb-6">
          <div className="bg-brand-dark-hover border border-brand-dark-border rounded-xl p-4 flex items-center gap-4">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
              <DownloadIcon className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">Preferir hospedar em outro lugar?</p>
              <p className="text-xs text-gray-400 mt-0.5">Receba os arquivos e publique como quiser.</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDownloadClick}
              disabled={isPending}
            >
              Baixar (grátis)
            </Button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-600 pb-6 px-4">
          Você pode ativar o plano a qualquer momento, mesmo depois de baixar os arquivos.
        </p>
      </div>

      {/* Retention popup — BottomSheet on mobile, Modal on desktop */}
      {isMobile ? (
        <BottomSheet
          open={showRetention}
          onClose={handleClose}
          title={retentionTitle}
        >
          {retentionContent}
        </BottomSheet>
      ) : (
        <Modal
          open={showRetention}
          onClose={handleClose}
          title={retentionTitle}
        >
          {retentionContent}
        </Modal>
      )}
    </>
  )
}
