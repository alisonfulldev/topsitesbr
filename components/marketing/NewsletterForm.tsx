'use client'

import Link from 'next/link'
import { useRef, useState, type FormEvent } from 'react'
import { subscribeNewsletterAction } from '@/lib/marketing-actions'

type Status = 'idle' | 'sending' | 'success' | 'error' | 'invalid' | 'consent'

const messages: Partial<Record<Status, string>> = {
  invalid: 'Informe um e-mail válido.',
  consent: 'Marque a autorização para receber as novidades.',
  error: 'Não foi possível concluir a inscrição. Tente novamente.',
}

export function NewsletterForm() {
  const startedAt = useRef(Date.now())
  const [status, setStatus] = useState<Status>('idle')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status === 'sending') return
    const form = event.currentTarget
    const formData = new FormData(form)
    const email = String(formData.get('email') ?? '').trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setStatus('invalid')
    if (formData.get('consent') !== 'on') return setStatus('consent')

    setStatus('sending')
    try {
      const result = await subscribeNewsletterAction({ email, consent: true, website: String(formData.get('website') ?? ''), startedAt: startedAt.current })
      if (!result.ok) throw new Error(result.error)
      form.reset()
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return <p role="status" className="text-sm leading-relaxed text-white">Inscrição confirmada. Você pode cancelar o recebimento a qualquer momento.</p>
  }

  return (
    <form noValidate onSubmit={handleSubmit} aria-busy={status === 'sending'}>
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="newsletter-website">Não preencha este campo</label>
        <input id="newsletter-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <label htmlFor="newsletter-email" className="sr-only">E-mail</label>
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <input id="newsletter-email" name="email" type="email" required autoComplete="email" placeholder="seu@email.com.br" maxLength={160} aria-invalid={status === 'invalid' || undefined} aria-describedby="newsletter-feedback" className="h-12 w-full min-w-0 rounded-lg border sm:flex-1 border-white/30 bg-white/[0.06] px-4 text-base text-white placeholder:text-white/55 transition-colors hover:border-white/50 focus:border-[#FDD900] focus:outline-none focus:ring-2 focus:ring-[#FDD900]/25" />
        <button type="submit" disabled={status === 'sending'} className="h-12 w-full shrink-0 rounded-lg bg-[#FDD900] px-5 text-sm font-semibold text-black transition-colors hover:bg-[#E8C700] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDD900] focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-wait disabled:opacity-70 sm:w-auto">
          {status === 'sending' ? 'Enviando…' : 'Quero receber novidades'}
        </button>
      </div>
      <label className="mx-auto mt-4 flex max-w-md items-start justify-center gap-3 text-left text-xs leading-relaxed text-white">
        <input name="consent" type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-[#FDD900]" />
        <span>Autorizo a Top Site a me enviar e-mails com novidades. Posso cancelar a qualquer momento. Veja a <Link href="/privacidade" className="underline underline-offset-2 hover:text-[#FDD900]">Política de Privacidade</Link>.</span>
      </label>
      <p id="newsletter-feedback" role="alert" className="mt-2 text-center text-xs font-medium text-red-300">{messages[status]}</p>
    </form>
  )
}
