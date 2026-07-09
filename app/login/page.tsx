'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

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

    // Busca a sessão para redirecionar pelo role
    const sessionRes = await fetch('/api/auth/session')
    const session = await sessionRes.json()

    if (session?.user?.role === 'admin') {
      router.push('/admin')
    } else {
      router.push('/painel')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="seu@email.com"
          className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
      >
        {loading ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">TopSites ADM</h1>
          <p className="mt-1 text-sm text-gray-500">Entre com sua conta para continuar</p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
          <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-gray-100" />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  )
}
