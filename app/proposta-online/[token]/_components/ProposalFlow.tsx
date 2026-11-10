'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  approveAction,
  checkPaymentAction,
  requestAdjustmentAction,
  setExtrasAction,
  signContractAction,
  simulatePaymentAction,
  startPaymentAction,
} from '../actions'

type Extra = { key: string; name: string; price: number }

type Props = {
  token: string
  status: string
  name: string
  company: string | null
  planName: string
  setupPrice: number
  monthlyPrice: number
  setupTotal: number
  extras: Extra[]
  selectedExtras: string[]
  previewSrc: string | null
  revisionsLeft: number
  expiresAt: string
  whatsappUrl: string
  contractHtml: string | null
  paymentMethod: 'PIX' | 'CREDIT_CARD' | null
  paymentUrl: string | null
  isMockPayment: boolean
}

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const STEPS = ['Prévia', 'Aprovação', 'Contrato', 'Pagamento']

function stepIndex(status: string) {
  if (status === 'aprovada') return 2
  if (status === 'contrato_assinado') return 3
  if (status === 'ativo') return 4
  return status === 'previa_enviada' ? 1 : 0
}

const btnPrimary = 'inline-flex h-12 items-center justify-center rounded-xl bg-[#FDD900] px-6 text-sm font-semibold text-black transition-colors hover:bg-[#E8C700] disabled:opacity-50 disabled:cursor-not-allowed'
const btnSecondary = 'inline-flex h-12 items-center justify-center rounded-xl border border-gray-300 bg-white px-6 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50 disabled:opacity-50'

export function ProposalFlow(props: Props) {
  const current = stepIndex(props.status)
  const firstName = props.name.split(' ')[0]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-black px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Image src="/logo.png" alt="TopSite" width={36} height={36} className="h-8 w-8 object-contain" />
          <a href={props.whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-white/80 hover:text-white">Dúvidas? WhatsApp</a>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:py-10">
        <p className="text-sm text-gray-500">Olá, {firstName}!</p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
          Proposta do site{props.company ? ` — ${props.company}` : ''}
        </h1>

        {/* Indicador de progresso */}
        <ol className="mt-6 grid grid-cols-4 gap-2" aria-label="Etapas da proposta">
          {STEPS.map((label, i) => {
            const done = i < current
            const active = i === current || (i === 0 && current === 1)
            return (
              <li key={label} className="text-center">
                <div className={`h-1.5 rounded-full ${done || active ? 'bg-[#FDD900]' : 'bg-gray-200'}`} />
                <span className={`mt-2 block text-xs font-medium ${done || active ? 'text-gray-900' : 'text-gray-400'}`}>
                  {done ? '✓ ' : ''}{label}
                </span>
              </li>
            )
          })}
        </ol>

        <div className="mt-8">
          <StatusContent {...props} />
        </div>
      </main>
    </div>
  )
}

function Notice({ title, text, children }: { title: string; text: string; children?: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-8 text-center">
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      <p className="mt-2 text-gray-600">{text}</p>
      {children}
    </div>
  )
}

function StatusContent(props: Props) {
  switch (props.status) {
    case 'prospect':
      return <Notice title="Sua prévia está sendo preparada" text="Você vai receber um e-mail assim que ela estiver pronta." />
    case 'ajuste_solicitado':
      return <Notice title="Recebemos seu pedido de ajuste" text="Estamos ajustando a prévia. Você recebe um e-mail quando a nova versão estiver pronta." />
    case 'expirada':
      return (
        <Notice title="Esta proposta expirou" text="O prazo do link terminou. Fale com a gente para receber uma nova proposta.">
          <a href={props.whatsappUrl} target="_blank" rel="noopener noreferrer" className={`${btnPrimary} mt-6`}>Falar no WhatsApp</a>
        </Notice>
      )
    case 'cancelada':
      return <Notice title="Proposta encerrada" text="Esta proposta não está mais disponível." />
    case 'previa_enviada':
      return <PreviewStep {...props} />
    case 'aprovada':
      return <ContractStep {...props} />
    case 'contrato_assinado':
      return <PaymentStep {...props} />
    case 'ativo':
      return (
        <Notice title="Pagamento confirmado! 🎉" text="Enviamos para o seu e-mail o acesso ao painel. Lá você envia as informações do seu negócio para começarmos a versão final do site.">
          <a href="/login" className={`${btnPrimary} mt-6`}>Acessar o painel</a>
        </Notice>
      )
    default:
      return null
  }
}

