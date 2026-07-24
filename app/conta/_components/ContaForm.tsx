'use client'

import { useState, useTransition } from 'react'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { updateAccountName, changeAccountPassword } from '@/app/conta/actions'

type Props = {
  user: {
    name: string
    email: string
    role: string
    lastLoginAt: string | null
    mustChangePassword: boolean
  }
}

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

function formatLastLogin(lastLoginAt: string | null): string {
  if (!lastLoginAt) return 'Nunca'
  return new Date(lastLoginAt).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

function roleLabel(role: string): string {
  if (role === 'admin') return 'Administrador'
  return 'Cliente'
}

export function ContaForm({ user }: Props) {
  // ── Name section ─────────────────────────────────────────────────────────────
  const [name, setName] = useState(user.name)
  const [nameError, setNameError] = useState('')
  const [nameSuccess, setNameSuccess] = useState('')
  const [isNamePending, startNameTransition] = useTransition()

  function handleSaveName() {
    setNameError('')
    setNameSuccess('')
    startNameTransition(async () => {
      const result = await updateAccountName(name)
      if (result.error) {
        setNameError(result.error)
      } else {
        setNameSuccess('Nome atualizado com sucesso!')
      }
    })
  }

  // ── Password section ──────────────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [isPasswordPending, startPasswordTransition] = useTransition()

  const strength = getStrength(newPassword)

  function handleChangePassword() {
    setPasswordError('')
    setPasswordSuccess('')
    startPasswordTransition(async () => {
      const result = await changeAccountPassword({
        currentPassword,
        newPassword,
        confirmPassword,
      })

      if (result.error) {
        setPasswordError(result.error)
      } else {
        setPasswordSuccess(
          'Senha alterada com sucesso. Por segurança, você será deslogado em instantes.',
        )
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setTimeout(() => {
          signOut({ callbackUrl: '/login' })
        }, 3000)
      }
    })
  }

  return (
    <div className="space-y-6">

      {/* ── Section A: Personal data ─────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Dados pessoais</h2>

        <div className="space-y-4">
          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">O e-mail não pode ser alterado por aqui.</p>
          </div>

          {/* Role (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Perfil</label>
            <input
              type="text"
              value={roleLabel(user.role)}
              disabled
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
            />
          </div>

          {/* Last login (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Último acesso</label>
            <input
              type="text"
              value={formatLastLogin(user.lastLoginAt)}
              disabled
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
            />
          </div>

          {/* Name (editable) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setNameSuccess('')
              }}
              placeholder="Seu nome completo"
              className={INPUT}
              maxLength={100}
            />
          </div>

          {nameError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {nameError}
            </div>
          )}
          {nameSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              {nameSuccess}
            </div>
          )}

          <Button
            variant="primary"
            size="md"
            onClick={handleSaveName}
            loading={isNamePending}
          >
            Salvar nome
          </Button>
        </div>
      </div>

      {/* ── Section B: Password change ───────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Alterar senha</h2>
        <p className="text-sm text-gray-500 mb-4">Escolha uma senha segura para proteger sua conta.</p>

        <div className="space-y-4">
          {passwordError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              {passwordSuccess}
            </div>
          )}

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
            onClick={handleChangePassword}
            loading={isPasswordPending}
          >
            Alterar senha
          </Button>

          {/* Security note for admins */}
          {user.role === 'admin' && (
            <p className="text-xs text-gray-400 pt-1">
              Para alterar a senha de outros usuários, use a tela de{' '}
              <a href="/admin/usuarios" className="underline hover:text-gray-600 transition-colors">
                Gerenciamento de Usuários
              </a>
              .
            </p>
          )}
        </div>
      </div>

    </div>
  )
}
