'use client'

import { useState, useTransition, useEffect } from 'react'
import { activatePlan, submitDownloadReason } from '../actions'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { BottomSheet } from '@/components/ui/bottom-sheet'
import { SparklesIcon, DownloadIcon } from '@/components/ui/icons'
import Link from 'next/link'

type Props = {
  siteId: string
  filesZipUrl: string | null
  pendingPayment?: boolean
  whatsappNumber: string
}

type RetentionStep = 'retention' | 'reason' | 'whatsapp'

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

const REASONS = [
  { value: 'hospedagem', label: 'Já tenho uma solução de hospedagem' },
  { value: 'outro_lugar', label: 'Vou hospedar em outro lugar' },
  { value: 'nao_usar', label: 'Não vou usar o site agora' },
  { value: 'tecnico', label: 'Prefiro gerenciar o site por conta própria' },
  { value: 'outro', label: 'Outro motivo' },
]

export function ActivationScreen({ siteId, filesZipUrl, pendingPayment, whatsappNumber }: Props) {
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
      setRetentionStep('whatsapp')
    })
  }

  function handleWhatsApp() {
    const msg = encodeURIComponent(
      'Olá! Gostaria de receber os arquivos do meu site. 😊',
    )
    const number = whatsappNumber.replace(/\D/g, '')
    window.open(`https://wa.me/${number}?text=${msg}`, '_blank')
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
      ? 'Tem certeza? Seu site está pronto pra ir ao ar hoje'
      : retentionStep === 'reason'
        ? 'Só uma pergunta rápida'
        : 'Receba os arquivos pelo WhatsApp'

  const RETENTION_BENEFITS = [
    'Publicação e configuração completa, feita por nós',
    'Correções ilimitadas e gratuitas, sempre que precisar',
    'Monitoramento 24h — se sair do ar, a gente resolve',
    'Suporte especializado direto no WhatsApp',
    'Relatório de visitas do seu site',
    'Primeiro mês grátis, sem contrato de permanência',
  ]

  const retentionContent = (
    <>
      {retentionStep === 'retention' && (
        <>
          <p className="text-sm text-gray-600 leading-relaxed mb-3">
            Baixando os arquivos, você fica responsável por: contratar e configurar uma
            hospedagem, instalar o certificado SSL, apontar o domínio, subir os arquivos
            por FTP e resolver sozinho qualquer erro ou queda do servidor.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            Ativando agora, <strong className="text-gray-900">seu site entra no ar hoje mesmo</strong>{' '}
            — e o primeiro mês é gratuito. Você não digita uma linha de código: a gente
            publica, monitora 24h, corrige o que quebrar e mantém tudo funcionando.
          </p>
          <ul className="space-y-2 mb-6">
            {RETENTION_BENEFITS.map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm text-gray-700">
                <svg className="w-4 h-4 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                {b}
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-3">
            <Button
              variant="conversion"
              size="md"
              fullWidth
              onClick={handleRetentionActivate}
              loading={isPending}
            >
              Ativar com 1 mês grátis
            </Button>
            <Button
              variant="secondary"
              size="md"
              fullWidth
              onClick={handleRetentionDownload}
              disabled={isPending}
            >
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

      {retentionStep === 'whatsapp' && (
        <>
          <p className="text-sm text-gray-600 leading-relaxed mb-2">
            Fale com a gente pelo WhatsApp e receba os arquivos do seu site diretamente no chat.
          </p>
          <p className="text-xs text-gray-400 mb-6">
            Você pode ativar o plano a qualquer momento no futuro, mesmo após baixar.
          </p>
          <Button
            variant="conversion"
            size="md"
            fullWidth
            onClick={handleWhatsApp}
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Falar no WhatsApp para receber os arquivos
          </Button>
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
