'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient, updateClient, lookupReferralCode } from '../actions'

type Mode = 'create' | 'edit'

type RecentCode = {
  code: string
  clientName: string
  lastClickAt: string
}

type InitialData = {
  name: string
  email: string
  phone: string
  document: string
  siteEntryFee?: number | null
}

interface Props {
  mode: Mode
  clientId?: string
  initialData?: InitialData
  recentCodes?: RecentCode[]
}

const INPUT =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent'

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  )
}

export function ClientForm({ mode, clientId, initialData, recentCodes = [] }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const [name, setName] = useState(initialData?.name ?? '')
  const [email, setEmail] = useState(initialData?.email ?? '')
  const [phone, setPhone] = useState(initialData?.phone ?? '')
  const [document, setDocument] = useState(initialData?.document ?? '')
  const [siteEntryFee, setSiteEntryFee] = useState(
    initialData?.siteEntryFee != null ? String(initialData.siteEntryFee) : ''
  )

  // Referral code (create only)
  const [referralCode, setReferralCode] = useState('')
  const [referralStatus, setReferralStatus] = useState<
    'idle' | 'valid' | 'invalid' | 'checking'
  >('idle')
  const [referralName, setReferralName] = useState('')

  // Create login (create only)
  const [createLogin, setCreateLogin] = useState(false)
  const [loginPassword, setLoginPassword] = useState('')

  async function handleValidateReferral() {
    const code = referralCode.trim()
    if (!code) {
      setReferralStatus('idle')
      setReferralName('')
      return
    }
    setReferralStatus('checking')
    const result = await lookupReferralCode(code)
    if (result.found) {
      setReferralStatus('valid')
      setReferralName(result.referrerName ?? '')
    } else {
      setReferralStatus('invalid')
      setReferralName('')
    }
  }

  function handleSubmit() {
    setError('')

    if (mode === 'create') {
      if (referralCode.trim() && referralStatus !== 'valid') {
        setError('Valide o código de indicação antes de salvar.')
        return
      }
      if (createLogin && !loginPassword.trim()) {
        setError('Informe a senha para o login.')
        return
      }
      startTransition(async () => {
        const result = await createClient({
          name,
          email,
          phone: phone || undefined,
          document: document || undefined,
          referralCode: referralCode.trim() || undefined,
          createUserPassword: createLogin ? loginPassword : undefined,
          siteEntryFee: siteEntryFee ? parseFloat(siteEntryFee) : undefined,
        })
        if (result?.error) {
          setError(result.error)
        } else {
          router.push(`/admin/clientes/${result.clientId}`)
        }
      })
    } else {
      startTransition(async () => {
        const result = await updateClient(clientId!, {
          name,
          email,
          phone: phone || undefined,
          document: document || undefined,
          siteEntryFee: siteEntryFee ? parseFloat(siteEntryFee) : undefined,
        })
        if (result?.error) {
          setError(result.error)
        } else {
          router.push(`/admin/clientes/${clientId}`)
        }
      })
    }
  }

  const referralInputBorder =
    referralStatus === 'valid'
      ? 'border-green-400 focus:ring-green-400'
      : referralStatus === 'invalid'
      ? 'border-red-400 focus:ring-red-400'
      : 'border-gray-300 focus:ring-brand'

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-lg">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <Field label="Nome" required>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome completo"
            className={INPUT}
          />
        </Field>

        <Field label="E-mail" required>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@exemplo.com"
            className={INPUT}
          />
        </Field>

        <Field label="Telefone / WhatsApp">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(00) 90000-0000"
            className={INPUT}
          />
        </Field>

        <Field label="CPF / CNPJ">
          <input
            type="text"
            value={document}
            onChange={(e) => setDocument(e.target.value)}
            placeholder="000.000.000-00"
            className={INPUT}
          />
        </Field>

        <Field
          label="Valor pago pelo site (entrada)"
          hint="Quanto o cliente pagou fora do sistema para ter o site criado (ex: R$97, R$500…)"
        >
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">
              R$
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={siteEntryFee}
              onChange={(e) => setSiteEntryFee(e.target.value)}
              placeholder="97,00"
              className={`${INPUT} pl-9`}
            />
          </div>
        </Field>

        {/* Referral code — only on create */}
        {mode === 'create' && (
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Indicação (opcional)
            </p>
            <Field
              label="Código de indicação"
              hint="Código que veio na conversa do WhatsApp (ref: XXXXXX)"
            >
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    list="recent-codes-list"
                    value={referralCode}
                    onChange={(e) => {
                      setReferralCode(e.target.value.toUpperCase())
                      setReferralStatus('idle')
                      setReferralName('')
                    }}
                    onBlur={handleValidateReferral}
                    placeholder="Ex: JOA2X9K"
                    className={`${INPUT} font-mono ${referralInputBorder}`}
                  />
                  <datalist id="recent-codes-list">
                    {recentCodes.map((r) => (
                      <option key={r.code} value={r.code}>
                        {r.clientName} —{' '}
                        {new Date(r.lastClickAt).toLocaleDateString('pt-BR')}
                      </option>
                    ))}
                  </datalist>
                </div>
                <button
                  type="button"
                  onClick={handleValidateReferral}
                  disabled={!referralCode.trim() || referralStatus === 'checking'}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                >
                  {referralStatus === 'checking' ? '...' : 'Validar'}
                </button>
              </div>

              {referralStatus === 'valid' && (
                <p className="mt-1.5 text-xs text-green-700">
                  ✓ Indicador: <strong>{referralName}</strong>
                </p>
              )}
              {referralStatus === 'invalid' && (
                <p className="mt-1.5 text-xs text-red-600">
                  Código não encontrado.
                </p>
              )}

              {recentCodes.length > 0 && (
                <div className="mt-3 space-y-1">
                  <p className="text-xs text-gray-400">
                    Cliques recentes (últimos 7 dias):
                  </p>
                  {recentCodes.map((r) => (
                    <button
                      key={r.code}
                      type="button"
                      onClick={() => {
                        setReferralCode(r.code)
                        setReferralStatus('idle')
                      }}
                      className="block w-full text-left px-3 py-1.5 rounded-md hover:bg-gray-50 text-xs text-gray-600 border border-gray-100"
                    >
                      <code className="font-mono text-brand-text">{r.code}</code>
                      <span className="ml-2 text-gray-400">{r.clientName}</span>
                      <span className="ml-2 text-gray-300">
                        {new Date(r.lastClickAt).toLocaleDateString('pt-BR')}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </Field>
          </div>
        )}

        {/* Create login — only on create */}
        {mode === 'create' && (
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Acesso ao painel
            </p>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={createLogin}
                onChange={(e) => setCreateLogin(e.target.checked)}
                className="rounded border-gray-300 text-brand-text focus:ring-brand"
              />
              <span className="text-sm text-gray-700">
                Criar login de acesso agora
              </span>
            </label>

            {createLogin && (
              <div className="mt-3">
                <Field
                  label="Senha temporária"
                  required
                  hint="Nome e e-mail serão usados do cliente acima"
                >
                  <input
                    type="text"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Senha a ser entregue ao cliente"
                    className={`${INPUT} font-mono`}
                  />
                </Field>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand text-brand-dark text-sm rounded-lg hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending && (
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {isPending
            ? 'Salvando...'
            : mode === 'create'
            ? 'Cadastrar Cliente'
            : 'Salvar Alterações'}
        </button>
      </div>
    </div>
  )
}