function PriceBox({ props }: { props: Props }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Plano {props.planName}</p>
      <p className="mt-2 text-sm text-gray-600">Criação (setup)</p>
      <p className="text-2xl font-bold text-gray-900">{brl(props.setupTotal)}</p>
      {props.setupTotal !== props.setupPrice && <p className="text-xs text-gray-500">plano {brl(props.setupPrice)} + extras</p>}
      <p className="mt-3 text-sm text-gray-600">Mensalidade</p>
      <p className="text-lg font-semibold text-gray-900">{brl(props.monthlyPrice)}<span className="text-sm font-normal text-gray-500">/mês</span></p>
      <p className="mt-1 text-xs text-gray-500">1ª mensalidade 30 dias após o pagamento do setup · somente Pix</p>
    </div>
  )
}

function PreviewStep(props: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState(props.selectedExtras)
  const [mode, setMode] = useState<'idle' | 'adjust'>('idle')
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const expires = new Date(props.expiresAt).toLocaleDateString('pt-BR')

  function toggle(key: string) {
    const next = selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key]
    setSelected(next)
    startTransition(async () => {
      const r = await setExtrasAction(props.token, next)
      if (r.error) setError(r.error)
      router.refresh()
    })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <span className="absolute left-3 top-3 z-10 rounded-full bg-black px-3 py-1 text-xs font-semibold text-[#FDD900]">Prévia</span>
        {props.previewSrc ? (
          <iframe
            src={props.previewSrc}
            title="Prévia do site"
            sandbox="allow-scripts allow-popups allow-forms"
            referrerPolicy="no-referrer"
            className="h-[70vh] w-full"
          />
        ) : (
          <p className="p-10 text-center text-gray-500">Prévia indisponível.</p>
        )}
      </div>

      <aside className="space-y-4">
        <PriceBox props={props} />

        {props.extras.length > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-sm font-semibold text-gray-900">Adicionar ao site</p>
            <ul className="mt-3 space-y-2">
              {props.extras.map((e) => (
                <li key={e.key}>
                  <label className="flex items-center justify-between gap-3 text-sm text-gray-700">
                    <span className="flex items-center gap-2">
                      <input type="checkbox" checked={selected.includes(e.key)} onChange={() => toggle(e.key)} disabled={isPending} className="h-4 w-4" />
                      {e.name}
                    </span>
                    <span className="font-medium">+ {brl(e.price)}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )}

        {mode === 'idle' ? (
          <div className="grid gap-2">
            <button
              className={btnPrimary}
              disabled={isPending}
              onClick={() => {
                if (!window.confirm('Aprovar a prévia e seguir para o contrato?')) return
                startTransition(async () => {
                  const r = await approveAction(props.token)
                  if (r.error) setError(r.error)
                  else router.refresh()
                })
              }}
            >
              Aprovar prévia
            </button>
            <button className={btnSecondary} disabled={isPending || props.revisionsLeft === 0} onClick={() => setMode('adjust')}>
              Solicitar ajuste {props.revisionsLeft > 0 ? `(${props.revisionsLeft} restante${props.revisionsLeft > 1 ? 's' : ''})` : '(limite atingido)'}
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <label htmlFor="ajuste" className="text-sm font-semibold text-gray-900">O que você quer ajustar?</label>
            <textarea id="ajuste" value={text} onChange={(e) => setText(e.target.value)} rows={5} maxLength={3000} className="mt-2 w-full rounded-lg border border-gray-300 p-3 text-sm" placeholder="Ex.: trocar a foto do topo, mudar o telefone…" />
            <div className="mt-3 grid gap-2">
              <button
                className={btnPrimary}
                disabled={isPending || text.trim().length < 5}
                onClick={() =>
                  startTransition(async () => {
                    const r = await requestAdjustmentAction(props.token, text)
                    if (r.error) setError(r.error)
                    else router.refresh()
                  })
                }
              >
                Enviar pedido de ajuste
              </button>
              <button className={btnSecondary} onClick={() => setMode('idle')} disabled={isPending}>Voltar</button>
            </div>
          </div>
        )}

        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <p className="text-xs text-gray-500">Esta prévia fica disponível até {expires}.</p>
      </aside>
    </div>
  )
}

function ContractStep(props: Props) {
  const router = useRouter()
  const [readToEnd, setReadToEnd] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [fullName, setFullName] = useState(props.name)
  const [cpf, setCpf] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const scrollRef = useRef<HTMLDivElement>(null)

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="text-lg font-semibold text-gray-900">Leia e assine o contrato</h2>
      <div
        ref={scrollRef}
        onScroll={() => {
          const el = scrollRef.current
          if (el && el.scrollTop + el.clientHeight >= el.scrollHeight - 24) setReadToEnd(true)
        }}
        className="mt-3 max-h-[55vh] overflow-y-auto rounded-xl border border-gray-200 bg-white p-5 text-sm leading-relaxed text-gray-700 [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:font-semibold [&_h3]:text-gray-900 [&_li]:mb-1 [&_p]:mb-2 [&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-5"
        dangerouslySetInnerHTML={{ __html: props.contractHtml ?? '' }}
      />
      {!readToEnd && <p className="mt-2 text-xs text-gray-500">Role o contrato até o final para liberar a assinatura.</p>}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-gray-800">Nome completo</span>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" className="h-11 w-full rounded-lg border border-gray-300 px-3" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-gray-800">CPF</span>
          <input value={cpf} onChange={(e) => setCpf(e.target.value)} inputMode="numeric" placeholder="000.000.000-00" className="h-11 w-full rounded-lg border border-gray-300 px-3" />
        </label>
      </div>
      <label className={`mt-4 flex items-start gap-3 text-sm ${readToEnd ? 'text-gray-800' : 'text-gray-400'}`}>
        <input type="checkbox" checked={accepted} disabled={!readToEnd} onChange={(e) => setAccepted(e.target.checked)} className="mt-0.5 h-4 w-4" />
        <span>Li e concordo com o contrato. Esta é a minha assinatura eletrônica.</span>
      </label>
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
      <button
        className={`${btnPrimary} mt-5 w-full sm:w-auto`}
        disabled={!accepted || isPending}
        onClick={() =>
          startTransition(async () => {
            const r = await signContractAction(props.token, { accepted, fullName, cpf })
            if (r.error) setError(r.error)
            else router.refresh()
          })
        }
      >
        {isPending ? 'Assinando…' : 'Assinar contrato'}
      </button>
      <p className="mt-3 text-xs text-gray-500">Registramos data, horário, IP e um código de verificação do texto assinado. Você recebe uma cópia por e-mail.</p>
    </div>
  )
}

