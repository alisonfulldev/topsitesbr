'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { CheckCircleIcon } from '@/components/ui/icons'
import { getMonthlyPixAction, signMonthlyContractAction, simulateMonthlyPaymentAction } from '../mensal-actions'
import type { MonthlyPix } from '@/lib/monthly-plan-service'

type Props = {
  clientName: string
  monthlyPrice: number
  fidelityMonths: number
  contractHtml: string
  /** contrato já assinado → mostra o Pix do primeiro mês */
  signed: boolean
  initialPix: MonthlyPix | null
}

const brl = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function MonthlyOnboarding({ clientName, monthlyPrice, fidelityMonths, contractHtml, signed, initialPix }: Props) {
  const firstName = clientName.split(' ')[0]

  return (
    <div className="max-w-xl mx-auto py-6 sm:py-10">
      <div className="text-center mb-8">
        <p className="text-sm font-medium text-gray-500">Olá, {firstName}!</p>
        <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-gray-900">
          {signed ? 'Falta só o primeiro Pix' : 'Seu site por assinatura'}
        </h1>
        <p className="mt-2 text-gray-600">
          {signed
            ? 'Assim que o pagamento for confirmado, começamos a publicar o seu site.'
            : 'Sem taxa de criação: você paga apenas a mensalidade.'}
        </p>
      </div>

      <ol className="mb-6 flex items-center justify-center gap-3 text-xs font-medium text-gray-500" aria-label="Etapas">
        <li className={signed ? 'text-green-700' : 'text-gray-900'}>1. Assinar o contrato</li>
        <li aria-hidden="true">→</li>
        <li className={signed ? 'text-gray-900' : ''}>2. Pagar o 1º mês por Pix</li>
      </ol>

      {signed ? (
        <PixStep initialPix={initialPix} monthlyPrice={monthlyPrice} />
      ) : (
        <ContractStep monthlyPrice={monthlyPrice} fidelityMonths={fidelityMonths} contractHtml={contractHtml} />
      )}
    </div>
  )
}

