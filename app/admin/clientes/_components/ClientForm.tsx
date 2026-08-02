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
  activationFlow?: 'quente' | 'frio'
  entryFlow?: 'whatsapp' | 'proposta'
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
  const [activationFlow, setActivationFlow] = useState<'quente' | 'frio'>(
    initialData?.activationFlow ?? 'frio'
  )
  const [entryFlow, setEntryFlow] = useState<'whatsapp' | 'proposta'>(
    initialData?.entryFlow ?? 'whatsapp'
  )

  // Proposal fields (create + entryFlow=proposta only)
  const [proposalTitle, setProposalTitle] = useState('')
  const [proposalDescription, setProposalDescription] = useState('')
  const [proposalIncludedItems, setProposalIncludedItems] = useState('')
  const [proposalCreationPrice, setProposalCreationPrice] = useState('')

  // Referral code (create only)
  const [referralCode, setReferralCode] = useState('')
  const [referralStatus, setReferralStatus] = useState<
    'idle' | 'valid' | 'invalid' | 'checking'
  >('idle')
  const [referralName, setReferralName] = useState('')

  // Create login (create only)
  const [createLogin, setCreateLogin] = useState(false)
  const [loginPassword, setLoginPassword] = useState('')
  const [paidExternally, setPaidExternally] = useState(false)
  const [externalCreationPrice, setExternalCreationPrice] = useState('')

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
      if (entryFlow === 'whatsapp' && paidExternally && !loginPassword.trim()) {
        setError('Informe a senha temporária para o cliente pago por fora.')
        return
      }
      if (entryFlow === 'proposta') {
        if (!proposalTitle.trim()) {
          setError('Título da proposta é obrigatório.')
          return
        }
        if (!proposalIncludedItems.trim()) {
          setError('Itens incluídos são obrigatórios.')
          return
        }
        if (!proposalCreationPrice || parseFloat(proposalCreationPrice) <= 0) {
          setError('Valor de criação é obrigatório.')
          return
        }
      }
      startTransition(async () => {
        const result = await createClient({
          name,
          email,
          phone: phone || undefined,
          document: document || undefined,
          referralCode: referralCode.trim() || undefined,
          createUserPassword: entryFlow === 'proposta' ? undefined : (createLogin ? loginPassword : undefined),
          siteEntryFee: entryFlow === 'proposta' ? undefined : (siteEntryFee ? parseFloat(siteEntryFee) : undefined),
          activationFlow,
          entryFlow,
          ...(entryFlow === 'proposta' && {
            proposalTitle: proposalTitle.trim(),
            proposalDescription: proposalDescription.trim() || undefined,
            proposalIncludedItems: proposalIncludedItems.trim(),
            proposalCreationPrice: parseFloat(proposalCreationPrice),
          }),
          paidExternally: entryFlow === 'whatsapp' ? paidExternally : undefined,
          externalCreationPrice: paidExternally && externalCreationPrice ? parseFloat(externalCreationPrice) : undefined,
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
          activationFlow,
          entryFlow,
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
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>

        {/* Entry flow */}
        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Forma de entrada
          </p>
          <div className="grid grid-cols-2 gap-2">
            {([
              { value: 'whatsapp', label: 'WhatsApp', desc: 'Chegou pelo WhatsApp / tráfego pago' },
              { value: 'proposta', label: 'Proposta', desc: 'Recebe link de proposta por e-mail' },
            ] as const).map((opt) => (
              <label
                key={opt.value}
                className={`flex flex-col gap-0.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                  entryFlow === opt.value
                    ? 'border-brand bg-brand/5'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="entryFlow"
                  value={opt.value}
                  checked={entryFlow === opt.value}
                  onChange={() => setEntryFlow(opt.value)}
                  className="sr-only"
                />
                <span className="text-sm font-semibold text-gray-800">{opt.label}</span>
                <span className="text-xs text-gray-500">{opt.desc}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Site entry fee — WhatsApp only */}
        {entryFlow === 'whatsapp' && (
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
        )}

        {/* Pago por fora — WhatsApp only */}
        {mode === 'create' && entryFlow === 'whatsapp' && (
          <div className="pt-2 border-t border-gray-100">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={paidExternally}
                onChange={(e) => {
                  setPaidExternally(e.target.checked)
                  if (e.target.checked) setCreateLogin(true)
                }}
                className="mt-0.5 rounded border-gray-300 text-brand-text focus:ring-brand"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Site já pago por fora da plataforma</span>
                <p className="text-xs text-gray-400 mt-0.5">
                  Cria uma proposta de acompanhamento para o cliente, sem cobrança no Asaas.
                </p>
              </div>
            </label>

            {paidExternally && (
              <div className="mt-3">
                <Field label="Valor pago pela criação (R$)" hint="Apenas para registro financeiro — não gera cobrança">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">R$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={externalCreationPrice}
                      onChange={(e) => setExternalCreationPrice(e.target.value)}
                      placeholder="97,00"
                      className={`${INPUT} pl-9`}
                    />
                  </div>
                </Field>
              </div>
            )}
          </div>
        )}

        {/* Proposal details — create + proposta only */}
        {mode === 'create' && entryFlow === 'proposta' && (
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Detalhes da Proposta
            </p>
            <div className="space-y-3">
              <Field label="Título" required hint="Ex: Landing Page para Clínica Odontológica">
                <input
                  type="text"
                  value={proposalTitle}
                  onChange={(e) => setProposalTitle(e.target.value)}
                  placeholder="Título da proposta"
                  className={INPUT}
                />
              </Field>
              <Field label="Descrição" hint="Contexto geral do projeto (opcional)">
                <textarea
                  value={proposalDescription}
                  onChange={(e) => setProposalDescription(e.target.value)}
                  placeholder="Descrição opcional da proposta…"
                  rows={3}
                  className={`${INPUT} resize-none`}
                />
              </Field>
              <Field
                label="Itens incluídos"
                required
                hint="Um item por linha — será exibido como lista para o cliente"
              >
                <textarea
                  value={proposalIncludedItems}
                  onChange={(e) => setProposalIncludedItems(e.target.value)}
                  placeholder={"Landing Page responsiva\nSSL + hospedagem 1 mês grátis\nDomínio personalizado"}
                  rows={5}
                  className={`${INPUT} resize-none font-mono text-xs`}
                />
              </Field>
              <Field label="Valor de criação (R$)" required hint="Preço do projeto para o cliente">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">
                    R$
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={proposalCreationPrice}
                    onChange={(e) => setProposalCreationPrice(e.target.value)}
                    placeholder="197,00"
                    className={`${INPUT} pl-9`}
                  />
                </div>
              </Field>
            </div>
          </div>
        )}

        {/* Activation flow */}
        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Tipo de cliente na ativação
          </p>
          <div className="grid grid-cols-2 gap-2">
            {([
              { value: 'frio', label: 'Frio', desc: 'Ainda não sabe da mensalidade' },
              { value: 'quente', label: 'Quente', desc: 'Já foi informado do R$29/mês' },
            ] as const).map((opt) => (
              <label
                key={opt.value}
                className={`flex flex-col gap-0.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                  activationFlow === opt.value
                    ? 'border-brand bg-brand/5'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="activationFlow"
                  value={opt.value}
                  checked={activationFlow === opt.value}
                  onChange={() => setActivationFlow(opt.value)}
                  className="sr-only"
                />
                <span className="text-sm font-semibold text-gray-800">{opt.label}</span>
                <span className="text-xs text-gray-500">{opt.desc}</span>
              </label>
            ))}
          </div>
        </div>

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

        {/* Create login — only on create + whatsapp flow */}
        {mode === 'create' && entryFlow === 'whatsapp' && (
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
