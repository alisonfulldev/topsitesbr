'use client'

import { useState, useTransition } from 'react'
import { createUser, toggleUserActive, resetPassword } from '../actions'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { Modal, ModalActions } from '@/components/ui/modal'

type Role = 'admin' | 'client'

type User = {
  id: string
  name: string
  email: string
  role: Role
  active: boolean
  mustChangePassword: boolean
  lastLoginAt: string | null
  createdAt: string
  client: { id: string; name: string } | null
}

type Client = {
  id: string
  name: string
  email: string
}

type TempPass = { userId: string; userName: string; password: string }

const ROLE_LABEL: Record<Role, string> = { admin: 'Admin', client: 'Cliente' }

const INPUT =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent'

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

export function UsersClient({
  users,
  clients,
}: {
  users: User[]
  clients: Client[]
}) {
  const [isPending, startTransition] = useTransition()
  const [showModal, setShowModal] = useState(false)
  const [formError, setFormError] = useState('')
  const [tempPasswords, setTempPasswords] = useState<TempPass[]>([])
  const [confirmResetId, setConfirmResetId] = useState<string | null>(null)

  const [form, setForm] = useState<{
    name: string
    email: string
    password: string
    role: Role
    clientId: string
  }>({ name: '', email: '', password: '', role: 'client', clientId: '' })

  function openModal() {
    setForm({ name: '', email: '', password: '', role: 'client', clientId: '' })
    setFormError('')
    setShowModal(true)
  }

  function handleCreate() {
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setFormError('Preencha todos os campos obrigatórios.')
      return
    }
    setFormError('')
    startTransition(async () => {
      const result = await createUser({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        clientId: form.clientId || null,
      })
      if (result?.error) {
        setFormError(result.error)
      } else {
        setShowModal(false)
      }
    })
  }

  function handleToggle(id: string, currentActive: boolean) {
    startTransition(() => toggleUserActive(id, !currentActive))
  }

  function handleReset(user: User) {
    setConfirmResetId(null)
    startTransition(async () => {
      const result = await resetPassword(user.id)
      setTempPasswords((prev) => [
        ...prev.filter((t) => t.userId !== user.id),
        { userId: user.id, userName: user.name, password: result.tempPassword },
      ])
    })
  }

  return (
    <>
      {/* Temp password alerts */}
      {tempPasswords.length > 0 && (
        <div className="mb-4 space-y-2">
          {tempPasswords.map((t) => (
            <div
              key={t.userId}
              className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm"
            >
              <div className="flex-1">
                <span className="text-amber-800">
                  Nova senha para <strong>{t.userName}</strong>:{' '}
                </span>
                <code className="font-mono bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded select-all">
                  {t.password}
                </code>
                <span className="text-amber-600 text-xs ml-2">
                  Copie antes de fechar — não será exibida novamente.
                </span>
              </div>
              <button
                onClick={() =>
                  setTempPasswords((prev) => prev.filter((p) => p.userId !== t.userId))
                }
                className="text-amber-600 hover:text-amber-800 font-medium"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <p className="text-sm text-gray-500">
            {users.length} {users.length === 1 ? 'usuário' : 'usuários'}
          </p>
          <Button variant="primary" size="sm" onClick={openModal}>
            + Novo Usuário
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Nome', 'E-mail', 'Papel', 'Cliente vinculado', 'Último acesso', 'Status', 'Ações'].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState title="Nenhum usuário cadastrado ainda." className="py-10" />
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/60">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      <span className="inline-flex items-center gap-2">
                        {user.name}
                        {user.mustChangePassword && (
                          <Badge variant="warning">Senha temporária</Badge>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={user.role === 'admin' ? 'purple' : 'info'}>
                        {ROLE_LABEL[user.role]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {user.client?.name ?? <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {user.lastLoginAt
                        ? new Date(user.lastLoginAt).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={user.active ? 'success' : 'error'}>
                        {user.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 justify-end">
                        {confirmResetId === user.id ? (
                          <span className="text-xs text-gray-500">
                            Confirmar reset?{' '}
                            <button
                              onClick={() => handleReset(user)}
                              disabled={isPending}
                              className="text-red-600 hover:underline font-medium"
                            >
                              Sim
                            </button>
                            {' / '}
                            <button
                              onClick={() => setConfirmResetId(null)}
                              className="text-gray-500 hover:underline"
                            >
                              Não
                            </button>
                          </span>
                        ) : (
                          <button
                            onClick={() => setConfirmResetId(user.id)}
                            disabled={isPending}
                            className="text-xs text-gray-500 hover:text-gray-700 underline underline-offset-2"
                          >
                            Resetar senha
                          </button>
                        )}
                        <button
                          onClick={() => handleToggle(user.id, user.active)}
                          disabled={isPending}
                          className={`text-xs underline underline-offset-2 ${
                            user.active
                              ? 'text-red-500 hover:text-red-700'
                              : 'text-green-600 hover:text-green-800'
                          }`}
                        >
                          {user.active ? 'Desativar' : 'Ativar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal — Novo Usuário */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Novo Usuário">
        <div className="space-y-4 mt-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {formError}
            </div>
          )}

          <Field label="Nome" required>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Nome completo"
              className={INPUT}
            />
          </Field>

          <Field label="E-mail" required>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="email@exemplo.com"
              className={INPUT}
            />
          </Field>

          <Field label="Senha temporária" required>
            <input
              type="text"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="Senha a ser entregue ao usuário"
              className={`${INPUT} font-mono`}
            />
          </Field>

          <Field label="Papel" required>
            <select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))}
              className={INPUT}
            >
              <option value="client">Cliente</option>
              <option value="admin">Admin</option>
            </select>
          </Field>

          {form.role === 'client' && (
            <Field label="Vincular ao cliente">
              <select
                value={form.clientId}
                onChange={(e) => setForm((f) => ({ ...f, clientId: e.target.value }))}
                className={INPUT}
              >
                <option value="">— Nenhum (vincular depois) —</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.email})
                  </option>
                ))}
              </select>
            </Field>
          )}
        </div>

        <ModalActions>
          <Button variant="secondary" size="md" fullWidth onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="md"
            fullWidth
            onClick={handleCreate}
            loading={isPending}
          >
            Criar Usuário
          </Button>
        </ModalActions>
      </Modal>
    </>
  )
}
