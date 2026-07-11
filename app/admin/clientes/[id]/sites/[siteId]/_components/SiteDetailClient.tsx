'use client'

import { useRef, useState, useTransition } from 'react'
import {
  updateSite,
  updateSiteStatus,
  createDomain,
  updateDomain,
  deleteDomain,
} from '../../actions'

type DnsStatus = 'pendente' | 'verificado' | 'falhou'
type SslStatus = 'pendente' | 'ativo' | 'falhou'

type Domain = {
  id: string
  domain: string
  dnsStatus: DnsStatus
  sslStatus: SslStatus
  verifiedAt: string | null
}

type Site = {
  id: string
  clientId: string
  siteUrl: string | null
  siteType: string
  templateUsed: string | null
  status: string
  filesZipUrl: string | null
  notes: string | null
  domains: Domain[]
}

const INPUT =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent'

const STATUS_OPTIONS = [
  { value: 'pendente_ativacao', label: 'Pendente de Ativação' },
  { value: 'online', label: 'Online' },
  { value: 'offline', label: 'Offline' },
  { value: 'manutencao', label: 'Em Manutenção' },
  { value: 'suspenso', label: 'Suspenso' },
]

const STATUS_COLOR: Record<string, string> = {
  pendente_ativacao: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  online: 'bg-green-100 text-green-700 border-green-200',
  offline: 'bg-gray-100 text-gray-500 border-gray-200',
  manutencao: 'bg-blue-100 text-blue-700 border-blue-200',
  suspenso: 'bg-red-100 text-red-700 border-red-200',
}

const DNS_OPTIONS: { value: DnsStatus; label: string }[] = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'verificado', label: 'Verificado' },
  { value: 'falhou', label: 'Falhou' },
]

const SSL_OPTIONS: { value: SslStatus; label: string }[] = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'ativo', label: 'Ativo' },
  { value: 'falhou', label: 'Falhou' },
]

// ─── Status updater ──────────────────────────────────────────────────────────

