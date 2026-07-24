'use client'

import { useState, useTransition } from 'react'
import { requestPasswordReset } from '../actions'

export function EsqueciSenhaForm() {
  const [sent, setSent] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const form = e.currentTarget
    const email = (form.elements.namedItem('email') as HTMLInputElement).value

    startTransition(async () => {
      await requestPasswordReset(email)
      // Always show the same message regardless of whether the email exists (security)
      setSent(true)
    })
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-5 py-6 text-center">
        <div className="mb-3 text-2xl">📬</div>
        <p className="text-sm text-zinc-300 leading-relaxed">
          Se o e-mail estiver cadastrado, enviaremos as instruções para
          redefinição de senha em breve.
        </p>
        <p className="mt-3 text-xs text-zinc-600">
          Verifique também a pasta de spam.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="block text-xs font-semibold uppercase tracking-widest text-zinc-500"
        >
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="seu@email.com"
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3.5 text-sm text-white placeholder:text-zinc-600 transition-all focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-brand px-4 py-3.5 text-sm font-bold text-black tracking-wide hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-black disabled:cursor-not-allowed disabled:opacity-50 transition-all inline-flex items-center justify-center gap-2"
        >
          {isPending && (
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {isPending ? 'Enviando…' : 'Enviar instruções'}
        </button>
      </div>
    </form>
  )
}
