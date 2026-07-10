'use client'

import { useState, useTransition } from 'react'
import { activateBasicPlan, markRetentionShown, requestZipUploadNotification } from '../actions'

type Props = {
  siteId: string
  filesZipUrl: string | null
  retentionAlreadyShown: boolean
}

export function ActivationScreen({ siteId, filesZipUrl, retentionAlreadyShown }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [zipMsg, setZipMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

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
      setShowModal(true)
    } else {
      window.location.href = filesZipUrl
    }
  }

  function handleModalActivate() {
    setShowModal(false)
    handleActivate()
  }

  function handleModalDownload() {
    setShowModal(false)
    if (filesZipUrl) window.location.href = filesZipUrl
  }

  return (
    <>
      <div className="flex items-center justify-center min-h-[calc(100vh-57px)]">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 max-w-lg w-full text-center">
          <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-2xl mx-auto mb-5">
            🎉
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-3">Seu site está pronto!</h1>

          <p className="text-gray-600 text-sm leading-relaxed mb-8">
            Para publicá-lo no ar com hospedagem, SSL e suporte, ative o{' '}
            <strong className="text-gray-900">Plano Site no Ar por R$17/mês</strong>. Se preferir
            não assinar, você pode baixar os arquivos do site e hospedar por conta própria, sem
            custo adicional.
          </p>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 mb-5">
              {error}
            </p>
          )}

          {zipMsg && (
            <p className="text-blue-700 text-sm bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5 mb-5">
              {zipMsg}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleActivate}
              disabled={isPending}
              className="flex-1 py-3 px-5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              {isPending ? 'Processando…' : 'Ativar por R$17/mês'}
            </button>
            <button
              onClick={handleDownloadClick}
              disabled={isPending || !!zipMsg}
              className="flex-1 py-3 px-5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Baixar arquivos do site (grátis)
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-5">
            Ambas as opções estão disponíveis a qualquer momento. Você pode ativar o plano depois,
            quando quiser.
          </p>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              Tem certeza que não quer o site no ar por R$17/mês?
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              Só pra você comparar antes de decidir: uma hospedagem mensal sem fidelidade custa de
              R$40 a R$70 por mês nas grandes empresas — e os planos baratos que você vê anunciados
              exigem contrato de 2 a 4 anos pagos adiantado. Aqui são R$17 por mês, sem contrato de
              permanência, com hospedagem, SSL, monitoramento e suporte inclusos. Você não precisa
              configurar nada: a gente cuida de tudo.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleModalActivate}
                disabled={isPending}
                className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                Quero ativar por R$17/mês
              </button>
              <button
                onClick={handleModalDownload}
                disabled={isPending}
                className="flex-1 py-2.5 px-4 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Não, quero apenas baixar os arquivos
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