function PaymentStep(props: Props) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  // Confere o pagamento a cada 8 s (o webhook do Asaas também confirma)
  useEffect(() => {
    const timer = setInterval(async () => {
      const r = await checkPaymentAction(props.token)
      if (r.paid) {
        clearInterval(timer)
        router.refresh()
      }
    }, 8000)
    return () => clearInterval(timer)
  }, [props.token, router])

  function pay(method: 'PIX' | 'CREDIT_CARD') {
    setError('')
    startTransition(async () => {
      const r = await startPaymentAction(props.token, method)
      if (r.error) setError(r.error)
      else if (r.paymentUrl) window.open(r.paymentUrl, '_blank', 'noopener')
    })
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center">
        <p className="text-sm text-gray-500">Contrato assinado ✓ · Pagamento do setup</p>
        <p className="mt-2 text-3xl font-bold text-gray-900">{brl(props.setupTotal)}</p>
        <p className="mt-1 text-sm text-gray-600">Depois, {brl(props.monthlyPrice)}/mês por Pix, a partir de 30 dias.</p>
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <button className={btnPrimary} disabled={isPending} onClick={() => pay('PIX')}>Pagar com Pix</button>
          <button className={btnSecondary} disabled={isPending} onClick={() => pay('CREDIT_CARD')}>Pagar com cartão</button>
        </div>
        {props.paymentUrl && (
          <p className="mt-4 text-xs text-gray-500">
            Já gerou a cobrança ({props.paymentMethod === 'PIX' ? 'Pix' : 'cartão'})?{' '}
            <a href={props.paymentUrl} target="_blank" rel="noopener noreferrer" className="underline">Abrir de novo</a>
          </p>
        )}
        <p className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500" role="status">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-amber-400" aria-hidden="true" />
          A confirmação aparece aqui automaticamente.
        </p>
        {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
        {props.isMockPayment && (
          <button
            className={`${btnSecondary} mt-5`}
            onClick={() =>
              startTransition(async () => {
                const r = await simulatePaymentAction(props.token)
                if (r.error) setError(r.error)
                else router.refresh()
              })
            }
          >
            Simular pagamento (desenvolvimento)
          </button>
        )}
      </div>
    </div>
  )
}