function StatusUpdater({
  siteId,
  clientId,
  currentStatus,
}: {
  siteId: string
  clientId: string
  currentStatus: string
}) {
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState(currentStatus)

  function handleChange(newStatus: string) {
    setStatus(newStatus)
    startTransition(() => updateSiteStatus(siteId, clientId, newStatus))
  }

  return (
    <div className="flex items-center gap-3">
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
          STATUS_COLOR[status] ?? 'bg-gray-100 text-gray-600 border-gray-200'
        }`}
      >
        {STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status}
      </span>
      <select
        value={status}
        onChange={(e) => handleChange(e.target.value)}
        disabled={isPending}
        className="border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand disabled:opacity-50"
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {isPending && <span className="text-xs text-gray-400">Salvando…</span>}
    </div>
  )
}

// ─── Domain row ──────────────────────────────────────────────────────────────

function DomainRow({
  domain,
  clientId,
  siteId,
}: {
  domain: Domain
  clientId: string
  siteId: string
}) {
  const [isPending, startTransition] = useTransition()
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [form, setForm] = useState({
    domain: domain.domain,
    dnsStatus: domain.dnsStatus,
    sslStatus: domain.sslStatus,
  })
  const [error, setError] = useState('')

  function handleSave() {
    setError('')
    startTransition(async () => {
      const result = await updateDomain(domain.id, clientId, siteId, form)
      if (result?.error) {
        setError(result.error)
      } else {
        setEditing(false)
      }
    })
  }

  function handleDelete() {
    startTransition(() => deleteDomain(domain.id, clientId, siteId))
  }

  const DNS_COLOR: Record<string, string> = {
    verificado: 'text-green-600',
    falhou: 'text-red-500',
    pendente: 'text-yellow-600',
  }
  const SSL_COLOR: Record<string, string> = {
    ativo: 'text-green-600',
    falhou: 'text-red-500',
    pendente: 'text-yellow-600',
  }

  if (editing) {
    return (
      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
        {error && (
          <p className="text-xs text-red-600">{error}</p>
        )}
        <div className="grid grid-cols-3 gap-2">
          <input
            type="text"
            value={form.domain}
            onChange={(e) => setForm((f) => ({ ...f, domain: e.target.value }))}
            className="col-span-3 border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
            placeholder="exemplo.com.br"
          />
          <div>
            <label className="block text-xs text-gray-500 mb-1">DNS</label>
            <select
              value={form.dnsStatus}
              onChange={(e) =>
                setForm((f) => ({ ...f, dnsStatus: e.target.value as DnsStatus }))
              }
              className="w-full border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none"
            >
              {DNS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">SSL</label>
            <select
              value={form.sslStatus}
              onChange={(e) =>
                setForm((f) => ({ ...f, sslStatus: e.target.value as SslStatus }))
              }
              className="w-full border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none"
            >
              {SSL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={handleSave}
              disabled={isPending}
              className="px-2 py-1 bg-brand text-brand-dark text-xs rounded-md hover:bg-brand-hover disabled:opacity-50"
            >
              Salvar
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-2 py-1 text-xs text-gray-500 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50/60">
      <span className="font-medium text-sm text-gray-800">{domain.domain}</span>
      <span className={`text-xs ${DNS_COLOR[domain.dnsStatus]}`}>
        DNS:{' '}
        {DNS_OPTIONS.find((o) => o.value === domain.dnsStatus)?.label}
      </span>
      <span className={`text-xs ${SSL_COLOR[domain.sslStatus]}`}>
        SSL:{' '}
        {SSL_OPTIONS.find((o) => o.value === domain.sslStatus)?.label}
      </span>
      <div className="ml-auto flex items-center gap-2">
        {confirmDelete ? (
          <span className="text-xs text-gray-500">
            Remover?{' '}
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="text-red-600 hover:underline"
            >
              Sim
            </button>
            {' / '}
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-gray-500 hover:underline"
            >
              Não
            </button>
          </span>
        ) : (
          <>
            <button
              onClick={() => setEditing(true)}
              className="text-xs text-gray-500 hover:text-gray-700 underline underline-offset-2"
            >
              Editar
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-xs text-red-400 hover:text-red-600 underline underline-offset-2"
            >
              Remover
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Add domain form ─────────────────────────────────────────────────────────

function AddDomainForm({
  siteId,
  clientId,
}: {
  siteId: string
  clientId: string
}) {
  const [isPending, startTransition] = useTransition()
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    domain: '',
    dnsStatus: 'pendente' as DnsStatus,
    sslStatus: 'pendente' as SslStatus,
  })

  function handleAdd() {
    setError('')
    startTransition(async () => {
      const result = await createDomain({ siteId, clientId, ...form })
      if (result?.error) {
        setError(result.error)
      } else {
        setForm({ domain: '', dnsStatus: 'pendente', sslStatus: 'pendente' })
        setShowForm(false)
      }
    })
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="text-xs text-brand-text hover:text-brand-dark underline underline-offset-2"
      >
        + Adicionar domínio
      </button>
    )
  }

  return (
    <div className="p-3 bg-brand-50 rounded-lg border border-brand-100 space-y-3">
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="grid grid-cols-3 gap-2">
        <input
          type="text"
          value={form.domain}
          onChange={(e) => setForm((f) => ({ ...f, domain: e.target.value }))}
          placeholder="exemplo.com.br"
          className="col-span-3 border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
        />
        <div>
          <label className="block text-xs text-gray-500 mb-1">DNS</label>
          <select
            value={form.dnsStatus}
            onChange={(e) =>
              setForm((f) => ({ ...f, dnsStatus: e.target.value as DnsStatus }))
            }
            className="w-full border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none"
          >
            {DNS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">SSL</label>
          <select
            value={form.sslStatus}
            onChange={(e) =>
              setForm((f) => ({ ...f, sslStatus: e.target.value as SslStatus }))
            }
            className="w-full border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none"
          >
            {SSL_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-2">
          <button
            onClick={handleAdd}
            disabled={isPending}
            className="px-3 py-1 bg-brand text-brand-dark text-xs rounded-md hover:bg-brand-hover disabled:opacity-50"
          >
            {isPending ? 'Salvando…' : 'Salvar'}
          </button>
          <button
            onClick={() => setShowForm(false)}
            className="px-2 py-1 text-xs text-gray-500 border border-gray-300 rounded-md hover:bg-white"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Update site info form ────────────────────────────────────────────────────

function UpdateSiteForm({ site }: { site: Site }) {
  const [isPending, startTransition] = useTransition()
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const fd = new FormData(formRef.current!)
    startTransition(async () => {
      const result = await updateSite(site.id, site.clientId, fd)
      if (result?.error) {
        setError(result.error)
      } else {
        setShowForm(false)
        setFileName(null)
      }
    })
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="text-xs text-gray-500 hover:text-gray-700 underline underline-offset-2"
      >
        Editar informações
      </button>
    )
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-3 mt-3">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
          <select name="siteType" defaultValue={site.siteType} className={INPUT}>
            <option value="mini_site">Mini Site</option>
            <option value="landing_page">Landing Page</option>
            <option value="institucional">Institucional</option>
            <option value="loja_virtual">Loja Virtual</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
          <select name="status" defaultValue={site.status} className={INPUT}>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">URL publicada</label>
        <input
          type="url"
          name="siteUrl"
          defaultValue={site.siteUrl ?? ''}
          placeholder="https://"
          className={INPUT}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Template</label>
        <input
          type="text"
          name="templateUsed"
          defaultValue={site.templateUsed ?? ''}
          className={INPUT}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Novo ZIP (opcional)
        </label>
        <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
          <span className="text-xs text-gray-400">
            {fileName ?? 'Selecionar arquivo .zip'}
          </span>
          <input
            type="file"
            name="filesZip"
            accept=".zip,application/zip"
            className="hidden"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
          />
        </label>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Observações</label>
        <textarea
          name="notes"
          defaultValue={site.notes ?? ''}
          rows={2}
          className={`${INPUT} resize-none`}
        />
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={isPending}
          className="px-3 py-1.5 bg-brand text-brand-dark text-xs rounded-lg hover:bg-brand-hover disabled:opacity-50"
        >
          {isPending ? 'Salvando…' : 'Salvar'}
        </button>
        <button
          type="button"
          onClick={() => { setShowForm(false); setFileName(null) }}
          className="px-3 py-1.5 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function SiteDetailClient({ site }: { site: Site }) {
  return (
    <div className="space-y-5">
      {/* Status */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Status</h3>
        <StatusUpdater
          siteId={site.id}
          clientId={site.clientId}
          currentStatus={site.status}
        />
      </div>

      {/* Site info */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">Informações do Site</h3>
          <UpdateSiteForm site={site} />
        </div>
        <dl className="space-y-2 text-sm">
          <div className="flex gap-3">
            <dt className="w-28 text-gray-500 shrink-0">Tipo</dt>
            <dd className="text-gray-900">
              {{
                mini_site: 'Mini Site',
                landing_page: 'Landing Page',
                institucional: 'Institucional',
                loja_virtual: 'Loja Virtual',
              }[site.siteType] ?? site.siteType}
            </dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-28 text-gray-500 shrink-0">URL</dt>
            <dd>
              {site.siteUrl ? (
                <a
                  href={site.siteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-text hover:underline break-all"
                >
                  {site.siteUrl}
                </a>
              ) : (
                <span className="text-gray-300">—</span>
              )}
            </dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-28 text-gray-500 shrink-0">Template</dt>
            <dd className="text-gray-900">
              {site.templateUsed ?? <span className="text-gray-300">—</span>}
            </dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-28 text-gray-500 shrink-0">Arquivo ZIP</dt>
            <dd>
              {site.filesZipUrl ? (
                <a
                  href={site.filesZipUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-text hover:underline text-xs"
                >
                  ↓ Baixar ZIP
                </a>
              ) : (
                <span className="text-gray-300">—</span>
              )}
            </dd>
          </div>
          {site.notes && (
            <div className="flex gap-3">
              <dt className="w-28 text-gray-500 shrink-0">Obs.</dt>
              <dd className="text-gray-600 italic">{site.notes}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Domains */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Domínios ({site.domains.length})
        </h3>
        <p className="text-xs text-gray-400 mb-3">
          Atualize os status de DNS e SSL manualmente após verificar na hospedagem.
        </p>
        <div className="space-y-2 mb-3">
          {site.domains.length === 0 && (
            <p className="text-sm text-gray-400">Nenhum domínio cadastrado.</p>
          )}
          {site.domains.map((d) => (
            <DomainRow
              key={d.id}
              domain={d}
              clientId={site.clientId}
              siteId={site.id}
            />
          ))}
        </div>
        <AddDomainForm siteId={site.id} clientId={site.clientId} />
      </div>
    </div>
  )
}
