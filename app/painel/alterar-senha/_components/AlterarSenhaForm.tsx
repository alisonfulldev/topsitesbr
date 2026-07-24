'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { changePassword } from '../actions'
import { Button } from '@/components/ui/button'

const INPUT =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent'

function getStrength(password: string): { label: string; color: string; width: string } {
  if (password.length === 0) return { label: '', color: '', width: '0%' }

  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 2) return { label: 'Fraca', color: 'bg-red-400', width: '33%' }
  if (score <= 3) return { label: 'Média', color: 'bg-yellow-400', width: '66%' }
  return { label: 'Forte', color: 'bg-green-500', width: '100%' }
}

export function AlterarSenhaForm({ mustChangePassword }: { mustChangePassword: boolean }) {
  const router = useRouter()
  const { update: updateSession } = useSession()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const strength = getStrength(newPassword)

  function handleSubmit() {
    setError('')
    setSuccessMsg('')

    startTransition(async () => {
      const result = await changePassword({
        currentPassword: mustChangePassword ? undefined : currentPassword,
        newPassword,
        confirmPassword,
      })

      if (result.error) {
        setError(result.error)
      } else {
        setSuccessMsg('Senha alterada com sucesso!')
        // Refresh session JWT so mustChangePassword flag is cleared in the token
        await updateSession()
        if (mustChangePassword) {
          // Small delay so user can see the success message
          setTimeout(() => router.push('/painel'), 1200)
        } else {
          setCurrentPassword('')
          setNewPassword('')
          setConfirmPassword('')
        }
      }
    })
  }

  return (
    <div className="space-y-5">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          {successMsg}
        </div>
      )}

      {!mustChangePassword && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Senha atual <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Digite sua senha atual"
            className={INPUT}
            autoComplete="current-password"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nova senha <span className="text-red-500">*</span>
        </label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Mínimo 8 caracteres"
          className={INPUT}
          autoComplete="new-password"
        />
        {newPassword.length > 0 && (
          <div className="mt-2">
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                style={{ width: strength.width }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Força: {strength.label}</p>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Confirmar nova senha <span className="text-red-500">*</span>
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repita a nova senha"
          className={INPUT}
          autoComplete="new-password"
        />
        {confirmPassword.length > 0 && newPassword !== confirmPassword && (
          <p className="text-xs text-red-500 mt-1">As senhas não coincidem.</p>
        )}
      </div>

      <Button
        variant="primary"
        size="md"
        fullWidth
        onClick={handleSubmit}
        loading={isPending}
      >
        {mustChangePassword ? 'Definir senha' : 'Alterar senha'}
      </Button>
    </div>
  )
}
