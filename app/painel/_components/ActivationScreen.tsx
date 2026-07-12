'use client'

import { useState, useTransition, useEffect } from 'react'
import { activateBasicPlan, markRetentionShown, requestZipUploadNotification } from '../actions'
import { Button } from '@/components/ui/button'
import { Modal, ModalActions } from '@/components/ui/modal'
import { BottomSheet } from '@/components/ui/bottom-sheet'

type Props = {
  siteId: string
  filesZipUrl: string | null
  retentionAlreadyShown: boolean
}

const PLAN_BENEFITS = [
  'Hospedagem gerenciada — zero configuração',
  'SSL gratuito renovado automaticamente',
  'Monitoramento 24h do site',
  'Suporte via painel sempre que precisar',
]

export function ActivationScreen({ siteId, filesZipUrl, retentionAlreadyShown }: Props) {
  const [showRetention, setShowRetention] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [zipMsg, setZipMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  function handleActivate() {
    setError(null)
    startTransition(async () => {
      const result = await activateBasicPlan()
      if (result.error) {
        setError(result.error)
      } else if (result.paymentUrl) {
        window.location.href = result.paymentUrl
      }
    })
  }

  function handleDownloadClick() {
    if (!filesZipUrl) {
      if (zipMsg) return
      startTransition(async () => {
        await requestZipUploadNotification(siteId)
        setZipMsg(
          'Arquivos em preparação. Você será notificado assim que estiverem prontos para download.',
        )
      })
      return
    }
    if (!retentionAlreadyShown) {
      startTransition(() => markRetentionShown())
      setShowRetention(true)
    } else {
      window.location.href = filesZipUrl
    }
  }

  function handleRetentionActivate() {
    setShowRetention(false)
    handleActivate()
  }

  function handleRetentionDownload() {
    setShowRetention(false)
    if (filesZipUrl) window.location.href = filesZipUrl
  }

  return (
    <>
      {/* Dark landing container */}
      <div className="bg-brand-dark rounded-2xl overflow-hidden">
        {/* Hero */}
        <div className="text-center px-6 pt-10 pb-8">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-white mb-2 leading-tight">
            Seu site está pronto!
          </h1>
          <p className="text-gray-400 text-sm max-w-xs mx-auto leading-relaxed">
            Escolha como quer colocá-lo no ar.
          </p>
        </div>

        {/* Option cards — stacked on mobile, side-by-side on sm+ */}
        <div className="px-4 pb-6 flex flex-col sm:flex-row gap-4">
          {/* Card 1: Publish */}
          <div className="bg-white rounded-xl p-5 flex flex-col flex-1">
            <div className="flex items-baseline gap-1.5 mb-3">
              <span className="text-2xl font-bold text-gray-900">R$17</span>
              <span className="text-xs text-gray-500 font-medium">/mês</span>
              <span className="ml-auto text-xs bg-brand text-brand-dark font-semibold px-2 py-0.5 rounded-full">
                Recomendado
              </span>
            </div>

            <h2 className="text-base font-bold text-gray-900 mb-1">Publicar meu site</h2>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Sem contrato de fidelidade. Cancele quando quiser.
            </p>

            <ul className="space-y-2 mb-5 flex-1">
              {PLAN_BENEFITS.map((b) => (
                <li key={b} className="flex items-center gap-2 text-xs text-gray-700">
                  <svg
                    className="w-3.5 h-3.5 text-green-500 shrink-0"
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
            >
              Ativar por R$17/mês
            </Button>
          </div>

          {/* Card 2: Download */}
          <div className="bg-brand-dark-hover border border-brand-dark-border rounded-xl p-5 flex flex-col flex-1">
            <div className="text-2xl mb-3">📦</div>
            <h2 className="text-base font-bold text-white mb-1">Baixar os arquivos</h2>
            <p className="text-xs text-gray-400 mb-5 leading-relaxed flex-1">
              Receba o zip com todos os arquivos e hospede onde e como quiser.
            </p>

            {zipMsg && (
              <p className="text-blue-300 text-xs bg-blue-950/40 border border-blue-900/50 rounded-lg px-3 py-2 mb-3">
                {zipMsg}
              </p>
            )}

            <Button
              variant="secondary"
              size="md"
              fullWidth
              onClick={handleDownloadClick}
              disabled={isPending || !!zipMsg}
            >
              {zipMsg ? 'Aguardando arquivos…' : 'Baixar arquivos (grátis)'}
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
          onClose={() => setShowRetention(false)}
          title="Tem certeza que não quer o site no ar?"
        >
          <p className="text-sm text-gray-600 leading-relaxed mb-3">
            Só pra você comparar: hospedagem mensal{' '}
            <strong className="text-gray-900">sem fidelidade</strong> custa de R$40 a R$70 nas
            grandes empresas — os planos baratos exigem contrato de 2 a 4 anos adiantado.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed mb-6">
            Aqui são <strong className="text-gray-900">R$17/mês, sem contrato</strong>, com
            hospedagem, SSL, monitoramento e suporte. A gente cuida de tudo.
          </p>
          <div className="flex flex-col gap-3">
            <Button
              variant="conversion"
              size="md"
              fullWidth
              onClick={handleRetentionActivate}
              loading={isPending}
            >
              Quero ativar por R$17/mês
            </Button>
            <Button
              variant="ghost"
              size="md"
              fullWidth
              onClick={handleRetentionDownload}
              disabled={isPending}
            >
              Não, quero apenas baixar os arquivos
            </Button>
          </div>
        </BottomSheet>
      ) : (
        <Modal
          open={showRetention}
          onClose={() => setShowRetention(false)}
          title="Tem certeza que não quer o site no ar por R$17/mês?"
          description="Só pra você comparar antes de decidir: uma hospedagem mensal sem fidelidade custa de R$40 a R$70 nas grandes empresas — os planos baratos exigem contrato de 2 a 4 anos pagos adiantado. Aqui são R$17 por mês, sem contrato de permanência, com hospedagem, SSL, monitoramento e suporte inclusos. A gente cuida de tudo."
        >
          <ModalActions>
            <Button
              variant="conversion"
              size="md"
              fullWidth
              onClick={handleRetentionActivate}
              loading={isPending}
            >
              Quero ativar por R$17/mês
            </Button>
            <Button
              variant="ghost"
              size="md"
              fullWidth
              onClick={handleRetentionDownload}
              disabled={isPending}
            >
              Não, quero apenas baixar os arquivos
            </Button>
          </ModalActions>
        </Modal>
      )}
    </>
  )
}
