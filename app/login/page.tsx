'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

const ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: 'E-mail ou senha inválidos.',
  inactive: 'Sua conta está desativada. Entre em contato com o suporte.',
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlError = searchParams.get('error') ?? ''

  const [error, setError] = useState(ERROR_MESSAGES[urlError] ?? '')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const form = e.currentTarget
    const email = (form.elements.namedItem('email') as HTMLInputElement).value
    const password = (form.elements.namedItem('password') as HTMLInputElement).value

    const result = await signIn('credentials', { email, password, redirect: false })

    if (result?.error) {
      setError(ERROR_MESSAGES[result.error] ?? 'Erro ao entrar. Tente novamente.')
      setLoading(false)
      return
    }

    const sessionRes = await fetch('/api/auth/session')
    const session = await sessionRes.json()

    if (session?.user?.role === 'admin') {
      router.push('/admin')
    } else {
      router.push('/painel')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl bg-red-950/40 border border-red-900/40 px-4 py-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-widest text-zinc-500">
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

      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3.5 text-sm text-white placeholder:text-zinc-600 transition-all focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-brand px-4 py-3.5 text-sm font-bold text-black tracking-wide hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-black disabled:cursor-not-allowed disabled:opacity-50 transition-all"
        >
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </div>

      <div className="text-center">
        <Link
          href="/esqueci-senha"
          className="text-xs text-zinc-600 hover:text-zinc-400 hover:underline transition-colors"
        >
          Esqueci minha senha
        </Link>
      </div>
    </form>
  )
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-dark px-4">
      <div className="w-full max-w-xs">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <Image src="/logo.png" alt="TOP SITE" width={200} height={68} className="h-16 w-auto" priority />
        </div>

        {/* Heading */}
        <div className="mb-8 text-center">
          <p className="text-sm text-zinc-500">Acesse sua conta para continuar</p>
        </div>

        <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-zinc-900" />}>
          <LoginForm />
        </Suspense>

        {/* Legal links */}
        <p className="mt-8 text-center text-xs text-zinc-600">
          <a href="/termos" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-400 hover:underline">
            Termos de Uso
          </a>
          {' · '}
          <a href="/privacidade" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-400 hover:underline">
            Privacidade
          </a>
        </p>
      </div>
    </main>
  )
}
