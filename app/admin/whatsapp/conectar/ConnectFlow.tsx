'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Button, Card, buttonVariantClass } from '@/components/ui'
import { finishConnectAction, type ConnectStep } from '../actions'

// Cadastro incorporado (Embedded Signup) da Meta com coexistência: o número segue no app do celular.
// Docs: developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users

interface FBLoginResponse {
  authResponse?: { code?: string } | null
  status?: string
}

declare global {
  interface Window {
    FB?: {
      init: (opts: Record<string, unknown>) => void
      login: (cb: (res: FBLoginResponse) => void, opts: Record<string, unknown>) => void
    }
    fbAsyncInit?: () => void
  }
}

interface SessionInfo {
  wabaId: string | null
  phoneNumberId: string | null
}

type Phase = 'loading' | 'ready' | 'popup' | 'finishing' | 'done' | 'error'

export function ConnectFlow({ appId, configId, version }: { appId: string; configId: string; version: string }) {
  const [phase, setPhase] = useState<Phase>('loading')
  const [events, setEvents] = useState<string[]>([])
  const [steps, setSteps] = useState<ConnectStep[]>([])
  const [error, setError] = useState('')
  const session = useRef<SessionInfo | null>(null)
  const code = useRef<string | null>(null)
  const finished = useRef(false)

  const log = (line: string) => setEvents((e) => [...e, line])

  // Conclui quando já temos o código (FB.login) e os dados da conta (evento de mensagem)
  const tryFinish = useCallback(() => {
    if (finished.current || !code.current || !session.current) return
    finished.current = true
    setPhase('finishing')
    finishConnectAction({ code: code.current, wabaId: session.current.wabaId, phoneNumberId: session.current.phoneNumberId })
      .then((res) => {
        if (!res.ok) {
          setError(res.error)
          setPhase('error')
          return
        }
        setSteps(res.steps)
        setPhase(res.steps.some((s) => s.label === 'Erro') ? 'error' : 'done')
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : String(err))
        setPhase('error')
      })
  }, [])

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (!event.origin.endsWith('facebook.com')) return
      let data: { type?: string; event?: string; data?: Record<string, unknown> }
      try {
        data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
      } catch {
        return
      }
      if (data?.type !== 'WA_EMBEDDED_SIGNUP') return
      const d = data.data ?? {}
      if (data.event === 'FINISH' || data.event === 'FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING') {
        log(data.event === 'FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING' ? 'Meta: app WhatsApp Business conectado (coexistência).' : 'Meta: cadastro concluído.')
        session.current = { wabaId: (d.waba_id as string) ?? null, phoneNumberId: (d.phone_number_id as string) ?? null }
        tryFinish()
      } else if (data.event === 'CANCEL') {
        log(`Meta: cadastro cancelado na etapa ${String(d.current_step ?? '?')}.`)
      } else if (data.event === 'ERROR') {
        log(`Meta: erro ${String(d.error_code ?? '')} — ${String(d.error_message ?? '')}`)
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [tryFinish])

  // Carrega o SDK do Facebook
  useEffect(() => {
    if (window.FB) {
      setPhase('ready')
      return
    }
    window.fbAsyncInit = () => {
      window.FB!.init({ appId, autoLogAppEvents: true, xfbml: false, version })
      setPhase('ready')
    }
    const script = document.createElement('script')
    script.src = 'https://connect.facebook.net/pt_BR/sdk.js'
    script.async = true
    script.defer = true
    script.crossOrigin = 'anonymous'
    script.onerror = () => {
      setError('Não foi possível carregar o SDK do Facebook (bloqueador de anúncios?).')
      setPhase('error')
    }
    document.body.appendChild(script)
  }, [appId, version])

  const launch = () => {
    if (!window.FB) return
    setPhase('popup')
    setError('')
    // O SDK do Facebook não aceita callback async
    window.FB.login(
      (res) => {
        if (res.authResponse?.code) {
          code.current = res.authResponse.code
          log('Meta: autorização recebida.')
          tryFinish()
          // Em alguns casos o evento com o waba_id chega antes/depois; se não vier, avisamos
          setTimeout(() => {
            if (!finished.current && !session.current) {
              setError('A Meta autorizou, mas não informou a conta do WhatsApp. Tente de novo e vá até o fim do fluxo.')
              setPhase('error')
            }
          }, 8000)
        } else {
          log('Janela fechada sem concluir.')
          setPhase('ready')
        }
      },
      {
        config_id: configId,
        response_type: 'code',
        override_default_response_type: true,
        extras: { setup: {}, featureType: 'whatsapp_business_app_onboarding', sessionInfoVersion: '3' },
      },
    )
  }

  return (
    <Card>
      {phase === 'done' ? (
        <p className="mb-3 text-sm font-semibold text-green-800">Número conectado!</p>
      ) : (
        <Button onClick={launch} loading={phase === 'loading' || phase === 'popup' || phase === 'finishing'} disabled={phase !== 'ready' && phase !== 'error'}>
          {phase === 'finishing' ? 'Finalizando…' : phase === 'popup' ? 'Aguardando a janela da Meta…' : 'Conectar meu WhatsApp Business'}
        </Button>
      )}

      {steps.length > 0 && (
        <ul className="mt-4 space-y-1 text-sm">
          {steps.map((s, i) => (
            <li key={i} className={s.ok ? 'text-gray-800' : 'text-red-700'}>
              {s.ok ? '✅' : '⚠️'} {s.label}{s.detail ? ` — ${s.detail}` : ''}
            </li>
          ))}
        </ul>
      )}
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
      {events.length > 0 && (
        <details className="mt-4 text-xs text-gray-500">
          <summary className="cursor-pointer">Detalhes técnicos</summary>
          <ul className="mt-1 space-y-0.5">{events.map((e, i) => <li key={i}>{e}</li>)}</ul>
        </details>
      )}
      {phase === 'done' && (
        <div className="mt-4 flex gap-2">
          <Link href="/admin/whatsapp" className={buttonVariantClass('primary', 'sm')}>Ver contatos</Link>
          <Link href="/admin/whatsapp/configuracoes" className={buttonVariantClass('secondary', 'sm')}>Configurações</Link>
        </div>
      )}
    </Card>
  )
}