function ContractStep({ monthlyPrice, fidelityMonths, contractHtml }: { monthlyPrice: number; fidelityMonths: number; contractHtml: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [readToEnd, setReadToEnd] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const scrollRef = useRef<HTMLDivElement>(null)

  function handleScroll() {
    const el = scrollRef.current
    if (el && el.scrollTop + el.clientHeight >= el.scrollHeight - 24) setReadToEnd(true)
  }

  function handleSign() {
    setError('')
    startTransition(async () => {
      const result = await signMonthlyContractAction(accepted)
      if (result.error) {
        setError(result.error)
        return
      }
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
        <p className="text-center">
          <span className="text-4xl font-bold tracking-tight text-gray-900">{brl(monthlyPrice)}</span>
          <span className="text-gray-500">/mês</span>
        </p>
        <ul className="mt-6 space-y-3 text-sm text-gray-700">
          {[
            'Site criado, publicado e mantido no ar, com SSL',
            'Painel para você mesmo editar textos e imagens',
            'Sem taxa de criação',
            `Fidelidade de ${fidelityMonths} meses`,
            'Pagamento somente por Pix — o 1º mês é pago agora',
          ].map((item) => (
            <li key={item} className="flex gap-2.5">
              <CheckCircleIcon className="w-5 h-5 shrink-0 text-green-600" />
              {item}
            </li>
          ))}
        </ul>
        <Button variant="conversion" size="lg" fullWidth className="mt-8" onClick={() => setOpen(true)}>
          Ler e assinar o contrato
        </Button>
      </div>

      <Modal open={open} onClose={() => !isPending && setOpen(false)} title="Contrato de prestação de serviços" size="lg" className="sm:max-w-2xl">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="contract-body max-h-[55vh] overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700 [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:font-semibold [&_h3]:text-gray-900 [&_li]:mb-1 [&_p]:mb-2 [&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-5"
          dangerouslySetInnerHTML={{ __html: contractHtml }}
        />
        {!readToEnd && (
          <p className="mt-3 text-xs text-gray-500">Role o contrato até o final para liberar a assinatura.</p>
        )}
        <label className={`mt-4 flex items-start gap-3 text-sm ${readToEnd ? 'text-gray-800' : 'text-gray-400'}`}>
          <input
            type="checkbox"
            checked={accepted}
            disabled={!readToEnd}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300"
          />
          <span>Li e concordo com o contrato, incluindo a fidelidade de {fidelityMonths} meses e o pagamento somente por Pix.</span>
        </label>
        {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => setOpen(false)} disabled={isPending}>Voltar</Button>
          <Button variant="conversion" onClick={handleSign} disabled={!accepted} loading={isPending} loadingText="Assinando…">
            Assinar contrato
          </Button>
        </div>
        <p className="mt-3 text-xs text-gray-500">Você e a Top Site recebem uma cópia do contrato por e-mail.</p>
      </Modal>
    </>
  )
}

function PixStep({ initialPix, monthlyPrice }: { initialPix: MonthlyPix | null; monthlyPrice: number }) {
  const router = useRouter()
  const [pix, setPix] = useState<MonthlyPix | null>(initialPix)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [isSimulating, startSimulate] = useTransition()

  // Confere o pagamento a cada 5 s; quando confirmado, o painel recarrega já ativado
  useEffect(() => {
    let active = true
    const timer = setInterval(async () => {
      const result = await getMonthlyPixAction()
      if (!active) return
      if (result.pix) setPix(result.pix)
      if (result.pix?.status === 'ACTIVE') {
        clearInterval(timer)
        router.refresh()
      }
    }, 5000)
    return () => {
      active = false
      clearInterval(timer)
    }
  }, [router])

  async function copyCode() {
    if (!pix?.qrCodePayload) return
    try {
      await navigator.clipboard.writeText(pix.qrCodePayload)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      setError('Não foi possível copiar. Selecione o código e copie manualmente.')
    }
  }

  if (!pix) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-600">
        Gerando o Pix… se demorar, atualize a página.
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 text-center">
      <p className="text-sm text-gray-500">Primeira mensalidade</p>
      <p className="mt-1 text-3xl font-bold text-gray-900">{brl(monthlyPrice)}</p>

      {pix.qrCodeImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`data:image/png;base64,${pix.qrCodeImage}`}
          alt="QR Code Pix da primeira mensalidade"
          className="mx-auto mt-6 h-56 w-56 rounded-lg border border-gray-100"
        />
      )}

      {pix.qrCodePayload && (
        <div className="mt-6 text-left">
          <label htmlFor="pix-copia-cola" className="mb-1.5 block text-xs font-medium text-gray-600">Pix copia e cola</label>
          <textarea
            id="pix-copia-cola"
            readOnly
            rows={3}
            value={pix.qrCodePayload}
            onFocus={(e) => e.currentTarget.select()}
            className="w-full resize-none rounded-lg border border-gray-300 bg-gray-50 p-3 font-mono text-xs text-gray-700 break-all"
          />
          <Button variant="primary" fullWidth className="mt-2" onClick={copyCode}>
            {copied ? 'Código copiado!' : 'Copiar código Pix'}
          </Button>
        </div>
      )}

      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}

      <p className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500" role="status">
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-amber-400" aria-hidden="true" />
        Aguardando o pagamento — a confirmação aparece aqui automaticamente.
      </p>
      {pix.expiresAt && (
        <p className="mt-1 text-xs text-gray-400">
          Válido até {new Date(pix.expiresAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}. Depois disso, um novo código é gerado.
        </p>
      )}

      {pix.isMock && (
        <Button
          variant="secondary"
          size="sm"
          className="mt-6"
          loading={isSimulating}
          onClick={() =>
            startSimulate(async () => {
              const result = await simulateMonthlyPaymentAction()
              if (result.error) setError(result.error)
              else router.refresh()
            })
          }
        >
          Simular pagamento (desenvolvimento)
        </Button>
      )}
    </div>
  )
}
