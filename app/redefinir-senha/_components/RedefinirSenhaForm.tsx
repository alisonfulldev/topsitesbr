'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { resetPassword } from '../actions'

function getStrength(password: string): { label: string; color: string; width: string } {
  if (password.length === 0) return { label: '', color: '', width: '0%' }

  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 2) return { label: 'Fraca', color: 'bg-red-500', width: '33%' }
  if (score <= 3) return { label: 'Média', color: 'bg-yellow-400', width: '66%' }
  return { label: 'Forte', color: 'bg-green-500', width: '100%' }
}

export function RedefinirSenhaForm({ token }: { token: string }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const strength = getStrength(newPassword)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    startTransition(async () => {
      const result = await resetPassword(token, newPassword, confirmPassword)
      if ('error' in result) {
        setError(result.error)
      } else {
        setSuccess(true)
      }
    })
  }

  if (success) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-5 py-6 text-center">
        <div className="mb-3 text-2xl">✅</div>
        <p className="text-sm font-semibold text-white mb-1">Senha redefinida com sucesso!</p>
        <p className="text-xs text-zinc-500 mb-5">
          Sua nova senha foi salva. Agora você pode acessar sua conta.
        </p>
        <Link
          href="/login"
          className="inline-block rounded-xl bg-brand px-6 py-3 text-sm font-bold text-black tracking-wide hover:bg-brand-hover transition-all"
        >
          Ir para o login
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl bg-red-950/40 border border-red-900/40 px-4 py-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Nova senha */}
      <div className="space-y-1.5">
        <label
          htmlFor="newPassword"
          className="block text-xs font-semibold uppercase tracking-widest text-zinc-500"
        >
          Nova senha
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3.5 text-sm text-white placeholder:text-zinc-600 transition-all focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
        {newPassword.length > 0 && (
          <div className="mt-1.5">
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                style={{ width: strength.width }}
              />
            </div>
            <p className="text-xs text-zinc-600 mt-1">Força: {strength.label}</p>
          </div>
        )}
      </div>

      {/* Confirmar senha */}
      <div className="space-y-1.5">
        <label
          htmlFor="confirmPassword"
          className="block text-xs font-semibold uppercase tracking-widest text-zinc-500"
        >
          Confirmar nova senha
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
          placeholder="Repita a nova senha"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3.5 text-sm text-white placeholder:text-zinc-600 transition-all focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
        {confirmPassword.length > 0 && newPassword !== confirmPassword && (
          <p className="text-xs text-red-500 mt-1">As senhas não coincidem.</p>
        )}
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-brand px-4 py-3.5 text-sm font-bold text-black tracking-wide hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-black disabled:cursor-not-allowed disabled:opacity-50 transition-all"
        >
          {isPending ? 'Redefinindo…' : 'Redefinir senha'}
        </button>
      </div>
    </form>
  )
}
