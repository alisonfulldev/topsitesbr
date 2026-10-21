'use client'

import { useRef, useState, type FormEvent } from 'react'
import { SITE_TYPES } from '@/lib/marketing'
import { requestContactAction } from '@/lib/marketing-actions'

type Status = 'idle' | 'sending' | 'success' | 'error'
type Field = 'name' | 'email' | 'phone' | 'siteType' | 'message'

const inputClass = 'w-full rounded-xl border border-black/20 bg-white px-4 py-3.5 text-base text-black placeholder:text-black/45 transition-colors hover:border-black/35 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/15 aria-[invalid=true]:border-red-700'
const labelClass = 'mb-2 block text-sm font-semibold text-black'

// Máscara brasileira: (DD) 99999-9999. Números com "+" ficam livres (internacionais).
function formatPhone(value: string) {
  if (value.trim().startsWith('+')) return '+' + value.replace(/[^\d ]/g, '').slice(0, 20)
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits.length ? '(' + digits : ''
  const ddd = digits.slice(0, 2)
  const rest = digits.slice(2)
  const split = rest.length > 8 ? 5 : 4
  return '(' + ddd + ') ' + rest.slice(0, split) + (rest.length > split ? '-' + rest.slice(split) : '')
}

function validate(data: Record<Field, string>) {
  const errors: Partial<Record<Field, string>> = {}
  if (data.name.trim().length < 3) errors.name = 'Informe seu nome completo.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) errors.email = 'Informe um e-mail válido.'
  const digits = data.phone.replace(/\D/g, '').length
  if (digits < 10 || digits > 15) errors.phone = 'Informe um telefone com DDD (ou com código do país).'
  if (!SITE_TYPES.includes(data.siteType as (typeof SITE_TYPES)[number])) errors.siteType = 'Escolha o tipo de site.'
  if (data.message.trim().length < 10) errors.message = 'Conte um pouco mais sobre o projeto (mínimo de 10 caracteres).'
  return errors
}

export function ContactForm() {
  const startedAt = useRef(Date.now())
  const [status, setStatus] = useState<Status>('idle')
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({})
  const [phone, setPhone] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status === 'sending') return
    const form = event.currentTarget
    const formData = new FormData(form)
    const data = {
      name: String(formData.get('name') ?? ''),
      email: String(formData.get('email') ?? ''),
      phone,
      siteType: String(formData.get('siteType') ?? ''),
      message: String(formData.get('message') ?? ''),
    }
    const found = validate(data)
    setErrors(found)
    const firstInvalid = Object.keys(found)[0]
    if (firstInvalid) {
      form.querySelector<HTMLElement>('[name="' + firstInvalid + '"]')?.focus()
      return
    }

    setStatus('sending')
    try {
      const result = await requestContactAction({
        ...data,
        siteType: data.siteType as (typeof SITE_TYPES)[number],
        website: String(formData.get('website') ?? ''),
        startedAt: startedAt.current,
      })
      if (!result.ok) throw new Error(result.error)
      form.reset()
      setPhone('')
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  const fieldProps = (name: Field) => ({
    id: 'contato-' + name,
    name,
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? 'contato-' + name + '-erro' : undefined,
  })
  const fieldError = (name: Field) => errors[name] && (
    <p id={'contato-' + name + '-erro'} className="mt-2 text-sm font-medium text-red-800">{errors[name]}</p>
  )

  if (status === 'success') {
    return (
      <div role="status" className="rounded-2xl border border-black/10 bg-[#FAFAF7] p-8 text-center sm:p-10">
        <p className="text-xl font-semibold text-black">Recebemos o seu pedido.</p>
        <p className="mt-3 leading-relaxed text-black/70">Em breve entraremos em contato pelo telefone ou e-mail informado para conversar sobre o seu projeto.</p>
        <button type="button" onClick={() => { startedAt.current = Date.now(); setStatus('idle') }} className="mt-6 text-sm font-semibold text-black underline underline-offset-4 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40">
          Enviar outro pedido
        </button>
      </div>
    )
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="grid gap-5" aria-busy={status === 'sending'}>
      {/* Campo isca para robôs: invisível e fora da ordem de tabulação */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="contato-website">Não preencha este campo</label>
        <input id="contato-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label htmlFor="contato-name" className={labelClass}>Nome completo</label>
        <input {...fieldProps('name')} type="text" required autoComplete="name" maxLength={120} className={inputClass} />
        {fieldError('name')}
      </div>
      <div>
        <label htmlFor="contato-email" className={labelClass}>E-mail</label>
        <input {...fieldProps('email')} type="email" required inputMode="email" autoComplete="email" maxLength={160} placeholder="seu@email.com.br" className={inputClass} />
        {fieldError('email')}
      </div>
      <div>
        <label htmlFor="contato-phone" className={labelClass}>Telefone / WhatsApp</label>
        <input {...fieldProps('phone')} type="tel" required inputMode="tel" autoComplete="tel" placeholder="(00) 00000-0000" value={phone} onChange={(event) => setPhone(formatPhone(event.target.value))} className={inputClass} />
        {fieldError('phone')}
      </div>
      <div>
        <label htmlFor="contato-siteType" className={labelClass}>Qual tipo de site você deseja?</label>
        <select {...fieldProps('siteType')} required defaultValue="" className={inputClass + ' appearance-none bg-[length:1rem] bg-[right_1rem_center] bg-no-repeat pr-11'} style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")" }}>
          <option value="" disabled>Selecione uma opção</option>
          {SITE_TYPES.map((type) => <option key={type} value={type}>{type === 'Outro' ? 'Outros' : type}</option>)}
        </select>
        {fieldError('siteType')}
      </div>
      <div>
        <label htmlFor="contato-message" className={labelClass}>Conte sobre seu projeto</label>
        <textarea {...fieldProps('message')} required rows={5} maxLength={2000} placeholder="Conte um pouco sobre sua empresa, o que deseja apresentar e quais são seus objetivos com o site." className={inputClass + ' resize-y'} />
        {fieldError('message')}
      </div>

      <div className="flex flex-col items-center gap-4 text-center">
        <button type="submit" disabled={status === 'sending'} className="inline-flex h-14 w-full items-center justify-center rounded-xl bg-[#FDD900] px-8 text-base font-semibold text-black transition-colors hover:bg-[#E8C700] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-wait disabled:opacity-70 sm:w-auto">
          {status === 'sending' ? 'Enviando…' : 'Solicitar contato'}
        </button>
        <p role="alert" className="text-sm font-medium text-red-800">
          {status === 'error' && 'Não foi possível enviar agora. Verifique sua conexão e tente novamente.'}
        </p>
      </div>
    </form>
  )
}
